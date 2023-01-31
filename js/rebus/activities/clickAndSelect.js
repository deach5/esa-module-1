import { $body } from '../globals.js';

export default {
    init: function (partial) {
        $('[data-activity="click-select"]').each(function (actIdx) {
            var $activity = $(this),
                id = $activity.attr('id') || 'click-select_' + actIdx,
                mandatory = !!$activity.data('mandatory'),
                details = rebus.stateHelper.getElementDetails($activity),
                activityId = details.storeId,
                btnsState = details.state,
                btnsDefaultState = '',
                activityStarted;

                $activity.attr({
                    id: id, 
                    role: 'tablist', 
                    'aria-multiselectable': 'true'
                })
                .find('.card')
                .each(function (aIdx) {
                    var cardid = 'act' + actIdx + '_c' + aIdx,
                    tabid = cardid + '_tab' + aIdx,
                    tabpanelid = cardid + '_tabpanel' + aIdx,
                    $aCard = $(this),
                        $aTab = $('.card-header', $aCard),
                        $btn = $('button', $aTab),
                        $aTabPanel = $('> div', $aCard); // accordion reveal content block


                $aTab.attr({
                    'id': tabid,
                        'data-idx': aIdx
                    });
                    $btn.attr({
                    'data-toggle': 'collapse',
                        'data-target': '#' + tabpanelid,
                    'aria-expanded': "false",
                    'aria-controls': tabpanelid
                    }).append('<span class="sr-only">Visited</span>').addClass('collapsed');

                    // if (mandatory) {
                        $btn.append([
                            '<svg class="done-indicator gfx" focusable="false" role="presentation" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">',
                                '<use href="content/images/icons.svg#icon-topic-complete" xlink:href="content/images/icons.svg#icon-topic-complete" />',
                            '</svg>'
                        ].join('\n'));
                    // }
                $aTabPanel.attr({
                    'id': tabpanelid,
                    'role': 'tabpanel',
                        'data-parent': '#' + id,
                    'aria-labelledby': tabid
                }).addClass('collapse');


                if (btnsState) {
                    if (btnsState.charAt(aIdx) === '1') {
                        $aTab.addClass('item-done');
                        activityStarted = true;
                    }
                } else {
                    btnsDefaultState += '0';
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
        $body.on('click', '.accordion .card-header button', function () {
            var $btn = $(this),
                $tabID = '#' + $btn.closest('h2').attr('id'),
                $activity = $btn.closest('[data-activity]'),
                $header = $btn.closest('.card-header'),
                mandatory = $activity.data('mandatory'),
                required = mandatory === true ? $activity.find('.card-header').length : mandatory,
                isEmbeddedActivity = $activity.closest('.has-child-activity'),
                feedback = $btn.data('card-body');
                $header.addClass('item-done').addClass('active');
                rebus.stateHelper.setElementState($activity, '1', $header.data('idx'));
                if(!$activity.get(0).hasAttribute('data-no-anchoring')){
                    setTimeout(function(){
                        $('html, body').animate({
                            scrollTop: ($($tabID).offset().top - $('header').height())
                        }, 500);
                    },500);
                }else{
                }
            if ($activity.find('.item-done').length >= required) {
                rebus.panels.setActivityAsComplete($activity);
                isEmbeddedActivity.addClass('item-done');
                var parentActivity = isEmbeddedActivity.closest('[data-activity]');
                    var nb = parentActivity.find( '[data-slide="next"]' );
                    nb.removeClass( 'disabled' ).attr('aria-disabled', 'false');
                if (feedback) {
                    $(feedback).addClass('done');
                }
            } else {
                rebus.panels.markActivityAsStarted($activity);
            }
            rebus.stateHelper.save();
        });
    }
};
