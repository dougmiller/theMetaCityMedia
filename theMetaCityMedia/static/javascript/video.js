$(document).ready(function () {
    "use strict";
    var videos = $("video"), doc = document, fsVideoTime, fsVideo;

    Number.prototype.leftZeroPad = function (numZeros) {
        var n = Math.abs(this),
            zeros = Math.max(0, numZeros - Math.floor(n).toString().length),
            zeroString = Math.pow(10, zeros).toString().substr(1);
        if (this < 0) {
            zeroString = '-' + zeroString;
        }
        return zeroString + n;
    };

    function isVideoPlaying(video) {
        return !(video.paused || video.ended || video.seeking || video.readyState < video.HAVE_FUTURE_DATA);
    }

    // Pass in object of the video to play/pause and the control box associated with it
    function playPause(video) {
        var $playPauseButton = $("#playPauseButton", video.parent);
        if (isVideoPlaying(video)) {
            video.pause();
            $playPauseButton.attr("src", "/static/images/smallplay.svg");
            $playPauseButton.attr("alt", "Option to play the video");
            $playPauseButton.attr("title", "Play");
        } else {
            video.play();
            $playPauseButton.attr("src", "/static/images/smallpause.svg");
            $playPauseButton.attr("alt", "Option to pause the video");
            $playPauseButton.attr("title", "Pause");
        }
    }

    function rawTimeToFormattedTime(rawTime) {
        var chomped, seconds, minutes;
        chomped = Math.floor(rawTime);
        seconds = chomped % 60;
        minutes = Math.floor(chomped / 60);
        return minutes.leftZeroPad(2) + ":" + seconds.leftZeroPad(2);
    }

    $(videos).each(function () {
        var video = this,
            $videoContainer = $("#vidContainer"),
            $controlsBox = $("#videoControls"),
            $playProgress = $("#playProgress", $controlsBox),
            $poster,
            customStartPoster,
            $endPoster,
            customEndPoster,
            errorPoster,
            $currentTimeSpan = $(".currentTimeSpan", $controlsBox),
            $durationTimeSpan = $(".durationTimeSpan", $controlsBox),
            $trackMenu = $("#trackMenu"),
            $tracksButton = $("#tracksButton"),
            $loadingProgress = $("#loadProgress"),
            $playPauseButton = $("#playPauseButton", $controlsBox),
            $soundButton = $("#soundButton", $controlsBox),
            $soundVolume = $("#soundLevel", $controlsBox);

        if (this.controls) {
            this.controls = false;
        }

        $(video).on("timeupdate", function () {
            $playProgress.prop("value", (video.currentTime / video.duration) * 1000);
            $currentTimeSpan.text(rawTimeToFormattedTime(video.currentTime));
        }).on("play", function () {
            if ($poster.length !== 0) {
                $poster.remove();
            }
        }).on("loadedmetadata", function () {
            var canPlayVid = false;
            $("source", $(video)).each(function () {
                if (video.canPlayType($(this).attr("type"))) {
                    canPlayVid = true;
                }
            });
            if (!canPlayVid) {
                errorPoster = "/static/images/movieerror.svg";
                $.get(errorPoster, function (svg) {
                    errorPoster = doc.importNode(svg.documentElement, true);

                    $(errorPoster).attr("class", "poster errorposter");
                    $(errorPoster).attr("height", $(video).height());
                    $(errorPoster).attr("width", $(video).width());

                    $("source", $(video)).each(function () {
                        var newText = doc.createElementNS("http://www.w3.org/2000/svg", "tspan"),
                            link = doc.createElementNS("http://www.w3.org/2000/svg", "a");

                        newText.setAttributeNS(null, "x", "50%");
                        newText.setAttributeNS(null, "dy", "1.2em");
                        link.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.src);
                        link.appendChild(doc.createTextNode(this.src));
                        newText.appendChild(link);

                        $("#sorrytext", errorPoster).append(newText);
                    });

                    $videoContainer.append(errorPoster);
                    $($videoContainer).trigger("reposition");
                });
            } else {
                $($currentTimeSpan).text(rawTimeToFormattedTime(this.currentTime));
                $($durationTimeSpan).text(rawTimeToFormattedTime(this.duration));
            }

        }).on("click", function () {
            playPause(video);
        }).on("ended", function () {
            $playPauseButton.attr("src", "/static/images/smallplay.svg");
            $playPauseButton.attr("alt", "Option to play the video");
            $playPauseButton.attr("title", "Play");
            // Poster to show at end of movie
            if (video.dataset.endposter) {
                customEndPoster = video.dataset.endposter;
            } else {
                customEndPoster = "/static/images/endofmovie.svg";  // If none supplied, use our own, generic one
            }
            // Get the poster and make it inline
            // File is SVG so usual jQuery rules may not apply
            // File needs to have at least one element with "playButton" as class
            $.get(customEndPoster, function (svg) {
                $endPoster = doc.importNode(svg.documentElement, true);
                $endPoster = $($endPoster);

                $endPoster.attr("class", "poster endposter");
                $endPoster.attr("height", $(video).height());
                $endPoster.attr("width", $(video).width());

                $("#playButton", $endPoster).on("click", function () {
                    playPause(video);
                    $endPoster.remove(); // done with poster forever
                });
                $videoContainer.append($endPoster);
                $($videoContainer).trigger("reposition");
            });
        });

        // Setup the div container for the video, controls and poster
        $videoContainer.on("reposition", function () {
            // Move posters and controls back into position after video position updated
            var $poster = $(".poster", this);

            $poster.offset({top: $("video", this).offset().top, left: $("video", this).offset().left});
            $poster.attr("height", $(video).height());
            $poster.attr("width", $(video).width());

            $trackMenu.css({top: $tracksButton.offset().top + $tracksButton.height() + "px", left: $tracksButton.offset().left + $tracksButton.width() - $trackMenu.width() + "px"});
            $soundVolume.css({top: $soundButton.offset().top - $soundVolume.height() + "px", left: $soundButton.offset().left + "px"});
            $loadingProgress.css({top: $loadingProgress.parent().offset().top + "px", left: $loadingProgress.parent().offset().left + "px"});
        });

        // Setup play/pause button
        $playPauseButton.on("click", function () {
            playPause(video);
        });

        // Setup progress bar
        $playProgress.on("change", function () {
            video.currentTime = video.duration * (this.value / 1000);
        }).on("mousedown", function () {
            video.pause();
        }).on("mouseup", function () {
            video.play();
        });

        // Full screen
        $("#fullscreenButton").on("click", function () {
            if (video.requestFullScreen) {
                video.requestFullScreen();
                fsVideo = video;
            } else if (video.webkitRequestFullScreen) {
                video.webkitRequestFullScreen();
                fsVideo = video;
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
                fsVideo = video;
            }
        });

        // Work out if there is audio to control
        // Not the greatest way but doesnt look like there is much other option (if any?)...
        $("source", video).each(function () {
            if (this.src === video.currentSrc) {
                if (this.type.split(',').length === 1) { // Split happens on the: codecs="vp8,vorbis"' part
                    $soundButton.attr("src","/static/images/nosound.svg");
                    $soundButton.attr("alt","Icon showing no sound is available");
                    $soundButton.attr("title","No sound available");
                    $soundVolume.remove();
                } else {  // If it DOES have sound
                    $soundVolume.css({top: $soundButton.offset().top - $soundVolume.height() + "px", left: $soundButton.offset().left + "px"});
                }
                return false;
            }
            return true;
        });

        // Check if there needs to be an option menu for tracks made
        if (video.textTracks.length === 0) {
            $tracksButton.attr("src", $tracksButton.attr("src").replace("tracks.svg", "notracks.svg"));
            $tracksButton.attr("alt", "No tracks are available");
            $tracksButton.attr("Title", "No tracks are available");
        } else {
            $(video.textTracks).each(function () {
                this.mode = "hidden";
            });
        }

        if ($trackMenu.length) {
            $("li", "#trackMenu").on("click", function () {
                $(this).parent().children("li").removeClass("activeTrack");
                $(this).addClass("activeTrack");

                // 'None' <li> is clicked so disable all the tracks
                if ($(this).text().toLowerCase() === "none") {
                    $(video.textTracks).each(function () {
                        this.mode = "hidden";
                    });
                // Find the track referred to and activate it
                } else {
                    var kind = $(this).text().split(":")[0].toLowerCase(), srclang = $(this).text().split("(")[1].slice(0, -1);
                    $(video.textTracks).each(function () {
                        if (this.kind === kind && this.language === srclang) {
                            this.mode = "showing";   // change to this track
                        } else {
                            this.mode = "hidden";  // Turn off other tracks
                        }
                    });
                }
            });
            $trackMenu.css({top: $tracksButton.offset().top + $tracksButton.height() + "px", left: $tracksButton.offset().left + $tracksButton.width() - $trackMenu.width() + "px"});
        }

        $loadingProgress.width($controlsBox.width());
        $loadingProgress.css({top: $controlsBox.offset().top + "px", left: $controlsBox.offset().left + "px"});

        // Loading progress bars
        (function () {
            var numBufferDisplays = 0,
                progressInterval = setInterval(function () {
                    var totalBuffered = 0, i;
                        //slider[0].width(video.duration / video.buffered.end(0) * $controlsBox.width());
                    if (numBufferDisplays < video.buffered.length) {
                        $loadingProgress.append("<div/>");
                        numBufferDisplays = numBufferDisplays + 1;
                    } else if (numBufferDisplays > video.buffered.length){
                        //too many displays, delete one
                        numBufferDisplays = numBufferDisplays - 1;
                        $("div:last-child",$loadingProgress).remove();
                    } else {
                        // Correct number of buffers, just size them properly
                        for (i = 0; i < video.buffered.length; i += 1) {
                            $loadingProgress.children().eq(i).width((video.buffered.end(i) - video.buffered.start(i)) / video.duration * $controlsBox.width());
                            $loadingProgress.children().eq(i).css({left: video.buffered.start(i) / video.duration * $controlsBox.width()});
                            totalBuffered += video.buffered.start(i) + video.buffered.end(i);
                        }
                        if (totalBuffered === video.duration) {
                            //$loadingProgress.fadeOut();
                            clearInterval(progressInterval);
                        }
                    }
                }, 500);
        }());

        $soundVolume.css({top: $soundButton.offset().top - $soundVolume.height() + "px", left: $soundButton.offset().left + "px"});

        $soundVolume.on("change", function (){
           video.volume = (this.value / 100);
        });


        // Posters to show before the user plays the video
        customStartPoster = this.dataset.startposter;
        if (!customStartPoster) {
            customStartPoster = "/static/images/genericstartposter.svg";  // If none supplied, use our own, generic one
        }
        // Get the poster and make it inline
        // File is SVG so usual jQuery rules may not apply
        // File needs to have at least one element with "playButton" as class
        $.get(customStartPoster, function (svg) {
            $poster = doc.importNode(svg.documentElement, true);
            $poster = $($poster);

            $poster.attr("class", "poster");
            $poster.attr("height", $(video).height());
            $poster.attr("width", $(video).width());

            $("#playButton", $poster).on("click", function () {
                video.load();   // Initial data and metadata load events may have fired before they can be captured so manually fire them
                playPause(video);
                $poster.remove(); // done with poster forever
            });
            $videoContainer.append($poster);
            $($videoContainer).trigger("reposition");
        });

        $($videoContainer).trigger("reposition"); //Get its position right.
    });

    // Handle coming out of fullscreen
    $(doc).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function () {
        var isFullScreen = doc.fullScreen || doc.mozFullScreen || doc.webkitIsFullScreen;

        if (isFullScreen) {  // Now in full screen
            fsVideo = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement;
            fsVideoTime = fsVideo.currentTime;
            $("source", fsVideo).each(function () {
                // .dataset.fullscreen is is treated a boolean, but it is just truthy string
                // This function uses a standard format of names of full screen appropriate vids as shown below:
                // original: originalvid.xyz            full screen: originalvid.fullscreen.xyz
                // N.B. Can not have period (".") in original file same except for filetype
                if (this.dataset.fullscreen) {
                    var splitSrc = this.src.split(".");
                    this.src = splitSrc[0] + "." + splitSrc[1] + "." + splitSrc[2] + ".fullscreen." + splitSrc[3];
                }
                fsVideo.load();  //Reload with the new source
            });
        } else {  // Have left full screen and need to return to lower res video
            fsVideoTime = fsVideo.currentTime;
            $("source", fsVideo).each(function () {
                // Remove the full screen and go back to the original file
                if (this.dataset.fullscreen) {
                    var splitSrc = this.src.split(".");
                    this.src = splitSrc[0] + "." + splitSrc[1] + "." + splitSrc[2] + "." + splitSrc[4];
                } // Nothing was changed if data-fullscreen is false so no need to do anything

                $(this).parent().load();  // The video
                $(this).parent().trigger("reposition");  // The video container box
            });
        }
        $(fsVideo).on("loadedmetadata", function () {
            this.currentTime = fsVideoTime;  // Skip to the time before we went full screen
            playPause(fsVideo);
        });
    });
    $(window).on("resize", function () {
        $(videos).each(function () {
            $(this).parent().trigger("reposition");
        });
    });
    $(window).trigger("reposition");
});