// mobile menu
function closeMobileMenu(hamburgerButton, mobileMenu) {
  mobileMenu.classList.remove('active');
  hamburgerButton.classList.remove('menu-open');
}

function openMobileMenu(hamburgerButton, mobileMenu) {
  mobileMenu.classList.add('active');
  hamburgerButton.classList.add('menu-open');
}

// demo account system for this static website
const ACCOUNT_USERS_KEY = 'infopro_users';
const ACCOUNT_CURRENT_USER_KEY = 'infopro_current_user';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_USERS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(ACCOUNT_USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    const data = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return `fallback-${hash}`;
}

function getCurrentUserEmail() {
  return sessionStorage.getItem(ACCOUNT_CURRENT_USER_KEY) || localStorage.getItem(ACCOUNT_CURRENT_USER_KEY);
}

function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return getUsers().find((user) => user.email === email) || null;
}

function setCurrentUser(email, remember) {
  sessionStorage.removeItem(ACCOUNT_CURRENT_USER_KEY);
  localStorage.removeItem(ACCOUNT_CURRENT_USER_KEY);

  if (remember) {
    localStorage.setItem(ACCOUNT_CURRENT_USER_KEY, email);
  } else {
    sessionStorage.setItem(ACCOUNT_CURRENT_USER_KEY, email);
  }
}

function clearLoginForms() {
  document.querySelectorAll('.account-login-form').forEach((form) => {
    form.reset();
    const messageBox = form.querySelector('.login-message');

    if (messageBox) {
      messageBox.textContent = '';
      messageBox.classList.remove('success', 'error');
    }
  });
}

function logoutUser() {
  sessionStorage.removeItem(ACCOUNT_CURRENT_USER_KEY);
  localStorage.removeItem(ACCOUNT_CURRENT_USER_KEY);
  clearLoginForms();
  updateAccountUI();
}

function showAccountMessage(form, selector, message, type) {
  let messageBox = form.querySelector(selector);
  if (!messageBox) {
    messageBox = document.createElement('p');
    messageBox.className = selector.replace('.', '');
    form.querySelector('.container')?.appendChild(messageBox);
  }

  messageBox.textContent = message;
  messageBox.classList.remove('success', 'error');
  messageBox.classList.add(type);
}

function closeLoginModal() {
  const modal = document.getElementById('id01');
  if (modal) {
    modal.style.display = 'none';
  }
}

function rememberOriginalNavLink(link) {
  if (!link.dataset.originalHtml) {
    link.dataset.originalHtml = link.innerHTML;
    link.dataset.originalHref = link.getAttribute('href') || '';
    link.dataset.originalOnclick = link.getAttribute('onclick') || '';
  }
}

function restoreNavLink(link) {
  link.innerHTML = link.dataset.originalHtml || link.innerHTML;
  link.onclick = null;

  if (link.dataset.originalHref) {
    link.setAttribute('href', link.dataset.originalHref);
  } else {
    link.removeAttribute('href');
  }

  if (link.dataset.originalOnclick) {
    link.setAttribute('onclick', link.dataset.originalOnclick);
  } else {
    link.removeAttribute('onclick');
  }

  link.classList.remove('account-user-btn', 'logout-btn');
}

function updateAccountUI() {
  const currentUser = getCurrentUser();
  const loginLinks = document.querySelectorAll('.main-menu a[onclick*="id01"], .mobile-menu a[onclick*="id01"], .main-menu .account-user-btn, .mobile-menu .account-user-btn');
  const signupLinks = document.querySelectorAll('.main-menu a[href="signup.html"], .mobile-menu a[href="signup.html"], .main-menu .logout-btn, .mobile-menu .logout-btn');

  loginLinks.forEach(rememberOriginalNavLink);
  signupLinks.forEach(rememberOriginalNavLink);

  if (!currentUser) {
    loginLinks.forEach(restoreNavLink);
    signupLinks.forEach(restoreNavLink);
    return;
  }

  loginLinks.forEach((link) => {
    link.removeAttribute('onclick');
    link.removeAttribute('href');
    link.classList.add('account-user-btn');
    link.innerHTML = `<i class="fas fa-user-check"></i> Salut, ${currentUser.username}`;
    link.onclick = (event) => event.preventDefault();
  });

  signupLinks.forEach((link) => {
    link.removeAttribute('onclick');
    link.removeAttribute('href');
    link.classList.add('logout-btn');
    link.innerHTML = '<i class="fas fa-right-from-bracket"></i> Log out';
    link.onclick = (event) => {
      event.preventDefault();
      logoutUser();
      closeMobileMenuIfOpen();
    };
  });
}

function closeMobileMenuIfOpen() {
  const hamburgerButton = document.querySelector('.hamburger-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburgerButton && mobileMenu) {
    closeMobileMenu(hamburgerButton, mobileMenu);
  }
}

