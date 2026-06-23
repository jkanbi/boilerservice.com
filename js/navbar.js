(function () {
  function toggleMenu() {
    var menu = document.querySelector(".navbar-menu");
    var toggle = document.querySelector(".navbar-toggle");
    if (!menu || !toggle) {
      return;
    }

    var open = !menu.classList.contains("active");
    menu.classList.toggle("active", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function closeMenu() {
    var menu = document.querySelector(".navbar-menu");
    var toggle = document.querySelector(".navbar-toggle");
    if (!menu || !toggle || !menu.classList.contains("active")) {
      return;
    }

    menu.classList.remove("active");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  window.toggleMenu = toggleMenu;

  function init() {
    document.querySelectorAll(".navbar-menu a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".site-header")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
