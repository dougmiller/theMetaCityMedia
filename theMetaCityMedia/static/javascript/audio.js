document.addEventListener("DOMContentLoaded", function () {
    var audioContainer = document.getElementById("audioContainer"),
        audioBox = document.getElementById("audioBox"),
        audio = document.getElementById("audioObject"),
        sources = audio.getElementsByTagName('source'),
        audioControls = document.getElementById("audioControls"),
        playPauseButton = document.getElementById("playPauseButton"),
        fullscreenButton = document.getElementById("fullscreenButton"),
        currentTimeSpan = document.getElementById("currentTimeSpan"),
        playProgress = document.getElementById("playProgress"),
        soundButton = document.getElementById("soundButton"),
        soundSlider = document.getElementById("soundSlider"),
        tracksButton = document.getElementById("tracksButton"),
        tracksList = document.getElementById("tracksList");

    playProgress.value = 0;
    audio.controls = false;

    audio.addEventListener("loadstart", function () {});

    audio.addEventListener("timeupdate", function () {
        currentTimeSpan.innerHTML = rawTimeToFormattedTime(this.currentTime);
        // Setting this value does not trigger the 'change' event
        playProgress.value = (this.currentTime / this.duration) * 1000;
    });

    audio.isPlaying = function () {
        return !(this.paused || this.ended || this.seeking || this.readyState < this.HAVE_FUTURE_DATA);
    };

    audio.playPause = function () {
        if (this.isPlaying()) {
            this.pause();
            playPauseButton.src = "/static/images/smallplay.svg";
            playPauseButton.alt = "Option to play the video";
            playPauseButton.title = "Play";
        } else {
            this.play();
            playPauseButton.src = "/static/images/smallpause.svg";
            playPauseButton.alt = "Option to pause the video";
            playPauseButton.title = "Pause";
        }
    };

    playPauseButton.addEventListener("click", function () {
        audio.playPause();
    });

    audio.addEventListener("timeupdate", function () {
        currentTimeSpan.innerHTML = rawTimeToFormattedTime(this.currentTime);
        // Setting this value does not trigger the 'change' event
        playProgress.value = (this.currentTime / this.duration) * 1000;
    });

    playProgress.addEventListener("change", function () {
        audio.currentTime = audio.duration * (this.value / 1000);
    });

    playProgress.addEventListener("mousedown", function () {
        audio.pause();
    });

    playProgress.addEventListener("mouseup", function () {
        audio.play();
    });

    audio.addEventListener("ended", function () {
        playPauseButton.src = "/static/images/smallplay.svg";
        playPauseButton.alt = "Option to play the audio";
        playPauseButton.title = "Play";
    });

    function rawTimeToFormattedTime(rawTime) {
        var chomped, seconds, minutes;
        chomped = Math.floor(rawTime);
        minutes = Math.floor(chomped / 60);
        seconds = chomped % 60;
        return leftZeroPad(minutes, "00") + ":" + leftZeroPad(seconds, "00");
    }

    function leftZeroPad(rawString, paddingValue) {
        return (paddingValue + rawString).slice(-paddingValue.length);
    }
});