(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var header = document.querySelector(".site-header");

    if (!toggle || !header) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        activate(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupCatalog(catalog) {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
    var searchInput = panel ? panel.querySelector("[data-search-input]") : null;
    var categoryFilter = panel ? panel.querySelector("[data-category-filter]") : null;
    var regionFilter = panel ? panel.querySelector("[data-region-filter]") : null;
    var typeFilter = panel ? panel.querySelector("[data-type-filter]") : null;
    var yearFilter = panel ? panel.querySelector("[data-year-filter]") : null;
    var resultCount = document.querySelector("[data-result-count]");
    var emptyState = document.querySelector("[data-empty-state]");
    var loadMore = document.querySelector("[data-load-more]");
    var pageSize = Number(catalog.getAttribute("data-page-size") || "120");
    var visibleLimit = pageSize;
    var matchedCards = [];

    function optionValue(select) {
      return select ? normalize(select.value) : "all";
    }

    function matches(card) {
      var query = searchInput ? normalize(searchInput.value) : "";
      var category = optionValue(categoryFilter);
      var region = optionValue(regionFilter);
      var type = optionValue(typeFilter);
      var year = optionValue(yearFilter);
      var blob = normalize(card.getAttribute("data-search"));
      var cardCategory = normalize(card.getAttribute("data-category"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardYear = normalize(card.getAttribute("data-year"));

      if (query && blob.indexOf(query) === -1) {
        return false;
      }
      if (category !== "all" && cardCategory !== category) {
        return false;
      }
      if (region !== "all" && cardRegion !== region) {
        return false;
      }
      if (type !== "all" && cardType !== type) {
        return false;
      }
      if (year !== "all" && cardYear !== year) {
        return false;
      }
      return true;
    }

    function render() {
      matchedCards = [];
      cards.forEach(function (card) {
        var isMatch = matches(card);
        card.classList.toggle("is-hidden-by-filter", !isMatch);
        if (isMatch) {
          matchedCards.push(card);
        }
      });

      matchedCards.forEach(function (card, index) {
        card.classList.toggle("is-hidden-by-limit", index >= visibleLimit);
      });

      if (resultCount) {
        resultCount.textContent = String(matchedCards.length);
      }
      if (emptyState) {
        emptyState.hidden = matchedCards.length > 0;
      }
      if (loadMore) {
        loadMore.hidden = visibleLimit >= matchedCards.length;
      }
    }

    function resetAndRender() {
      visibleLimit = pageSize;
      render();
    }

    [searchInput, categoryFilter, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", resetAndRender);
      control.addEventListener("change", resetAndRender);
    });

    if (loadMore) {
      loadMore.addEventListener("click", function () {
        visibleLimit += pageSize;
        render();
      });
    }

    render();
  }

  ready(function () {
    setupNavigation();
    setupHero();
    Array.prototype.slice.call(document.querySelectorAll("[data-catalog]")).forEach(setupCatalog);
  });
})();
