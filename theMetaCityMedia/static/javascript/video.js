$(document).ready(function () {
    "use strict";
    var videos = $("video"), doc = document, fsElement;

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
        var playPauseButton = $(".playPauseButton", video.parent)[0];
        if (isVideoPlaying(video)) {
            video.pause();
            playPauseButton.src = "/static/images/smallplay.svg";
        } else {
            video.play();
            playPauseButton.src = "/static/images/smallpause.svg";
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
            $videoContainer,
            $controlsBox,
            $progressBar,
            $poster,
            customStartPoster,
            $endPoster,
            customEndPoster,
            errorPoster,
            $currentTimeSpan,
            $durationTimeSpan,
            tracks;

        if (this.controls) {
            this.controls = false;
        }

        $(video).on("timeupdate",function () {
            $progressBar[0].value = (video.currentTime / video.duration) * 1000;
            $currentTimeSpan.text(rawTimeToFormattedTime(video.currentTime));
        }).on("play", function (){
            var $poster = $(".poster");
            if ($poster.length != 0) {
                $poster.remove()
            }
        }).on("loadedmetadata",function () {
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
                            var newText = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
                            var link = doc.createElementNS("http://www.w3.org/2000/svg", "a");
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

            }).on("click",function () {
                playPause(video);
            }).on("ended",function () {
                $(".playPauseButton", $controlsBox)[0].src = "/static/images/smallplay.svg";
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

                    $(".playButton", $endPoster).on("click", function () {
                        playPause(video);
                        $endPoster.remove(); // done with poster forever
                    });
                    $videoContainer.append($endPoster);
                    $($videoContainer).trigger("reposition");
                });
            });

        // Setup the div container for the video, controls and poster
        $videoContainer = $(".vidContainer").on("reposition", function () {
                    // Move posters and controls back into position after video position updated
                    var videoContainerOffset = $videoContainer.offset(), $poster = $(".poster", this);

                    $poster.offset({top: videoContainerOffset.top, left: videoContainerOffset.left});
                    $poster.attr("height", $(video).height());
                    $poster.attr("width", $(video).width());
                });

        $controlsBox = $(".videoControls");

        // Setup play/pause button
        $(".playPauseButton", $controlsBox).on("click",function () {
            playPause(video);
        });

        $durationTimeSpan = $(".durationTimeSpan", $controlsBox);

        // Setup progress bar
        $progressBar = $(":input[type=range]", $controlsBox).on("change",function () {
                video.currentTime = video.duration * (this.value / 1000);
            }).on("mousedown",function () {
                video.pause();
            }).on("mouseup",function () {
                video.play();
            });

        $currentTimeSpan = $(".currentTimeSpan");

        // Full screen
        $(".fullscreenButton").on("click",function () {
                if (video.requestFullScreen) {
                    video.requestFullScreen();
                } else if (video.webkitRequestFullScreen) {
                    video.webkitRequestFullScreen();
                } else if (video.mozRequestFullScreen) {
                    video.mozRequestFullScreen();
                }
            });

        if (video.textTracks.length == 0) {
            var tb = $(".tracksButton");
            var src = tb.attr("src").replace("tracks.svg", "notracks.svg");
            tb.attr("src", src);
        }

        $("#tracksMenu", function () {
            console.log(video.tracks);
            $(video.textTracks).each(function () {
                console.log(this);
                console.log(this.kind);
                console.log(this.label);
                console.log(this.language);
            });
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

            $(".playButton", $poster).on("click", function () {
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

        $(fsElement).each(function () {  // set to script scope as fullScreenElement appears to not work (yet?)
            var video = this, videoTime = video.currentTime;
            if (isFullScreen) {
                $("source", video).each(function () {
                    // .dataset.fullscreen is is treated a boolean, but it is just truthy string
                    // This function uses a standard format of names of full screen appropriate vids as shown below:
                    // original: originalvid.xyz            full screen: originalvid.fullscreen.xyz
                    // N.B. Can not have period (".") in original file same except for filetype
                    if (this.dataset.fullscreen) {
                        var splitSrc = this.src.split(".");
                        this.src = splitSrc[0] + "." + splitSrc[1] + "." + splitSrc[2] + ".fullscreen." + splitSrc[3];
                    }
                    video.load();
                });
            } else {  // Have left fullscreen and need to return to lower res video
                $("source", video).each(function () {
                    // Remove the full screen and go back to the original file
                    if (this.dataset.fullscreen) {
                        var splitSrc = this.src.split(".");
                        this.src = splitSrc[0] + "." + splitSrc[1] + "." + splitSrc[2] + "." + splitSrc[4];
                    } // Nothing was changed if data-fullscreen is false so no need to do anything

                    $(this).parent().load();  // The video
                    $(this).parent().trigger("reposition");  // The video container box
                });
            }
            $(video).on("loadedmetadata", function () {
                this.currentTime = videoTime;  // Skip to the time before we went full screen
                playPause(video);
            });
        });
    });
    $(window).on("resize", function () {
        $(videos).each(function () {
            $(this).parent().trigger("reposition");
        });
    });
});