document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    var audio = document.getElementById("audioObject"),
        audioControls = document.getElementById("audioControls"),
        playPauseButton = document.getElementById("playPauseButton"),
        currentTimeSpan = document.getElementById("currentTimeSpan"),
        playProgress = document.getElementById("playProgress"),
        soundButton = document.getElementById("soundButton"),
        soundSlider = document.getElementById("soundSlider"),
        tracksButton = document.getElementById("tracksButton"),
        tracksList = document.getElementById("tracksList"),
        soundState = {
            hideSlderTimout: undefined,
            prevButtonIcon: soundButton.src,
            hideSlderTimoutTime: 3000
        };

    playProgress.value = 0;
    audio.controls = false;

    audio.addEventListener("loadeddata", function () {
        var chapterTracks, chapterControls, pollForChapterCues;

        if (audio.textTracks.length === 0) {
            tracksButton.src = "/static/images/notracks.svg";
            tracksButton.alt = "Icon showing no tracks are available";
            tracksButton.title = "No tracks available";
            tracksList.id = "noTracksList";
        }

        chapterTracks = Array.prototype.filter.call(audio.textTracks, function (track) {
            return track.kind === "chapters";
        });

        chapterTracks.forEach(function(chapterTrack) {
            pollForChapterCues = setTimeout(function () {
                if (chapterTrack.cues != null) {
                    clearInterval(pollForChapterCues);

                    chapterControls = document.createElement("ul");
                    chapterTracks.mode = "showing";
                    chapterControls.setAttribute("id", "chapterControls");

                    chapterTrack.addEventListener("cuechange", function () {
                        console.log("Cue Changed");
                    });

                    Array.from(chapterTrack.cues).forEach(function (cue) {
                        var chapterLink = document.createElement("li");
                        chapterLink.appendChild(document.createTextNode(cue.text));
                        console.log(chapterTrack.cues);

                        chapterLink.addEventListener("click", function () {
                            chapterLink.classList.add("playing");
                        });

                        cue.addEventListener("enter", function () {
                            chapterLink.classList.add("playing");
                        });

                        cue.addEventListener("exit", function () {
                            chapterLink.classList.remove("playing");
                        });

                        chapterControls.appendChild(chapterLink);
                    });
                    audioControls.parentNode.appendChild(chapterControls);
                }
            }, 1000);
        });


        Array.from(tracksList.children).forEach(function (tracksListItem) {
            tracksListItem.addEventListener("click", function () {
                var chosen = Array.prototype.find.call(audio.textTracks, function (audioTrack) {
                    return audioTrack.kind === tracksListItem.dataset.kind;
                });

                if (tracksListItem.classList.contains("active")) {
                    tracksListItem.classList.remove("active");
                    chosen.mode = "disabled";
                } else {
                    tracksListItem.classList.add("active");
                    chosen.mode = "showing";
                }

                // close mobile hover after click
                tracksList.classList.remove("emulateHover");
            });
        });
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
        tracksList.classList.add("emulateHover");
    });

    soundButton.addEventListener("click", function () {
        if (audio.muted === false) {
            audio.muted = true;
            soundState.prevButtonIcon = soundButton.src;
            soundButton.src = "/static/images/sound-m.svg";
            soundButton.alt = "Icon showing no sound is muted";
            soundButton.title = "Sound muted.";
            soundSlider.id = "noSoundSlider";
        } else {
            audio.muted = false;
            soundButton.src = soundState.prevButtonIcon;
            soundButton.alt = "Icon showing state of sound, currently: " + audio.volume * 100 + "%";
            soundButton.title = "Change sound options";
            soundSlider.id = "soundSlider";
        }
    });

    soundSlider.addEventListener("touchend", function () {
        soundState.hideSlderTimout = setTimeout(function(){
            soundSlider.classList.remove('emulateHover');
        }, soundState.hideSlderTimoutTime);
    });

    soundSlider.addEventListener("touchstart", function () {
        clearTimeout(soundState.hideSlderTimout);
    });

    soundSlider.addEventListener("input", function () {
        audio.volume = (this.value / this.max);

        soundButton.alt = "Button to change sound options";
        soundButton.title = "Change sound options";

        if (audio.volume < 1 && audio.volume >= 0.85) {
             soundButton.src = "/static/images/sound-3.svg";
        }

        if (audio.volume < 0.85 && audio.volume >= 0.33) {
             soundButton.src = "/static/images/sound-2.svg";
        }

        if (audio.volume < 0.33 && audio.volume > 0) {
             soundButton.src = "/static/images/sound-1.svg";
        }

        if (audio.volume === 0) {
            soundButton.src = "/static/images/sound-0.svg";
            soundButton.alt = "Icon showing no sound level is at 0";
            soundButton.title = "Sound at 0.";
        }
    });

    soundButton.addEventListener("touchend", function (event) {
        event.stopImmediatePropagation(); // touchend also triggers click so need to stop that from happening and muting the track
        soundState.hideSlderTimout = setTimeout(function(){
            soundSlider.classList.remove('emulateHover');
        }, soundState.hideSlderTimoutTime);
        soundSlider.classList.add('emulateHover');
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