import { $body, page } from '../globals.js';

var showPageNotCompleteModal = function ($focusOnClosed) {
    var $continueBtn = $('[data-complete]'),
        continueBtnText = $continueBtn.length ? $continueBtn.text() : 'Continue';
    rebus.controls.modal.show({
        'class': 'page-not-complete-modal dark-bg',
        body: [
            '<h3 class="text-white my-3" tabindex="-1"><strong>Have you completed all of this screen yet?</strong></h3>',
            '<p>If not, you\'ll need to scroll through and complete all interactions to navigate to the next screen.</p>',
            '<button type="button" class="btn btn-primary" data-dismiss="modal"><span>Close</span></button>'
        ].join('\n'),

        focusOnClosed: $focusOnClosed
    });

};

export default {
    init: function () {
        $body.on('click', '[data-hide]', function () {
            $($(this).data('hide')).attr('hidden', true);
        }).on('click', '[data-show]', function () {
            $($(this).data('show')).removeAttr('hidden');
        }).on('click', '[data-proxy-trigger]', function () {
            let btn = $(this).data('proxy-trigger');
            let anchor = $(btn).attr('data-navigate-anchor');
            $(btn).removeAttr('data-navigate-anchor').click();
            $(btn).attr('data-navigate-anchor',anchor);
        }).on( 'click', '[data-complete]', function () {
            /*
                marks target as complete
                data-complete="activity|page|course|selector[,...]"
                when using selector target, use \, to include comma in query
            */
            var $this = $( this ),
                targets = $this.data( 'complete' );

            // split by comma, while skipping escaped comma
            targets = targets.split( ',' );

            $.each( targets, function ( idx, target ) {
                var $activity;

                switch ( target )
                {
                    case 'course':
                        SetReachedEnd();
                    break;
                    case 'page':
                        rebus.stateHelper.setPageAsComplete( page ).save();
                    break;
                    case 'activity':
                        $activity = $this.closest('[data-activity]');
                        rebus.panels.setActivityAsComplete($activity, true);
                    break;
                    default: // target is activity selector
                        // un-escape comma

                        $activity = $( target );
                        rebus.panels.setActivityAsComplete($activity, true);
                }
            } );

        }).on('click', '[data-set-activity-complete]', function () {
            var $this = $(this),
                activity = $this.data('set-activity-complete'),
                $activity;
            if (!activity || activity === true) {
                if (false !== activity) {
                    $activity = $this.closest('[data-activity]');
                }
            } else {
                $activity = $(activity);
            }
            if ($activity) {
                panels.setActivityAsComplete($activity, true);
            }
        }).on('click', '[data-mark-page-as-complete]', function () {
            rebus.stateHelper.setPageAsComplete(page).save();
        }).on('click', '[data-mark-course-as-complete]', function () {
            Track.setLessonCompleted();
        }).on('click', '[data-mark-course-as-complete-and-exit]', function () {
            if(Track.setLessonCompleted())
            {
                Track.commit(true);
            }
        }).on('click', '[data-mark-page-as-complete-and-continue]', function () {
            var url = $(this).data('mark-page-as-complete-and-continue');
            rebus.stateHelper.setPageAsComplete(page).save();
            if (url) {
                rebus.navigation.gotoPage(url);
            } else {
                rebus.navigation.gotoNextPage();
            }
        }).on('click', '[data-navigate]:not([disabled])', function () {
            var $this = $( this ),
                url = $this.data('navigate');

            if ( url === 'next' ){
                // show page not complete modal if user tries to nav to next page before completing this one
                // except when takePagesInOrder is false
                if ( page.topic && rebus.config.takePagesInOrder && ! rebus.stateHelper.isPageComplete( page ) ){
                    showPageNotCompleteModal( $this );
                    return false;
                }
            }
            rebus.navigation.gotoPage( url );
            return false;
        }).on('click', '[data-navigate-anchor]', function () {
            rebus.utils.scrollToAnchor($(this).data('navigate-anchor'));
        }).on('click', '[data-navigate-anchor-next]', function (e) {
            e.preventDefault();
            var $target = $(this).closest('.panel').data('scroll-when-done');
            setTimeout( function(){
                rebus.utils.scrollToAnchor($target);
            }, 250 );
        }).on('click', '[data-exit-course]', function () {
            // Handle this last to make sure any of the above are handled before exiting
            Track.commit(true);
        });
    }
};
