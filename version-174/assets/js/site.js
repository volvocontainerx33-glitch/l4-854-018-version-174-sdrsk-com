(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === index);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === index);
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
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-area]').forEach(function (area) {
        var input = area.querySelector('.js-search');
        var buttons = Array.prototype.slice.call(area.querySelectorAll('.js-filter-button'));
        var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
        var empty = area.querySelector('.js-empty');
        var activeFilter = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(' '));
                var category = card.dataset.category || '';
                var filterMatch = activeFilter === 'all' || category === activeFilter;
                var searchMatch = !query || haystack.indexOf(query) !== -1;
                var shouldShow = filterMatch && searchMatch;

                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';

                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });

                apply();
            });
        });

        apply();
    });

    document.querySelectorAll('.js-player').forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');

        if (!video || !overlay) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var loaded = false;
        var hlsInstance = null;

        function attachStream() {
            if (loaded || !stream) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            } else {
                video.src = stream;
            }
        }

        function play() {
            attachStream();
            player.classList.add('is-playing');
            video.play().catch(function () {});
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!loaded) {
                play();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                player.classList.remove('is-playing');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
