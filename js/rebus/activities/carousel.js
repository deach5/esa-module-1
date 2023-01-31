import { $body } from '../globals.js';

export default {
    init: function (partial) {
        $('[data-activity="carousel"]').each(function () {
            var $activity = $(this),
                $slides = $('.carousel-item', $activity),
                details = rebus.stateHelper.getElementDetails($activity),
                state = details.state,
                defaultState = '',
                activityStarted;
            $slides.each(function (i) {
                var $slide = $(this);
                $slide.attr('data-idx', i);
                if (i === $slides.length - 1) {
                    $slide.addClass('final-slide');
                }
                if(i === 0){
                    $slide.addClass('first-slide');
                }
                if (state) {
                    if (state.charAt(i) === '1') {
                        $slide.addClass('item-done');
                        activityStarted = true;
                    }
                } else {
                    defaultState += '0';
                }
            });
            if (activityStarted) {
                rebus.panels.markActivityAsStarted($activity);
            }
            rebus.stateHelper.setElementState($activity, state || defaultState);
        });
        if (!partial) {
            $body.on('slid.bs.carousel', '[data-activity="carousel"]', function (e) {
                var $activity = $(this),
                        $slide = $(e.relatedTarget),
                        $hasEmbeddedActivity = $slide.find('[data-activity]');
                rebus.stateHelper.setElementState($activity, '1', $slide.data('idx'));
                if ($slide.hasClass('final-slide')) {
                    rebus.panels.setActivityAsComplete($activity);
                } else {
                    rebus.panels.markActivityAsStarted($activity);
                }
                rebus.stateHelper.save();
                var pb = $activity.find( '[data-slide="prev"]' ),
                    nb = $activity.find( '[data-slide="next"]' );

                        $slide.hasClass( 'first-slide' ) ? pb.addClass( 'disabled' ).attr('aria-disabled', 'true') : pb.removeClass( 'disabled' ).attr('aria-disabled', 'false');
                        if( $slide.hasClass( 'final-slide' ) ){
                            $activity.addClass('on-last-slide'); 
                            nb.addClass( 'disabled' ).attr('aria-disabled', 'true');
                        } else{
                            $activity.removeClass('on-last-slide'); 
                            nb.removeClass( 'disabled' ).attr('aria-disabled', 'false');
                        }
                        if($hasEmbeddedActivity.length){
                            if($hasEmbeddedActivity.hasClass('activity-done')){
                                $slide.addClass('item-done');
                                nb.removeClass( 'disabled' ).attr('aria-disabled', 'false');
                            }else{
                                nb.addClass( 'disabled' ).attr('aria-disabled', 'true');
                            }
                        }
                $('.carousel-item').removeAttr('tabIndex');    
                $slide.attr('tabIndex','0');
                if(e.to) {
                    $('html, body').animate({
                        scrollTop: ($($activity).offset().top - $('header').height())
                    }, 500, 'swing', function(){
                        $slide[0].focus();
                    });
                }
            });
            $( '[data-activity="carousel"]' ).each( function () {
                var $activity = $(this),
                    $active_slide = $activity.find( '.carousel-item.active' );
                if ( $active_slide.length ) {
                    $activity.trigger( {
                        type: 'slid.bs.carousel',
                        relatedTarget: $active_slide[0]
                    });
                }
            } );
        }
    }
};
