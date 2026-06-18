(function () {
    var header = document.querySelector('[data-site-header]');
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
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
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                schedule();
            });
        });
        show(0);
        schedule();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var keyword = panel.querySelector('[data-filter-keyword]');
        var category = panel.querySelector('[data-filter-category]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var status = panel.querySelector('[data-filter-status]');
        var scope = document.querySelector('[data-search-scope]');
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (keyword && initialQuery) {
            keyword.value = initialQuery;
        }

        function normalized(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardMatches(card) {
            var q = normalized(keyword ? keyword.value : '');
            var cat = normalized(category ? category.value : '');
            var y = normalized(year ? year.value : '');
            var t = normalized(type ? type.value : '');
            var terms = normalized(card.getAttribute('data-terms'));
            var cardCat = normalized(card.getAttribute('data-category'));
            var cardYear = normalized(card.getAttribute('data-year'));
            var cardType = normalized(card.getAttribute('data-type'));
            return (!q || terms.indexOf(q) !== -1) &&
                (!cat || cardCat === cat) &&
                (!y || cardYear === y) &&
                (!t || cardType === t);
        }

        function apply() {
            if (!cards.length) {
                return;
            }
            var active = 0;
            cards.forEach(function (card) {
                var matched = cardMatches(card);
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    active += 1;
                }
            });
            if (status) {
                var hasFilter = normalized(keyword ? keyword.value : '') ||
                    normalized(category ? category.value : '') ||
                    normalized(year ? year.value : '') ||
                    normalized(type ? type.value : '');
                status.textContent = hasFilter ? '筛选到 ' + active + ' 部影片。' : '输入关键词或选择条件，快速筛选影片。';
            }
        }

        [keyword, category, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        var form = panel.querySelector('[data-search-form]');
        if (form && cards.length) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
        }

        apply();
    });
})();
