import { $body } from '../globals.js';

var setActivityAsComplete = function () {
    var $activity = $(this).closest('[data-activity="video"]');
    if ($activity.length) {
        rebus.panels.setActivityAsComplete($activity, true);
        var $target = $activity.closest('.panel').data('scroll-when-done');
        setTimeout( function(){  
            rebus.utils.scrollToAnchor($target);
        }, 250 );
    }
};

export default {
    init: function (partial) {
        if (rebus.config.videosMustBePlayedThrough) {
            var $target = $('video');
                $target.on('ended', setActivityAsComplete);
            if (!partial) {
            $body.on('slid.bs.carousel', '.video-transcript .carousel', function () {
                if ($('.item:last', this).hasClass('active')) {
                    setActivityAsComplete.call(this);
                }
            });
            }
        } else {
            $('video').on('play', setActivityAsComplete);
            if (!partial) {
            $body.on('click', '.btn-read-transcript', setActivityAsComplete);
            }
        }
    }
};
