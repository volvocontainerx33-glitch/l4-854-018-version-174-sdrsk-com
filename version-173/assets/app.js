(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navPanel = document.querySelector('.nav-panel');

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      navPanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        schedule();
      });
    }

    slider.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });

    slider.addEventListener('mouseleave', schedule);
    showSlide(0);
    schedule();
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var input = filterForm.querySelector('[data-filter-input]');
    var region = filterForm.querySelector('[data-filter-region]');
    var year = filterForm.querySelector('[data-filter-year]');
    var reset = filterForm.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchRegion = !selectedRegion || cardRegion === selectedRegion;
        var matchYear = !selectedYear || cardYear === selectedYear;
        var isVisible = matchKeyword && matchRegion && matchYear;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, applyFilters);
      }
    });

    if (region) {
      region.addEventListener('change', applyFilters);
    }

    if (year) {
      year.addEventListener('change', applyFilters);
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        if (region) {
          region.value = '';
        }

        if (year) {
          year.value = '';
        }

        applyFilters();
      });
    }

    applyFilters();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    var url = frame.getAttribute('data-hls');
    var initialized = false;
    var hlsInstance = null;

    function prepare() {
      if (initialized || !video || !url) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();
      frame.classList.add('is-playing');
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          frame.classList.remove('is-playing');
        }
      });

      video.addEventListener('click', function () {
        prepare();
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  });
})();
