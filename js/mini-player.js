(function () {
    var audio   = new Audio();
    var playing = false;
    var state   = null;

    /* ── widget ── */
    var wrap = document.createElement('div');
    wrap.id = 'mini-player';
    wrap.style.display = 'none';
    wrap.innerHTML =
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

    /* ── public API used by record-player.js ── */
    window.owMiniPlayer = {
        handoff: function (s) {
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
        playing ? doPause() : doPlay();
    });

    document.getElementById('mp-close').addEventListener('click', function () {
        doPause();
        hide();
        state = null;
    });

    audio.addEventListener('ended', function () { doPause(); });

    /* ── hide on blog page (main player takes over), show elsewhere ── */
    document.addEventListener('ow:navigate', function (e) {
        if (e.detail.page === 'blog.html') {
            hide();
        }
        /* if playing, stay visible on all other pages */
    });
}());
