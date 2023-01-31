import { $body } from '../globals.js';
import components from '../components.js';

/**
@function
@name initClickButtons
@memberof rebus.activities
@param {boolean|Number} data-mandatory
@example
<ul class="click-btns" data-activity="click-btns" data-mandatory="true">
    <li>
        <button class="click-btn" type="button"></button>
        <div class="modal" data-audio-file="...">...</div>
    </li>
</ul>
*/
export default {
    dispose: function () {
        $('.click-btns-modal').remove();
    },
    init: function (partial) {
        $('[data-activity="click-btns"]').each(function () {
            var $activity = $(this),
                details = rebus.stateHelper.getElementDetails($activity),
                activityId = details.storeId,
                apiId = details.apiId,
                btnsState = details.state,
                btnsDefaultState = '',
                activityStarted;
            $activity.find('.click-btn, .click-btn-audio button').each(function (li_idx) {
                var $btn = $(this),
                    $li = $btn.closest('li').length ? $btn.closest('li') : $btn,
                    $modal = $li.find('.modal'),
                    $popovers,
                    modalId = activityId + '-modal-' + li_idx,
                    $associate = $btn.data('partner') ? $($btn.data('partner')) : null,  
                    feedback = $btn.data('feedback');
                $li.attr({
                    'data-idx': li_idx
                });
                if ($modal.length) {
                    $btn.attr({
                        'data-toggle': 'modal',
                        'data-target': '#' + modalId
                    });
                }
                $btn.append('<span class="done-indicator sr-only">Visited</span>');
                if (btnsState) {
                    if (btnsState.charAt(li_idx) === '1') {
                        $li.addClass('item-done');
                        if($activity.attr('role') === 'radiogroup') 
                        {
                            $li.attr('aria-checked','true'); 
                        }                       
                        if (feedback) {
                            $(feedback).addClass('done');
                        }
                        if($associate){
                            $associate.addClass('item-done')
                        }
                        activityStarted = true;
                    }
                } else {
                    btnsDefaultState += '0';
                }
                if ($modal.length) {
                    $li.find('.modal').addClass('modal-template click-btns-modal' + ($activity.hasClass('standard') ? ' standard' : ''))
                        .attr('id', modalId).detach().appendTo($body);
                } else {
                    $popovers = $activity.find('[data-toggle="popover"]');
                    if ($popovers.length) {
                        $activity.find('[data-toggle="popover"]').popover({
                            template: '<div class="popover ' + activityId + '-popover' + ($(this).data('popover-class') ? ' ' + $(this).data('popover-class') : '') + '" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
                        }).on('show.bs.popover', function () {
                            $('.' + activityId + '-popover.in').popover('hide');
                        });
                    }
                }
            });
            if (activityStarted) {
                rebus.panels.markActivityAsStarted($activity);
            }
            rebus.stateHelper.setElementState($activity, btnsState || btnsDefaultState);
        });

        if (partial) {
            return;
        }


        // Colin - Added partial support new code
        $body.on('click', '.click-btn, .click-btn-audio button', function () {
            var $btn = $(this),
                $li = $btn.closest('li').length ? $btn.closest('li') : $btn,
                $activity = $li.closest('[data-activity]'),
                mandatory = $activity.data('mandatory'),
                $associate = $btn.data('partner') ? $($btn.data('partner')) : null,  
                minClicks = $activity.data('min-clicks'),
                required,
                feedback = $btn.data('feedback'),
                show = $btn.data( 'show' ),
                show_mobile_modal = $btn.data( 'showMobileModal' ),
                $show = $( show ),
                $modal,
                details,
                correct;
            $li.addClass('item-done');

            if($associate){
                $associate.addClass('item-done');
            }
            if ( $show.length ) {
                $activity.find( '.show' ).removeClass( 'show' );
                $activity.find( '.active' ).removeClass( 'active' );

                $btn.addClass( 'active' );

                if ( show_mobile_modal && rebus.features.isSize( 'xs' ) ) {
                    $modal = $show.clone().addClass( 'modal modal-template' ).appendTo( $body );
                    components.modalTemplates.buildFullModal( $modal );
                    $modal.modal().on( 'hidden.bs.modal', function () {
                        $( this ).remove();
                    } );
                }
                else
                    $show.addClass( 'show' );
            }

            if (mandatory === true)
                required = $activity.find('.click-btn,.click-btn-audio button').length;
            else if (mandatory === 'partial') {
                required = $activity.data('min-clicks') ? $activity.data('min-clicks') : 1;
            } else {
                required = $activity.find('.click-btn,.click-btn-audio button').length;
            }
            // check if buttons selection are exclusive of other (radiogroup)
            if($activity.attr('role') === 'radiogroup')
            {
                // clear all other selections
                $('[aria-role="radio"]',$activity).each(function(ixx,ell){
                    rebus.stateHelper.setElementState($activity, '0', ixx);
                });
            }
            rebus.stateHelper.setElementState($activity, '1', $li.data('idx'));
            if ($activity.find('.item-done').length >= required) {
                rebus.panels.setActivityAsComplete($activity);
                if (feedback) {
                    $(feedback).addClass('done');
                }
                correct = true;
            } else {
                rebus.panels.markActivityAsStarted($activity);
                correct = false;
            }
            rebus.stateHelper.save();
        } );
    }
};
