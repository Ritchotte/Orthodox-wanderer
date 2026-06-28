(function () {
    var audio   = new Audio();
    var playing = false;
    var state   = null;

    /* track offered when the player introduces itself on first arrival */
    var DEFAULT_TRACK = {
        src:    'music/Max Richter - November.mp3',
        title:  'November',
        artist: 'Max Richter'
    };

    /* ── widget ── */
    var wrap = document.createElement('div');
    wrap.id = 'mini-player';
    wrap.style.display = 'none';
    wrap.innerHTML =
        '<div class="mp-prompt">' +
            '<span class="mp-prompt-note">&#9835;</span>' +
            '<p class="mp-prompt-title">Care for some music?</p>' +
            '<p class="mp-prompt-sub">A little Max Richter to wander by.</p>' +
        '</div>' +
        '<div class="mp-info">' +
            '<span class="mp-note">&#9835;</span>' +
            '<div class="mp-text">' +
                '<span class="mp-title"  id="mp-title-text"></span>' +
                '<span class="mp-artist" id="mp-artist-text"></span>' +
            '</div>' +
        '</div>' +
        '<div class="mp-controls">' +
            '<button class="mp-btn" id="mp-play">&#9654;</button>' +
            '<button class="mp-btn mp-btn-close" id="mp-close">&#10005;</button>' +
        '</div>';
    document.body.appendChild(wrap);

    var playBtn  = document.getElementById('mp-play');
    var closeBtn = document.getElementById('mp-close');
    var titleEl  = document.getElementById('mp-title-text');
    var artistEl = document.getElementById('mp-artist-text');

    function doPlay() {
        audio.play().catch(function () {});
        playing = true;
        playBtn.innerHTML = '&#9646;&#9646;';
        wrap.classList.add('mp-playing');
    }

    function doPause() {
        audio.pause();
        playing = false;
        playBtn.innerHTML = '&#9654;';
        wrap.classList.remove('mp-playing');
    }

    function showWith(s) {
        state = s;
        titleEl.textContent  = s.title;
        artistEl.textContent = s.artist;
        wrap.style.display   = '';
    }

    function hide() { wrap.style.display = 'none'; }

    /* ── first-arrival popup ── */
    function isPopup() { return wrap.classList.contains('mp-popup'); }

    function openPopup() {
        if (isPopup()) return;
        /* preload the default track so a tap on "Play" starts instantly */
        state = DEFAULT_TRACK;
        audio.src = DEFAULT_TRACK.src;
        titleEl.textContent  = DEFAULT_TRACK.title;
        artistEl.textContent = DEFAULT_TRACK.artist;
        playBtn.innerHTML  = 'Play';
        closeBtn.innerHTML = 'Not now';
        wrap.classList.add('mp-popup');
        wrap.style.display = '';
        /* next frame so the entrance transition runs */
        requestAnimationFrame(function () { wrap.classList.add('mp-popup-in'); });
    }

    /* settle from the centred popup down into the corner */
    function dock() {
        if (!isPopup()) return;
        playBtn.innerHTML  = playing ? '&#9646;&#9646;' : '&#9654;';
        closeBtn.innerHTML = '&#10005;';
        wrap.classList.add('mp-docking');
        setTimeout(function () {
            wrap.classList.remove('mp-popup', 'mp-popup-in', 'mp-docking');
        }, 220);
    }

    function seen() {
        try { return sessionStorage.getItem('ow-mp-seen') === '1'; } catch (e) { return false; }
    }
    function markSeen() {
        try { sessionStorage.setItem('ow-mp-seen', '1'); } catch (e) {}
    }

    function maybeOpenPopup(page) {
        if (page === 'blog.html') return;   /* full record player already lives there */
        if (seen()) return;
        markSeen();
        setTimeout(openPopup, 900);
    }

    /* ── public API used by record-player.js ── */
    window.owMiniPlayer = {
        handoff: function (s) {
            if (isPopup()) dock();
            audio.src         = s.src;
            audio.currentTime = s.time || 0;
            showWith(s);
            if (s.playing) doPlay();
        },
        hide:      hide,
        isPlaying: function () { return playing; }
    };

    /* ── controls ── */
    playBtn.addEventListener('click', function () {
        if (isPopup()) { dock(); doPlay(); return; }
        playing ? doPause() : doPlay();
    });

    closeBtn.addEventListener('click', function () {
        if (isPopup()) { dock(); return; }   /* tuck into the corner, paused */
        doPause();
        hide();
        state = null;
    });

    audio.addEventListener('ended', function () { doPause(); });

    /* ── react to AJAX navigation ── */
    document.addEventListener('ow:navigate', function (e) {
        if (isPopup()) dock();               /* navigating past the popup settles it */
        if (e.detail.page === 'blog.html') {
            hide();                          /* main player takes over on the blog */
            return;
        }
        maybeOpenPopup(e.detail.page);       /* offer it on the first non-blog page */
    });

    /* ── first full page load ── */
    function currentPage() {
        return (window.location.pathname.split('/').pop() || 'index.html');
    }
    maybeOpenPopup(currentPage());
}());
