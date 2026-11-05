"use strict";

// Інтерактивність портфоліо для варіанта 10.
// Працює без сторонніх бібліотек та інтернет-з'єднання.
(function () {
  const themeButton = document.querySelector("#theme-toggle");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll("[data-category]");
  const filterCount = document.querySelector("#filter-count");

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      const dark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      themeButton.setAttribute("aria-pressed", String(dark));
      themeButton.setAttribute("aria-label", dark ? "Увімкнути світлу тему" : "Увімкнути темну тему");
      themeButton.firstChild.textContent = dark ? "☀ " : "☾ ";
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;
      let visible = 0;

      filterButtons.forEach(function (item) {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach(function (card) {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (filterCount) {
        filterCount.textContent = "Показано робіт: " + visible;
      }
    });
  });
})();
