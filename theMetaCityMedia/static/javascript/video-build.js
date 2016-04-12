document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    var videoContainer = document.getElementById("videoContainer"),
        videoBox = document.getElementById("videoBox"),
        video = document.getElementById("detailed_video"),
        sources = video.getElementsByTagName('source'),
        videoControls = document.getElementById("videoControls"),
        playPauseButton = document.getElementById("playPauseButton"),
        fullscreenButton = document.getElementById("fullscreenButton"),
        currentTimeSpan = document.getElementById("currentTimeSpan"),
        durationTimeSpan = document.getElementById("runningTimeSpan"),
        playProgress = document.getElementById("playProgress"),
        soundButton = document.getElementById("soundButton"),
        soundSlider = document.getElementById("soundSlider"),
        tracksButton = document.getElementById("tracksButton"),
        tracksList = document.getElementById("tracksList"),
        videoFileName = video.dataset.filename,
        hasStartPoster = video.dataset.startposter,
        hasEndPoster = video.dataset.endposter,
        hasFullscreen = video.dataset.hasfullscreen,
        canPlayVid = false,
        fullscreenFlag = false;

    videoBox.style.width = video.width + "px";
    playProgress.value = 0;
    video.controls = false;

    video.addEventListener("click", function () {
        video.playPause();
    });

    video.addEventListener("ended", function () {
        var endPosterRef = hasEndPoster === "True" ? videoFileName : 'generic';
        getPoster(endPosterRef, 'end').then(function(endPoster) {
            endPoster.setAttribute("class", "videoPoster");
            endPoster.setAttribute("height", video.getAttribute("height"));
            endPoster.setAttribute("width", video.getAttribute("width"));
            videoContainer.appendChild(endPoster);

            endPoster.getElementById('playButton').addEventListener("click", function () {
                video.playPause();
                videoContainer.removeChild(endPoster);
            });

        }, function(error){
            console.log("No end poster: ");
        });
    });

    video.addEventListener("play", function () {
        var posters = videoContainer.getElementsByClassName("videoPoster");

        for (var i = 0; i < posters.length; i++) {
            videoContainer.removeChild(posters[i]);
        }

        checkAudio();
    });

    video.addEventListener("loadstart", function () {
        // N.B. requires that the script is loaded early enough/blocking, so no defer
        // If you do not then you can miss this event firing and nothing works as intended

        // Check if we can play any of the supplied sources
        for (var i = 0; i < sources.length; i++) {
            if (video.canPlayType(sources[i].type)) {
                canPlayVid = true;
                break;
            }
        }

        if (!canPlayVid) {
            getPoster("generic", 'error').then(function(errorPoster) {
                errorPoster.setAttribute("class", "videoPoster");
                errorPoster.setAttribute("height", video.getAttribute("height"));
                errorPoster.setAttribute("width", video.getAttribute("width"));
                videoContainer.appendChild(errorPoster);
            }, function(error){
                console.log("No end poster: ");
            });
        } else {
            if (canPlayVid && !fullscreenFlag) {
                var startPosterRef = hasStartPoster === "True" ? videoFileName : 'generic';
                getPoster(startPosterRef, 'start').then(function (startPoster) {
                    startPoster.setAttribute("class", "videoPoster");
                    startPoster.setAttribute("height", video.getAttribute("height"));
                    startPoster.setAttribute("width", video.getAttribute("width"));
                    videoContainer.appendChild(startPoster);

                    startPoster.getElementById('playButton').addEventListener("click", function () {
                        video.playPause();
                    });
                }, function (error) {
                    console.log("No start poster: " + error);
                });

                getLoadingbar().then(function (loadingBar) {
                    // only setup for one seek buffer at m
                    //todo make it multi buffer friendly
                    loadingBar.setAttribute("class", "loadingBar");
                    loadingBar.style.top = video.height + "px";
                    loadingBar.setAttributeNS(null, "width", video.width + "px");
                    videoContainer.appendChild(loadingBar);

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
        }

        checkTracks();
        attachTrackSelectorListeners();
    });

    video.addEventListener("loadedmetadata", function () {
        currentTimeSpan.innerHTML = "00:00";
        durationTimeSpan.innerHTML = rawTimeToFormattedTime(this.duration);
        checkAudio();
    });

    video.addEventListener("timeupdate", function () {
        currentTimeSpan.innerHTML = rawTimeToFormattedTime(this.currentTime);
        // Setting this value does not trigger the 'change' event
        playProgress.value = (this.currentTime / this.duration) * 1000;
    });

    video.isPlaying = function () {
        return !(this.paused || this.ended || this.seeking || this.readyState < this.HAVE_FUTURE_DATA);
    };

    video.playPause = function () {
        if (canPlayVid) {
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
        }
    };

    playPauseButton.addEventListener("click", function () {
        video.playPause();
    });

    fullscreenButton.addEventListener("click", function () {
        if (video.requestFullScreen) {
            video.requestFullScreen();
        } else if (video.webkitRequestFullScreen) {
            video.webkitRequestFullScreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        }
    });

    playProgress.addEventListener("change", function () {
        video.currentTime = video.duration * (this.value / 1000);
    });

    playProgress.addEventListener("mousedown", function () {
        video.pause();
    });

    playProgress.addEventListener("mouseup", function () {
        video.play();
    })

    soundSlider.addEventListener("change", function () {
        video.volume = (this.value / this.max);
        if (video.volume === 0) {
            soundButton.src = "/static/images/nosound.svg";
            soundButton.alt = "Icon showing no sound is available";
            soundButton.title = "Sound muted.";
        } else {
            soundButton.src = "/static/images/sound.svg";
            soundButton.alt = "Button to change sound options";
            soundButton.title = "Change sound options";
        }
    });

    soundButton.addEventListener("click", function () {
        if (video.muted === false) {
            video.muted = true;
            soundButton.src = "/static/images/nosound.svg";
            soundButton.alt = "Icon showing no sound is available";
            soundButton.title = "Sound muted.";
            soundSlider.id = "noSoundSlider";
        } else {
            video.muted = false;
            soundButton.src = "/static/images/sound.svg";
            soundButton.alt = "Button to change sound options";
            soundButton.title = "Change sound options";
            soundSlider.id = "soundSlider";
        }
    });

    document.addEventListener("mozfullscreenchange", function () {
        var pos = getCurretlyPlayingSourceIndex();
        var splitSrc = sources[getCurretlyPlayingSourceIndex()].src.split(".");
        var playTime = 0;
        fullscreenFlag = true; // Used to flag to the load event that we do not need to load the start poster again

        if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {  // Have come from non to now full screen
            //var fsVideoTime = fsVideo.currentTime;
            // .dataset.hasFullscreen is is treated a boolean, but it is just truthy string
            // This function uses a standard format of names of full screen appropriate vids as shown below:
            // original: originalvid.xyz            full screen: originalvid.fullscreen.xyz
            // N.B. Can not have period (".") in original file same except for filetype
            if (hasFullscreen === "True") {
                playTime = video.currentTime;
                sources[pos].src = splitSrc[0] + "." + splitSrc[1] + "." + splitSrc[2] + ".fullscreen." + splitSrc[3];
                video.load();  // Reload with the new source
                video.currentTime = playTime;
                video.play();
            }
        } else {  // Have left full screen and need to return to lower res video
            //fsVideoTime = fsVideo.currentTime;
            if (hasFullscreen === "True") {
                playTime = video.currentTime;
                sources[pos].src = splitSrc[0] + "." + splitSrc[1] + "." + splitSrc[2] + "." + splitSrc[4];
                video.load();  // Reload with the new source
                video.currentTime = playTime;
                video.play();
            }
        }
    });

    function leftZeroPad(rawString, paddingValue) {
        return (paddingValue + rawString).slice(-paddingValue.length);
    }

    function rawTimeToFormattedTime(rawTime) {
        var chomped, seconds, minutes;
        chomped = Math.floor(rawTime);
        minutes = Math.floor(chomped / 60);
        seconds = chomped % 60;
        return leftZeroPad(minutes, "00") + ":" + leftZeroPad(seconds, "00");
    }

    function getPoster(filename, type) {
       return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', 'https://assets.themetacity.com/video/' + type + 'posters/' + filename + '.' + type + 'poster.svg', true);

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

    function getLoadingbar() {
       return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', '/static/images/loadingProgress.svg', true);

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

    function checkAudio() {
        var pos = getCurretlyPlayingSourceIndex();

        // Split happens on the: codecs="vp8,vorbis"' part
        // If we have a length of 2 then we have an audio codec and might be able to play it so we put in the option
        // Length of 1 obviously means no audio codec specified so remove the option to control audio
        if (sources[pos].type.split(',').length === 1) {
            soundButton.src = "/static/images/nosound.svg";
            soundButton.alt = "Icon showing no sound is available";
            soundButton.title = "No sound available";
            soundSlider.id = "noSoundSlider";
        } else {
            soundButton.src = "/static/images/sound.svg";
            soundButton.alt = "Button to change sound options";
            soundButton.title = "Change sound options";
            soundSlider.id = "soundSlider";
        }
    }

    function checkTracks() {
        if (video.textTracks.length) {
            tracksButton.src = "/static/images/tracks.svg";
            tracksButton.alt = "Button to change track options";
            tracksButton.title = "Change track options";
            tracksList.id = "tracksList";
        } else {
            tracksButton.src = "/static/images/notracks.svg";
            tracksButton.alt = "Icon showing no tracks are available";
            tracksButton.title = "No tracks available";
            tracksList.id = "noTracksList";
        }
    }

    function attachTrackSelectorListeners() {
        for (var i = 0; i < tracksList.children.length; i++) {
            (function (index) {
                tracksList.children[index].addEventListener("click", function () {
                    if (index === 0) {
                        for (var j = 0; j < video.textTracks.length; j++) {
                            video.textTracks[j].mode = "disabled";
                        }
                    } else {
                        video.textTracks[index - 1].mode = "showing";
                    }
                });
            }(i));
        }
    }

    function getCurretlyPlayingSourceIndex() {
        return [].slice.call(sources).map(function (source) {
            return source.src;
        }).indexOf(video.currentSrc);
    }
});