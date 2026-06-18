(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });
    show(0);
    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search-input"));
    if (!inputs.length || !window.MOVIE_INDEX) {
      return;
    }
    inputs.forEach(function(input) {
      var panel = input.parentElement.querySelector(".search-panel");
      if (!panel) {
        return;
      }
      input.addEventListener("input", function() {
        var query = normalizeText(input.value);
        if (query.length < 1) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = window.MOVIE_INDEX.filter(function(item) {
          return normalizeText(item.title + " " + item.year + " " + item.type + " " + item.genre + " " + item.region + " " + item.category).indexOf(query) !== -1;
        }).slice(0, 9);
        if (!results.length) {
          panel.innerHTML = '<div class="search-result"><strong>未找到匹配影片</strong><span>换一个关键词试试</span></div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = results.map(function(item) {
          return '<a class="search-result" href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml([item.year, item.type, item.region].filter(Boolean).join(" · ")) + '</span></a>';
        }).join("");
        panel.classList.add("is-open");
      });
      document.addEventListener("click", function(event) {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var searchInput = document.querySelector(".page-search");
    var yearSelect = document.querySelector(".filter-year");
    var typeSelect = document.querySelector(".filter-type");
    var emptyState = document.querySelector(".empty-state");
    if (!cards.length || (!searchInput && !yearSelect && !typeSelect)) {
      return;
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.filter(Boolean).sort().reverse().forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    var years = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-year") || "";
    })));
    var types = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-type") || "";
    }))).sort();

    fillSelect(yearSelect, years);
    fillSelect(typeSelect, types);

    function apply() {
      var query = normalizeText(searchInput ? searchInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" "));
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          ok = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function() {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initFilters();
  });

  window.initMoviePlayer = function(videoId, coverId, streamUrl) {
    ready(function() {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      if (!video || !cover || !streamUrl) {
        return;
      }
      var prepared = false;
      var hlsInstance = null;

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 20,
            backBufferLength: 30
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        prepare();
        cover.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function() {
            cover.classList.remove("is-hidden");
          });
        }
      }

      cover.addEventListener("click", start);
      video.addEventListener("click", function() {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
