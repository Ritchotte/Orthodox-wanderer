var owRecordPlayerInit = (function () {

    var tracks = [
        { title: "November",                            artist: "Max Richter", src: "music/Max Richter - November.mp3" },
        { title: "Landscape With Figure",               artist: "Max Richter", src: "music/Max Richter - Landscape With Figure (1922) - Elliott (128k).mp3" },
        { title: "They Will Shade Us With Their Wings", artist: "Max Richter", src: "music/Max Richter - They Will Shade Us With Their Wings .mp3" },
    ];

    /* hand off to mini-player when leaving the blog page */
    document.addEventListener('ow:beforenavigate', function (e) {
        if (e.detail.from !== 'blog.html') return;
        var audio = document.getElementById('audio-player');
        if (!audio || !window.owMiniPlayer) return;
        window.owMiniPlayer.handoff({
            src:     audio.src,
            title:   tracks[_current] ? tracks[_current].title  : '',
            artist:  tracks[_current] ? tracks[_current].artist : '',
            time:    audio.currentTime,
            playing: _playing
        });
    });

    /* these are updated by init() so the beforenavigate handler can read them */
    var _current = 0;
    var _playing = false;

    function init() {
        var audio      = document.getElementById('audio-player');
        var record     = document.getElementById('the-record');
        var tonearm    = document.getElementById('the-tonearm');
        var playlistEl = document.getElementById('playlist');
        var titleEl    = document.getElementById('player-track-title');
        var artistEl   = document.getElementById('player-track-artist');
        var labelEl    = document.getElementById('label-text');

        if (!audio) return;     /* not on blog page */

        var current = 0;
        var playing = false;

        /* clone buttons to wipe any old listeners */
        function freshBtn(id) {
            var old = document.getElementById(id);
            var neo = old.cloneNode(true);
            old.parentNode.replaceChild(neo, old);
            return neo;
        }
        var playBtn = freshBtn('play-btn');
        var prevBtn = freshBtn('prev-btn');
        var nextBtn = freshBtn('next-btn');

        playlistEl.innerHTML = '';

        function loadTrack(i) {
            var t = tracks[i];
            audio.src              = t.src;
            titleEl.textContent    = t.title;
            artistEl.textContent   = t.artist;
            labelEl.textContent    = t.title;
            document.querySelectorAll('.playlist-item').forEach(function (el, idx) {
                el.classList.toggle('active', idx === i);
            });
        }

        function startPlay() {
            audio.play().catch(function () {});
            playing = true; _playing = true;
            record.classList.add('spinning');
            tonearm.classList.add('playing');
            playBtn.innerHTML = '&#9646;&#9646;';
            playBtn.title = 'Pause';
        }

        function stopPlay() {
            audio.pause();
            playing = false; _playing = false;
            record.classList.remove('spinning');
            tonearm.classList.remove('playing');
            playBtn.innerHTML = '&#9654;';
            playBtn.title = 'Play';
        }

        /* build playlist */
        tracks.forEach(function (t, i) {
            var li = document.createElement('li');
            li.className = 'playlist-item' + (i === 0 ? ' active' : '');
            li.textContent = t.title + ' \u2014 ' + t.artist;
            li.addEventListener('click', function () {
                current = i; _current = i;
                loadTrack(i);
                startPlay();
            });
            playlistEl.appendChild(li);
        });

        playBtn.addEventListener('click', function () { playing ? stopPlay() : startPlay(); });

        prevBtn.addEventListener('click', function () {
            current = (current - 1 + tracks.length) % tracks.length;
            _current = current;
            loadTrack(current);
            if (playing) startPlay();
        });

        nextBtn.addEventListener('click', function () {
            current = (current + 1) % tracks.length;
            _current = current;
            loadTrack(current);
            if (playing) startPlay();
        });

        audio.addEventListener('ended', function () {
            current = (current + 1) % tracks.length;
            _current = current;
            loadTrack(current);
            startPlay();
        });

        loadTrack(0);
    }

    /* auto-run on initial page load */
    init();

    return init;
}());
