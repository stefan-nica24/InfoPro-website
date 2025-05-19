//mobile menu
function onClickOutside(ele, cb) {
  document.addEventListener('click', event => {
    if (!ele.contains(event.target)) 
      cb();
  });
};
function onClickInside(ele, cb) {
  document.addEventListener('click', event => {
    if (ele.contains(event.target)) 
      cb();
  });
};
function closeMobileMenu(hamburgerButton, mobileMenu){
    mobileMenu.classList.toggle('active');
    hamburgerButton.style.display = 'block';
}
function openMobileMenu(hamburgerButton, mobileMenu){
  mobileMenu.classList.toggle('active');
  hamburgerButton.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.querySelector('.hamburger-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closebutton = document.querySelector('.clsbtn');
    const closebutton1 = document.querySelector('.clsbtn1');

    closebutton1.addEventListener('click', () => 
        closeMobileMenu(hamburgerButton, mobileMenu));
    closebutton.addEventListener('click', () => 
        closeMobileMenu(hamburgerButton, mobileMenu));
    hamburgerButton.addEventListener('click', () => 
        openMobileMenu(hamburgerButton, mobileMenu));
    
    //onClickInside(hamburgerButton, () => setTimeout(openMobileMenu(hamburgerButton, mobileMenu), 3000));
    //onClickOutside(mobileMenu, () => openMobileMenu(hamburgerButton, mobileMenu));
});

let mybutton = document.getElementById("myBtn");
window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  if ((document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
var modal = document.getElementById('id01');
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function copyURI(evt) {
  evt.preventDefault();
  navigator.clipboard.writeText(evt.target.getAttribute('href')).then(() => {
    /* clipboard successfully set */
  }, () => {
    /* clipboard write failed */
  });
  document.getElementById("custom-tooltip").style.display = "block";
  setTimeout( function() {
    document.getElementById("custom-tooltip").style.display = "none";
}, 1000);
}
