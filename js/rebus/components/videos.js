import { $body } from '../globals.js';

var buildTranscriptCarousel = function (carouselId, html) {
    var $html = $(html),
        indicators = [],
        panels = [];

    if (!$html.hasClass('carousel')) {
        return html;
    }

    $.each($html.find('div'), function (i) {
        if (rebus.config.videosMustBePlayedThrough) {
            // Non clickable indicators
            indicators.push('<li ' + (i === 0 ? ' class="active"' : '') + '><div></div></li>');
        } else {
            indicators.push('<li data-target="#' + carouselId + '" data-slide-to="' + i + '"' + (i === 0 ? ' class="active"' : '') + '><div></div></li>');
        }
        panels.push('<div class="item' + (i === 0 ? ' active' : '') + '">\n' + this.outerHTML + '\n</div>');
    });

    return [
        '<div id="' + carouselId + '" class="transcript-carousel carousel slide" data-interval="false" data-wrap="false">',
        '<div class="carousel-inner">',
        panels.join('\n'),
        '</div>',
        '<div class="carousel-indicators-container" aria-hidden="true">',
        '<ol class="carousel-indicators">',
        indicators.join('\n'),
        '</ol>',
        '</div>',
        '<div class="carousel-nav">',
        '<div>',
        '<a href="#' + carouselId + '" role="button" data-slide="prev"><div data-svg="icon-arrownav-left"></div><span class="sr-only">Previous</span></a>',
        '<a href="#' + carouselId + '" role="button" data-slide="next"><div data-svg="icon-arrownav-right"></div><span class="sr-only">Next</span></a>',
        '</div>',
        '</div>',
        '</div>'
    ].join('\n');
};

export default {
    init: function (partial) {
        $('.video').each(function (videoIdx) {
            var $container = $(this),
                html = $container.html(),
                continueTo = $container.data('continue'),
                btnContinue = '';

            if (continueTo) {
                if (continueTo === 'next') {
                    btnContinue = '<button type="button" data-mark-page-as-complete-and-continue class="btn btn-primary continue"><span>Continue</span></button>';
                } else {
                    btnContinue = '<a class="btn btn-primary continue" href="index.html?page=' + continueTo + '&initialised=true"><span>Continue</span></a>';
                }
            }

            $container.attr('data-video-idx', videoIdx).empty().append([
                '<div class="video-wrapper"></div>'
            ].join('\n')).find('.video-wrapper').append(html).append('<div class="mt-3 text-right"><button type="button" class="btn btn-primary btn-read-transcript"><span>Read the transcript</span></button></div>');
        });

        $('video').on('play', function () {
            rebus.audio.pause();
            rebus.video.pauseAll(this);
        });
        if (partial) {
            return;
        }



        $body.on('click', '.btn-play-video', function () {
            var $container = $(this).closest('.video'),
                video = $container.find('video')[0];
            $container.removeClass('show-video-transcript');
            if (video.paused) {
                rebus.video.play(video);
            } else {
                rebus.video.pause(video);
            }
        }).on('click', '.btn-read-transcript', function () {
            var $btn = $(this),
                $container = $(this).closest('.video'),
                video;
            if ($container.hasClass('show-video-transcript')) {
                $container.removeClass('show-video-transcript');
                return;
            }
            $btn.data('scrollPosition', $(top).scrollTop());
            video = $container.find('video')[0];
            if (!video.paused) {
                rebus.video.pause(video);
            }
            if (!$container.find('.video-transcript').length) {
                $.get("content/transcripts/" + $container.data('transcript') + ".html", function (data) {
                    var carouselId = 'transcript-carousel-' + $container.attr('data-video-idx'),
                        $transcript = $([
                            '<div class="video-transcript">',
                            '<div class="video-transcript-header">',
                            '<button type="button" class="close" data-dismiss="transcript" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
                            '<p class="video-transcript-title" tabindex="-1">Video transcript</p>',
                            '</div>',
                            '<div class="video-transcript-body"></div>',
                            '<div class="video-transcript-footer">',
                            '<div class="video-transcript-btns">',
                            '<button type="button" class="non-stacked button btn-primary" data-dismiss="transcript">Close</button>',
                            '<button type="button" class="stacked button btn-primary" ' + (rebus.config.videosMustBePlayedThrough ? 'data-set-activity-complete ' : '') + 'data-dismiss="transcript"><span>Close</span></button>',
                            '</div>',
                            '</div>',
                            '</div>'
                        ].join('\n'));
                    $transcript.find('.video-transcript-body').append(buildTranscriptCarousel(carouselId, data));
                    $container.append($transcript).addClass('show-video-transcript');
                    $('.carousel', $transcript).accessibleCarousel();
                    $('.video-transcript-title', $container)[0].focus();
                });
            } else {
                $container.addClass('show-video-transcript');
                $('.video-transcript-title', $container)[0].focus();
            }
            // mark complete right away
            // if there is only one
            // item in the transcript
            var $this = $(this);
            var checkItems = function(){
                var $video = $this.closest('.video');
                var $items = $('.item',$video)
                if($items.length === 0)
                {
                    setTimeout(checkItems, 100);
                }else{
                    if($items.length === 1) {
                        // hide carousel navigation
                        $('.carousel-nav',$video).attr('aria-hidden',true);
                        $('.carousel-nav a',$video).attr('aria-disabled',true);
                        $('.carousel-indicators-container',$video).attr('aria-hidden',true);
                        rebus.panels.setActivityAsComplete($video, true);
                    }
                }
            }
            checkItems();
           
        }).on('click', '[data-dismiss="transcript"]', function () {
            var $container = $(this).closest('.video'),
                $btnRead = $container.find('.btn-read-transcript');
            $container.removeClass('show-video-transcript');
            $(top).scrollTop($btnRead.data('scrollPosition'));
            window.setTimeout(function () {
                $btnRead[0].focus();
            }, 100);
        });

        function embedVioVideo(){
            $('.viostream').each(function (idx) {            
                var vid_id = $(this).data('videoid')            
                var container_id = this.id = 'video_'+(idx+1)+vid_id                
                $viostream.embed(vid_id, container_id);                
            })    
    
            if($('.viostream').length){            
                var $tries = 0
                var allPlayer;
                var setupVideos = function(){
                    try{
                        allPlayer = videojs.getAllPlayers()
                        $(allPlayer).each(function () {
                            this.on("stopAll", function () {
                                $(allPlayer).each(function () {
                                    this.pause()
                                })
                            });    
                            this.on("play", function () {
                                var currentPlayer = this;
                                $(allPlayer).each(function () {
                                if (this.id_ != currentPlayer.id_) {
                                    this.pause()
                                }
                                })
                            });
                        })
    
                    }catch(e){
                        $tries++
                        if($tries<5){
                            setTimeout(setupVideos, 200);
                        }                   
                    }                   
                }
                setupVideos();
            }

        }

        const myTimeout = setTimeout(embedVioVideo, 500);

        function myStopFunction() {
            clearTimeout(embedVioVideo);
        }
     
    }
};
