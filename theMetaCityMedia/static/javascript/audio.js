document.addEventListener("DOMContentLoaded", function () {
    "use strict";

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

    audio.addEventListener("loadstart", function() {
        var chapters = Array.prototype.find.call(audio.textTracks, function(track) {
            return track.kind === 'chapters';
        });

        if (chapters) {
            chapters.mode = 'showing';
            var chapterControls = document.createElement('ul');
            chapterControls.setAttribute("id", "chapterControls");

            var pollForChapters = setInterval(function() {
                if (chapters.cues.length) {
                    clearInterval(pollForChapters);

                    for (var k = 0; k < chapters.cues.length; k++) {
                        (function(index) {
                            var chapterLink = document.createElement('li');
                            chapterLink.appendChild(document.createTextNode(chapters.cues[index].text));
                            chapterControls.appendChild(chapterLink);
                        })(k);
                    }

                    audioControls.parentNode.appendChild(chapterControls);

                    chapters.addEventListener("cuechange", function(cue) {
                        // ID's are 'numerical'
                        var chapterButtons = Array.from(chapterControls.children);
                        chapterButtons.forEach(function(child) {
                            child.classList.remove('playing');
                        });
                        
                        chapterControls.childNodes[cue.target.activeCues[0].id - 1].classList.add('playing');
                    }, false);
                }
            }, 100);

        }
    });

    audio.addEventListener("loadstart", function() {
        if (audio.textTracks.length === 0) {
            tracksButton.src = "/static/images/notracks.svg";
            tracksButton.alt = "Icon showing no tracks are available";
            tracksButton.title = "No tracks available";
            tracksList.id = "noTracksList";
        }

        for (var j = 0; j < tracksList.children.length; j++) {
            (function (index) {
                tracksList.children[index].addEventListener("click", function () {
                    var chosen = Array.prototype.find.call(audio.textTracks, function(track) {
                        return track.kind === tracksList.children[index].dataset.kind;
                    });

                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                        chosen.mode = "disabled";
                    } else {
                        this.classList.add('active');
                        chosen.mode = "showing";
                    }

                    // close mobile hover after click
                    tracksList.classList.remove('emulateHover');
                });
            }(j));
        }
    });

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

    tracksButton.addEventListener("touchstart", function () {
        tracksList.classList.add('emulateHover');
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