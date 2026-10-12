/* eslint-disable no-undef */
const menuBtn = document.querySelector(".header__menu_btn");
const nav = document.querySelector(".navlinks__wrapper");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});
