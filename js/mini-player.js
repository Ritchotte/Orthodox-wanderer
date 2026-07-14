(function () {
    var audio   = new Audio();
    var playing = false;
    var state   = null;
    var idx     = 0;

    /* The blog's record player publishes its playlist on window.owTracks.
       This fallback keeps the mini-player working if that hasn't loaded. */
    var FALLBACK_TRACKS = [
        { title: "They Will Shade Us With Their Wings", artist: "Max Richter", src: "music/Max Richter - They Will Shade Us With Their Wings .mp3" },
        { title: "November",                            artist: "Max Richter", src: "music/Max Richter - November.mp3" },
        { title: "Landscape With Figure",               artist: "Max Richter", src: "music/Max Richter - Landscape With Figure (1922) - Elliott (128k).mp3" },
    ];

    function playlist() {
        return (window.owTracks && window.owTracks.length) ? window.owTracks : FALLBACK_TRACKS;
    }

    /* match a (possibly absolute, url-encoded) src back to a playlist index */
    function indexOfSrc(src) {
        var list = playlist();
        var name = decodeURIComponent(src || '').split('/').pop();
        for (var i = 0; i < list.length; i++) {
            if (decodeURIComponent(list[i].src).split('/').pop() === name) return i;
        }
        return -1;
    }

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
            '<button class="mp-btn mp-skip" id="mp-prev" title="Previous">&#9664;&#9664;</button>' +
            '<button class="mp-btn" id="mp-play">&#9654;</button>' +
            '<button class="mp-btn mp-skip" id="mp-next" title="Next">&#9654;&#9654;</button>' +
            '<button class="mp-btn mp-btn-close" id="mp-close">&#10005;</button>' +
        '</div>';
    document.body.appendChild(wrap);

    var playBtn  = document.getElementById('mp-play');
    var prevBtn  = document.getElementById('mp-prev');
    var nextBtn  = document.getElementById('mp-next');
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

    /* load a track by index (wraps around); plays it when `play` is true */
    function loadTrack(i, play) {
        var list = playlist();
        idx = (i % list.length + list.length) % list.length;
        var t = list[idx];
        state = t;
        audio.src = t.src;
        titleEl.textContent  = t.title;
        artistEl.textContent = t.artist;
        if (play) doPlay();
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
        /* preload the first track so a tap on "Play" starts instantly */
        loadTrack(0, false);
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
            var found = indexOfSrc(s.src);
            idx = found >= 0 ? found : 0;
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

    prevBtn.addEventListener('click', function () { loadTrack(idx - 1, playing); });
    nextBtn.addEventListener('click', function () { loadTrack(idx + 1, playing); });

    closeBtn.addEventListener('click', function () {
        if (isPopup()) { dock(); return; }   /* tuck into the corner, paused */
        doPause();
        hide();
        state = null;
    });

    /* roll on to the next track so all three play through */
    audio.addEventListener('ended', function () { loadTrack(idx + 1, true); });

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
