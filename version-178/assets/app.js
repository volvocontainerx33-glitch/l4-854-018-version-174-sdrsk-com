(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll(".global-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }


  function initCategoryNavigation() {
    var chips = document.querySelectorAll("[data-filter-chip]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var slug = chip.getAttribute("data-filter-chip");
        if (slug) {
          window.location.href = "./category-" + slug + ".html";
        }
      });
    });
  }

  function initLocalFilter() {
    var input = document.querySelector(".local-filter-input");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var empty = document.querySelector(".empty-state");
    var items = Array.prototype.slice.call(list.children);
    function apply() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-wrap\" href=\"./" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-glow\"></span>" +
      "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"./" + movie.url + "\">" + escapeHtml(movie.title) + "</a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.renderSearchPage = function () {
    var data = window.movieSearchData || [];
    var form = document.querySelector(".search-page-form");
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var empty = document.getElementById("searchEmpty");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-search-category]"));
    var params = new URLSearchParams(window.location.search);
    var activeCategory = "all";

    if (!input || !results) {
      return;
    }
    input.value = params.get("q") || "";

    function render() {
      var query = input.value.trim().toLowerCase();
      var filtered = data.filter(function (movie) {
        var inCategory = activeCategory === "all" || movie.category === activeCategory;
        var matched = !query || movie.search.indexOf(query) !== -1;
        return inCategory && matched;
      }).slice(0, 240);
      results.innerHTML = filtered.map(createCard).join("");
      if (empty) {
        empty.hidden = filtered.length !== 0;
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var url = "./search.html";
        if (input.value.trim()) {
          url += "?q=" + encodeURIComponent(input.value.trim());
        }
        history.replaceState(null, "", url);
        render();
      });
    }
    input.addEventListener("input", render);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-search-category") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        render();
      });
    });
    render();
  };

  window.initPlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var loaded = false;
    var hlsInstance = null;
    if (!video) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  onReady(function () {
    initMenu();
    initSearchForms();
    initHero();
    initCategoryNavigation();
    initLocalFilter();
  });
})();