function setupLoginForms() {
  document.querySelectorAll('.account-login-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = normalizeEmail(form.querySelector('[name="uname"]')?.value);
      const password = form.querySelector('[name="psw"]')?.value || '';
      const remember = Boolean(form.querySelector('[name="remember"]')?.checked);
      const users = getUsers();
      const user = users.find((item) => item.email === email);

      if (!email || !password) {
        showAccountMessage(form, '.login-message', 'Completați email-ul și parola.', 'error');
        return;
      }

      if (!user || user.passwordHash !== await hashPassword(password)) {
        showAccountMessage(form, '.login-message', 'Email-ul sau parola este greșită.', 'error');
        return;
      }

      setCurrentUser(user.email, remember);
      showAccountMessage(form, '.login-message', `Bine ai revenit, ${user.username}!`, 'success');
      form.reset();
      updateAccountUI();
      setTimeout(closeLoginModal, 500);
    });
  });
}

function setupLoginModalOpeners() {
  document.querySelectorAll('.main-menu a[onclick*="id01"], .mobile-menu a[onclick*="id01"], .btn-secondary[href="signup.html"]').forEach((link) => {
    link.addEventListener('click', () => {
      clearLoginForms();
    });
  });
}

function getPasswordRequirements(password) {
  return {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
}

function isStrongPassword(password) {
  return Object.values(getPasswordRequirements(password)).every(Boolean);
}

function updatePasswordChecklist(form) {
  const passwordInput = form.querySelector('[name="psw"]');
  const checklist = form.querySelector('.password-rules');
  if (!passwordInput || !checklist) return;

  const password = passwordInput.value || '';
  const requirements = getPasswordRequirements(password);
  checklist.classList.add('password-rules-visible');

  Object.entries(requirements).forEach(([rule, passed]) => {
    const item = checklist.querySelector(`[data-rule="${rule}"]`);
    const checkbox = item?.querySelector('input[type="checkbox"]');
    if (!item || !checkbox) return;

    checkbox.checked = passed;
    item.classList.toggle('password-rule-valid', passed);
  });
}

function setupSignupForms() {
  document.querySelectorAll('.account-signup-form').forEach((form) => {
    const passwordInput = form.querySelector('[name="psw"]');

    if (passwordInput) {
      updatePasswordChecklist(form);
      passwordInput.addEventListener('input', () => updatePasswordChecklist(form));
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = String(form.querySelector('[name="username"]')?.value || '').trim();
      const email = normalizeEmail(form.querySelector('[name="email"]')?.value);
      const password = form.querySelector('[name="psw"]')?.value || '';
      const repeatedPassword = form.querySelector('[name="psw-repeat"]')?.value || '';
      const remember = Boolean(form.querySelector('[name="remember"]')?.checked);
      const users = getUsers();

      updatePasswordChecklist(form);

      if (username.length < 3) {
        showAccountMessage(form, '.signup-message', 'Numele de utilizator trebuie să aibă cel puțin 3 caractere.', 'error');
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        showAccountMessage(form, '.signup-message', 'Introduceți o adresă de email validă.', 'error');
        return;
      }

      if (!isStrongPassword(password)) {
        showAccountMessage(form, '.signup-message', 'Parola trebuie să aibă cel puțin 8 caractere, cel puțin 1 număr și cel puțin 1 caracter special.', 'error');
        return;
      }

      if (password !== repeatedPassword) {
        showAccountMessage(form, '.signup-message', 'Parolele nu coincid.', 'error');
        return;
      }

      if (users.some((user) => user.email === email)) {
        showAccountMessage(form, '.signup-message', 'Există deja un cont cu acest email.', 'error');
        return;
      }

      if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        showAccountMessage(form, '.signup-message', 'Acest nume de utilizator este deja folosit.', 'error');
        return;
      }

      const newUser = {
        username,
        email,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);
      setCurrentUser(email, remember);
      showAccountMessage(form, '.signup-message', 'Contul a fost creat cu succes! Te redirecționăm...', 'success');
      form.reset();
      updatePasswordChecklist(form);
      updateAccountUI();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButton = document.querySelector('.hamburger-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeButtons = document.querySelectorAll('.clsbtn, .clsbtn1');

  if (hamburgerButton && mobileMenu) {
    hamburgerButton.addEventListener('click', () => openMobileMenu(hamburgerButton, mobileMenu));

    closeButtons.forEach((button) => {
      button.addEventListener('click', () => closeMobileMenu(hamburgerButton, mobileMenu));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 885) {
        closeMobileMenu(hamburgerButton, mobileMenu);
        hamburgerButton.style.removeProperty('display');
      }
    });
  }

  setupLoginForms();
  setupLoginModalOpeners();
  setupSignupForms();
  updateAccountUI();

  const modal = document.getElementById('id01');
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeLoginModal();
    }
  });
});

let mybutton = document.getElementById('myBtn');
window.onscroll = function() { scrollFunction(); };
function scrollFunction() {
  if (!mybutton) return;

  if ((document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)) {
    mybutton.style.display = 'inline-block';
  } else {
    mybutton.style.display = 'none';
  }
}
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function copyURI(evt) {
  evt.preventDefault();
  navigator.clipboard.writeText(evt.target.getAttribute('href')).then(() => {
    /* clipboard successfully set */
  }, () => {
    /* clipboard write failed */
  });

  const tooltip = document.getElementById('custom-tooltip');
  if (!tooltip) return;

  tooltip.style.display = 'block';
  setTimeout(function() {
    tooltip.style.display = 'none';
  }, 1000);
}
