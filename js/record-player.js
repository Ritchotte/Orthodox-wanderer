(function () {
    var tracks = [
        { title: "November",                       artist: "Max Richter", src: "music/Max Richter - November.mp3" },
        { title: "Landscape With Figure",          artist: "Max Richter", src: "music/Max Richter - Landscape With Figure (1922) - Elliott (128k).mp3" },
        { title: "They Will Shade Us With Their Wings", artist: "Max Richter", src: "music/Max Richter - They Will Shade Us With Their Wings .mp3" },
    ];

    var current = 0;
    var playing = false;

    var audio      = document.getElementById('audio-player');
    var record     = document.getElementById('the-record');
    var tonearm    = document.getElementById('the-tonearm');
    var playBtn    = document.getElementById('play-btn');
    var prevBtn    = document.getElementById('prev-btn');
    var nextBtn    = document.getElementById('next-btn');
    var titleEl    = document.getElementById('player-track-title');
    var artistEl   = document.getElementById('player-track-artist');
    var labelEl    = document.getElementById('label-text');
    var playlistEl = document.getElementById('playlist');

    function buildPlaylist() {
        tracks.forEach(function (t, i) {
            var li = document.createElement('li');
            li.className = 'playlist-item' + (i === 0 ? ' active' : '');
            li.textContent = t.title + ' \u2014 ' + t.artist;
            li.addEventListener('click', function () {
                current = i;
                loadTrack(i);
                startPlay();
            });
            playlistEl.appendChild(li);
        });
    }

    function loadTrack(i) {
        var t = tracks[i];
        audio.src = t.src;
        titleEl.textContent  = t.title;
        artistEl.textContent = t.artist;
        labelEl.textContent  = t.title;
        document.querySelectorAll('.playlist-item').forEach(function (el, idx) {
            el.classList.toggle('active', idx === i);
        });
    }

    function startPlay() {
        audio.play().catch(function () {});
        playing = true;
        record.classList.add('spinning');
        tonearm.classList.add('playing');
        playBtn.innerHTML = '&#9646;&#9646;';
        playBtn.title = 'Pause';
    }

    function stopPlay() {
        audio.pause();
        playing = false;
        record.classList.remove('spinning');
        tonearm.classList.remove('playing');
        playBtn.innerHTML = '&#9654;';
        playBtn.title = 'Play';
    }

    playBtn.addEventListener('click', function () {
        if (playing) stopPlay(); else startPlay();
    });

    prevBtn.addEventListener('click', function () {
        current = (current - 1 + tracks.length) % tracks.length;
        loadTrack(current);
        if (playing) startPlay();
    });

    nextBtn.addEventListener('click', function () {
        current = (current + 1) % tracks.length;
        loadTrack(current);
        if (playing) startPlay();
    });

    audio.addEventListener('ended', function () {
        current = (current + 1) % tracks.length;
        loadTrack(current);
        startPlay();
    });

    window.addEventListener('pagehide', function () {
        stopPlay();
    });

    buildPlaylist();
    loadTrack(0);
}());
