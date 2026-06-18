(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var root = panel.parentElement;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));
      var search = panel.querySelector("[data-search-input]");
      var genre = panel.querySelector("[data-genre-filter]");
      var year = panel.querySelector("[data-year-filter]");

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var genreValue = genre ? genre.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value.trim() : "";

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1 && text.indexOf(genreValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.classList.toggle("is-filtered-out", !matched);
        });
      }

      [search, genre, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  window.initMoviePlayer = function (id, source) {
    var box = document.getElementById(id);
    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var poster = box.querySelector(".player-poster");
    var playButton = box.querySelector(".player-play");
    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      if (poster) {
        poster.classList.add("is-hidden");
      }
      loadSource().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      });
    }

    if (poster) {
      poster.addEventListener("click", play);
    }
    if (playButton) {
      playButton.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
