(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        start();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var zones = Array.prototype.slice.call(document.querySelectorAll("[data-filter-zone]"));
    zones.forEach(function (zone) {
      var input = zone.querySelector("[data-search]");
      var selects = Array.prototype.slice.call(zone.querySelectorAll("[data-select]"));
      var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-card]"));
      var empty = zone.querySelector("[data-empty]");
      if (!cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function textOf(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var active = 0;
        cards.forEach(function (card) {
          var visible = true;
          if (term && textOf(card).indexOf(term) === -1) {
            visible = false;
          }
          selects.forEach(function (select) {
            var key = select.getAttribute("data-select");
            var value = select.value;
            if (value && (card.getAttribute("data-" + key) || "").indexOf(value) === -1) {
              visible = false;
            }
          });
          card.style.display = visible ? "" : "none";
          if (visible) {
            active += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", active === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
