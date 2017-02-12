document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    var audio = document.getElementById("audioObject"),
        audioBox = document.getElementById("audioBox"),
        audioPoster = document.getElementById("audioPoster"),
        audioPosterImg = document.getElementById("audioPosterImg"),
        sources = audio.getElementsByTagName('source'),
        audioControls = document.getElementById("audioControls"),
        playPauseButton = document.getElementById("playPauseButton"),
        currentTimeSpan = document.getElementById("currentTimeSpan"),
        playProgress = document.getElementById("playProgress"),
        soundButton = document.getElementById("soundButton"),
        soundSlider = document.getElementById("soundSlider"),
        tracksButton = document.getElementById("tracksButton"),
        tracksList = document.getElementById("tracksList"),
        videoFileName = audio.dataset.filename,
        hasStartPoster = audio.dataset.startposter,
        hasEndPoster = audio.dataset.endposter,
        soundState = {
            hideSlderTimout: undefined,
            prevButtonIcon: soundButton.src,
            hideSlderTimoutTime: 3000
        };

    playProgress.value = 0;
    audio.controls = false;

    audio.addEventListener("loadstart", function () {
        var canPlayVid = false,
            chapters;
        // N.B. requires that the script is loaded early enough/blocking, so no defer
        // If you do not then you can miss this event firing and nothing works as intended

        Array.prototype.some.call(sources, function (source) {
            if (audio.canPlayType(source.type)) {
                return canPlayVid = true;
            }
        });

        chapters = Array.prototype.find.call(audio.textTracks, function(track) {
            return track.kind === 'subtitles';
        });

        if (chapters) {
            chapters.mode = 'showing';
            console.log(chapters.cues);
        }

        if (!canPlayVid) {
            getPoster("generic", 'error').then(function(errorPoster) {
                errorPoster.setAttribute("class", "mediaPoster");
                audioPoster.appendChild(errorPoster);
            }, function(error){
                console.log("No end poster: ");
            });
        } else {
            var startPosterRef = hasStartPoster === "True" ? audioFileName : 'generic';
            getPoster(startPosterRef, 'start').then(function (startPoster) {
                startPoster.setAttribute("class", "mediaPoster");
                audioPoster.appendChild(startPoster);

                startPoster.getElementById('playButton').addEventListener("click", function () {
                    audio.playPause();
                });
            }, function (error) {
                console.log("No start poster: " + error);
            });

            getLoadingbar().then(function (loadingBar) {
                loadingBar.setAttribute("class", "loadingBar");
                loadingBar.style.top = video.height + "px";
                loadingBar.setAttributeNS(null, "width", video.width + "px");
                audioBox.appendChild(loadingBar);

                function makeNewBufferBar() {
                    var newRect = document.createElementNS('http://www.w3.org/2000/svg',"rect");
                    newRect.setAttributeNS(null,"height","100%");
                    newRect.setAttributeNS(null,"x", 0  + "px");
                    newRect.setAttributeNS(null,"y", 0 + "px");
                    return newRect;
                }

                var bars = loadingBar.getElementsByTagName('rect');

                var renderInterval = setInterval(function () {
                    bars = loadingBar.getElementsByTagName('rect');

                    while (bars.length > video.buffered.length) {
                        bars[bars.length -1].remove();
                    }

                    while (bars.length < video.buffered.length) {
                        loadingBar.appendChild(makeNewBufferBar());
                        bars = loadingBar.getElementsByTagName('rect');
                    }

                    // Sometimes dat has not loaded enough for this to register properly
                    if (video.buffered.length){
                        for (var i = 0; i < video.buffered.length; i++) {
                            bars[i].setAttributeNS(null,"width", ((video.buffered.end(i) - video.buffered.start(i)) / video.duration) * video.width + "px");
                            bars[i].setAttributeNS(null,"x", (video.buffered.start(i) / video.duration) * video.width + "px");
                        }
                        // b/c this is floating point math, sometimes the video.buffered.end(0) returns 0.001 less than buffered.length
                        // /Checking for a whole second less is a fair work around that does not impact on display too much
                        if (video.buffered.end(0) >= video.duration -1) {
                            clearInterval(renderInterval);
                            loadingBar.style.opacity = 0;
                        }
                    }
                }, 500);
            }, function (error) {
                console.log("No loading bar: ");
            });
        }

        if (audio.textTracks.length === 0) {
            tracksButton.src = "/static/images/notracks.svg";
            tracksButton.alt = "Icon showing no tracks are available";
            tracksButton.title = "No tracks available";
            tracksList.id = "noTracksList";
        }

        for (var j = 0; j < tracksList.children.length; j++) {
            (function (index) {
                tracksList.children[index].addEventListener("click", function () {

                    for (var k = 0; k < tracksList.children.length; k++) {
                       tracksList.children[k].classList.remove('active');
                    }

                    this.classList.add('active');
                    tracksList.classList.remove('emulateHover');

                    // Index 0 is the disable tracks button
                    if (index === 0) {
                        for (var j = 0; j < video.textTracks.length; j++) {
                            video.textTracks[j].mode = "disabled";
                        }
                    } else {
                        video.textTracks[index - 1].mode = "showing";
                    }
                });
            }(j));
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

    audio.addEventListener("play", function () {
        var posters = audioPoster.getElementsByClassName("mediaPoster");
        for (var poster of posters) {
            poster.parentNode.removeChild(poster);
        }
    });

    audio.addEventListener("timeupdate", function () {
        currentTimeSpan.innerHTML = rawTimeToFormattedTime(this.currentTime);
        // Setting this value does not trigger the 'change' event
        playProgress.value = (this.currentTime / this.duration) * 1000;
    });

    audio.addEventListener("ended", function () {
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg","title")[0];
        playPauseButton.alt = "Option to play the video";
        title.textContent = "Play";
        playPauseButton.getElementById("transitionToPlay").beginElement();

        var endPosterRef = hasEndPoster === "True" ? videoFileName : 'generic';
        getPoster(endPosterRef, 'end').then(function(endPoster) {
            endPoster.setAttribute("class", "mediaPoster");
            audioPoster.appendChild(endPoster);

            endPoster.getElementById('playButton').addEventListener("click", function () {
                audio.play();
                playPauseButton.alt = "Option to pause the video";
                title.textContent = "Pause";
                playPauseButton.getElementById("transitionToPause").beginElement();
                audioPoster.removeChild(endPoster);
            });

        }, function(error){
            console.log("No end poster: ");
        });


        var request = new XMLHttpRequest();
        request.open('GET', 'http://api.localcity.com:5000/v/1/0/video_end_follow_on', true);

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                //resolve(document.importNode(this.responseXML.firstChild, true));
            } else {
                //reject({status: this.status, statusText: this.statusText});
            }
        };

        request.onerror = function () {
            console.log(this);
            //reject({status: this.status, statusText: this.statusText});
        };
        request.send();
    });

    audio.isPlaying = function () {
        return !(this.paused || this.ended || this.seeking || this.readyState < this.HAVE_FUTURE_DATA);
    };

    audio.playPause = function () {
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg","title")[0];

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
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg","title")[0];
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
        var title = playPauseButton.getElementsByTagNameNS("http://www.w3.org/2000/svg","title")[0];
        title.textContent = "Pause";
        playPauseButton.getElementById("transitionToPause").beginElement();
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

    soundButton.addEventListener("touchend", function (event) {
        event.stopImmediatePropagation(); // touchend also triggers click so need to stop that from happening and muting the track
        soundState.hideSlderTimout = setTimeout(function(){
            soundSlider.classList.remove('emulateHover');
        }, soundState.hideSlderTimoutTime);
        soundSlider.classList.add('emulateHover');
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

    function getPoster(filename, type) {
       return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', 'http://assets.localcity.com/audio/' + type + 'posters/' + filename + '.' + type + '.svg', true);

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
});