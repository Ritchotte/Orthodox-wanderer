(function () {
    function isInternal(href) {
        if (!href) return false;
        if (href.startsWith('http') || href.startsWith('//') ||
            href.startsWith('mailto:') || href.startsWith('tel:')) return false;
        if (href === '#') return false;
        return true;
    }

    function pageName(url) {
        return (url || '').split('#')[0].split('/').pop() || 'index.html';
    }

    function navigate(url) {
        var page    = pageName(url);
        var anchor  = url.split('#')[1];
        var fetchUrl = url.split('#')[0] || 'index.html';
        var fromPage = pageName(window.location.href);

        document.dispatchEvent(new CustomEvent('ow:beforenavigate', {
            detail: { from: fromPage, to: page }
        }));

        fetch(fetchUrl)
            .then(function (r) { return r.text(); })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
                document.title = doc.title;

                document.querySelectorAll('#main-nav a').forEach(function (a) {
                    a.classList.toggle('nav-active', a.getAttribute('href') === fetchUrl);
                });

                history.pushState({ url: url }, doc.title, url);

                if (anchor) {
                    setTimeout(function () {
                        var el = document.getElementById(anchor);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 60);
                } else {
                    window.scrollTo(0, 0);
                }

                document.dispatchEvent(new CustomEvent('ow:navigate', {
                    detail: { page: page }
                }));

                if (page === 'blog.html' && typeof window.owRecordPlayerInit === 'function') {
                    window.owRecordPlayerInit();
                }
            })
            .catch(function () {
                window.location.href = url;
            });
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest('a');
        if (!a || a.target === '_blank') return;
        var href = a.getAttribute('href');
        if (!isInternal(href)) return;
        e.preventDefault();
        navigate(href);
    });

    window.addEventListener('popstate', function (e) {
        navigate(e.state ? (e.state.url || window.location.href) : window.location.href);
    });

    history.replaceState({ url: window.location.href }, document.title, window.location.href);
}());
