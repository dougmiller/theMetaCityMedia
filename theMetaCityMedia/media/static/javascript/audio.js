document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    var audio = document.getElementById("audioObject"),
        audioBox = document.getElementById("audioBox"),
        audioPoster = document.getElementById("audioPoster"),
        audioPosterImg = document.getElementById("audioPosterImg"),
        sources = audio.getElementsByTagName("source"),
        playPauseButton = document.getElementById("playPauseButton"),
        currentTimeSpan = document.getElementById("currentTimeSpan"),
        playProgress = document.getElementById("playProgress"),
        soundButton = document.getElementById("tmcSoundIcon"),
        soundSlider = document.getElementById("soundSlider"),
        tracksButton = document.getElementById("tracksButton"),
        tracksList = document.getElementById("tracksList"),
        audioFileName = audio.dataset.filename,
        hasStartPoster = audio.dataset.startposter,
        hasEndPoster = audio.dataset.endposter,
        soundState = {
            hideSliderTimout: undefined,
            prevButtonIcon: soundButton,
            hideSilderTimoutTime: 3000
        };

    playProgress.value = 0;
    audio.controls = false;

    audio.addEventListener("loadstart", function () {
        var canPlayVid = false;

        // N.B. requires that the script is loaded early enough/blocking, so no defer
        // If you do not then you can miss this event firing and nothing works as intended

        Array.prototype.some.call(sources, function (source) {
            if (audio.canPlayType(source.type)) {
                canPlayVid = true;
            }
        });

        if (!canPlayVid) {
            getPoster("generic", "error").then(function (errorPoster) {
                errorPoster.setAttribute("class", "mediaPoster");
                audioPoster.appendChild(errorPoster);
            }, function (error) {
                console.log("No end poster: " + error);
            });
        } else {
            var startPosterRef;
            startPosterRef = hasStartPoster === "True" ? audioFileName : "generic";
            getPoster(startPosterRef, "start").then(function (startPoster) {
                startPoster.setAttribute("class", "mediaPoster");
                audioPoster.appendChild(startPoster);

                startPoster.getElementById("playButton").addEventListener("click", function () {
                    audio.playPause();
                });
            }, function (error) {
                console.log("No start poster: " + error);
            });
        }
    });

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

        chapterTracks.forEach(function (chapterTrack) {
            chapterTrack.mode = "showing";
            pollForChapterCues = setTimeout(function () {
                if (chapterTrack.cues !== null) {
                    clearInterval(pollForChapterCues);

                    chapterControls = document.createElement("ul");
                    chapterControls.setAttribute("id", "chapterControls");

                    Array.from(chapterTrack.cues).forEach(function (cue) {
                        var chapterLink = document.createElement("li");
                        chapterLink.appendChild(document.createTextNode(cue.text));

                        chapterLink.addEventListener("click", function () {
                            audio.currentTime = cue.startTime + 0.01;
                        });

                        cue.addEventListener("enter", function () {
                            chapterLink.classList.add("playing");
                        });

                        cue.addEventListener("exit", function () {
                            chapterLink.classList.remove("playing");
                        });

                        chapterControls.appendChild(chapterLink);
                    });
                    audioBox.appendChild(chapterControls);
                }
            }, 1000);
        });


        Array.prototype.slice.call(tracksList.children).forEach(function(tracksListItem) {
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

    audio.addEventListener("play", function () {
        var posters = audioPoster.getElementsByClassName("mediaPoster");
        posters.forEach(function (poster) {
            poster.parentNode.removeChild(poster);
        });
    });

    audio.addEventListener("timeupdate", function () {
        currentTimeSpan.innerHTML = rawTimeToFormattedTime(this.currentTime);
        // Setting this value does not trigger the "change" event
        playProgress.value = (this.currentTime / this.duration) * 1000;
    });

    audio.addEventListener("ended", function () {
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg", "title")[0];
        playPauseButton.alt = "Option to play the video";
        title.textContent = "Play";
        playPauseButton.getElementById("transitionToPlay").beginElement();

        var endPosterRef = hasEndPoster === "True" ? audioFileName : "generic";
        getPoster(endPosterRef, "end").then(function (endPoster) {
            endPoster.setAttribute("class", "mediaPoster");
            audioPoster.appendChild(endPoster);

            endPoster.getElementById("playButton").addEventListener("click", function () {
                audio.play();
                playPauseButton.alt = "Option to pause the video";
                title.textContent = "Pause";
                playPauseButton.getElementById("transitionToPause").beginElement();
                audioPoster.removeChild(endPoster);
            });

        }, function (error) {
            console.log("No end poster: " + error);
        });

        var request = new XMLHttpRequest();
        request.open("GET", "http://api.localcity.com:5000/v/1/0/video_end_follow_on", true);

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                resolve(document.importNode(this.responseXML.firstChild, true));
            } else {
                reject({status: this.status, statusText: this.statusText});
            }
        };

        request.onerror = function () {
            reject({status: this.status, statusText: this.statusText});
        };
        request.send();
    });

    audio.isPlaying = function () {
        return !(this.paused || this.ended || this.seeking || this.readyState < this.HAVE_FUTURE_DATA);
    };

    audio.playPause = function () {
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg", "title")[0];

        if (audio.isPlaying()) {
            audio.pause();
            playPauseButton.alt = "Option to play the video";
            title.textContent = "Play";
            playPauseButton.getElementById("transitionToPlay").beginElement();
        } else {
            audio.play();
            playPauseButton.alt = "Option to pause the video";
            title.textContent = "Pause";
            playPauseButton.getElementById("transitionToPause").beginElement();
        }
    };

    audioPosterImg.addEventListener("click", function () {
        audio.playPause();
    });

    playPauseButton.addEventListener("click", function () {
        audio.playPause();
    });

    playProgress.addEventListener("change", function () {
        audio.currentTime = audio.duration * (playProgress.value / 1000);
    });

    playProgress.addEventListener("mousedown", function () {
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg", "title")[0];
        if (audio.isPlaying()) {
            audio.pause();
            title.textContent = "Play";
            playPauseButton.getElementById("transitionToPlay").beginElement();
        } else {
            title.textContent = "Play";
            playPauseButton.getElementById("transitionPlayToPlay").beginElement();
        }
    });

    playProgress.addEventListener("mouseup", function () {
        audio.play();
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg", "title")[0];
        title.textContent = "Pause";
        playPauseButton.getElementById("transitionToPause").beginElement();
    });

    //tracksButton.addEventListener("touchstart", function () {
    //    tracksList.classList.add("emulateHover");
    //});

    var soundTracker = {
        level3Visible: true,
        level2Visible: true,
        level1Visible: true,
        level0Visible: true,
        previousVolume: 1.0,
        soundGates: {
            max: 0.8,
            upper: 0.5,
            lower: 0.2,
            base: 0.0
        }
    };
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

    soundButton.addEventListener("touchend", function (event) {
        event.stopImmediatePropagation(); // touchend also triggers click so need to stop that from happening and muting the track
        soundState.hideSliderTimout = setTimeout(function () {
            soundSlider.classList.remove("emulateHover");
        }, soundState.hideSilderTimoutTime);
        soundSlider.classList.add("emulateHover");
    });

    soundSlider.addEventListener("touchend", function () {
        soundState.hideSliderTimout = setTimeout(function () {
            soundSlider.classList.remove("emulateHover");
        }, soundState.hideSilderTimoutTime);
    });

    soundSlider.addEventListener("touchstart", function () {
        clearTimeout(soundState.hideSliderTimout);
    });

    soundSlider.addEventListener("input", function () {

        var volumeRatio = this.value / this.max;
        var direction = volumeRatio - soundTracker.previousVolume; // this.value is 1 to this.max, previous value tracks volume which is between 0 and 1, need to convert
        soundTracker.previousVolume = volumeRatio;
        audio.volume = volumeRatio;

        soundButton.title = "Button to change sound options";
        soundButton.description = "Change sound options";

        // positive direction is increase in volume
        if (direction > 0) {
            if (audio.volume >= soundTracker.soundGates.max && !soundTracker.level3Visible) {
                soundTracker.level3Visible = true;
                soundButton.getElementById("soundIconRay3NoneToFull").beginElement();
            }

            if (audio.volume > soundTracker.soundGates.upper && !soundTracker.level2Visible) {
                soundTracker.level2Visible = true;
                soundButton.getElementById("soundIconRay2NoneToFull").beginElement();
            }

            if (audio.volume > soundTracker.soundGates.lower && !soundTracker.level1Visible) {
                soundTracker.level1Visible = true;
                soundButton.getElementById("soundIconRay1NoneToFull").beginElement();
            }

            if (audio.volume > soundTracker.soundGates.base && !soundTracker.level0Visible) {
                soundTracker.level0Visible = true;
                soundButton.getElementById("soundIconRayMuteFullToNone").beginElement();
            }
        } else if (direction < 0) { // decrease in volume

            if (audio.volume <= soundTracker.soundGates.max && soundTracker.level3Visible) {
                soundTracker.level3Visible = false;
                soundButton.getElementById("soundIconRay3FullToNone").beginElement();
            }

            if (audio.volume <= soundTracker.soundGates.upper && soundTracker.level2Visible) {
                soundTracker.level2Visible = false;
                soundButton.getElementById("soundIconRay2FullToNone").beginElement();
            }

            if (audio.volume <= soundTracker.soundGates.lower && soundTracker.level1Visible) {
                soundTracker.level1Visible = false;
                soundButton.getElementById("soundIconRay1FullToNone").beginElement();
            }

            if (audio.volume === soundTracker.soundGates.base && soundTracker.level0Visible) {
                soundTracker.level0Visible = false;
                soundButton.getElementById("soundIconRay0FullToNone").beginElement();
            }
        }
    });

    function getPoster(filename, type) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("GET", "http://assets.localcity.com/audio/" + type + "posters/" + filename + "." + type + ".svg", true);

            request.onload = function () {
                if (this.status >= 200 && this.status < 400) {
                    resolve(document.importNode(this.responseXML.firstChild, true));
                } else {
                    reject({status: this.status, statusText: this.statusText});
                }
            };

            request.onerror = function () {
                console.log(this);
                reject({status: this.status, statusText: this.statusText});
            };
            request.send();
        });
    }

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

    /* Special cases of suck */
    var soundIconBody = document.getElementById("soundIconBody");

    soundIconBody.addEventListener("mouseenter", function () {
        soundSlider.classList.add("emulateHover");
    });

    soundIconBody.addEventListener("mouseout", function () {
        soundSlider.classList.remove("emulateHover");
    });

    soundSlider.addEventListener("mouseenter", function () {
        soundSlider.classList.add("emulateHover");
        soundIconBody.classList.add("emulateHover");
    });

    soundSlider.addEventListener("mouseout", function () {
        soundSlider.classList.remove("emulateHover");
        soundIconBody.classList.remove("emulateHover");
    });
});