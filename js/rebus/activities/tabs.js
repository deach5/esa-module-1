import { $body } from '../globals.js';
export default {
    init: function (partial) {
        $('[data-activity="tab-panel"]').each(function (actIdx) {
            var $activity = $(this).addClass('tab-panel'),
                details = rebus.stateHelper.getElementDetails($activity),
                activityId = details.storeId,
                btnsState = details.state,
                btnsDefaultState = '',
                activityStarted,
                $items = $('.nav-link', $activity),
                $reveals = $('.tab-pane', $activity);
            $items.each(function(t_idx){
                var cardid = 'act' + actIdx + '_t' + t_idx,
                    itemid = cardid + '_tab' + t_idx,
                    tabpanelid = cardid + '_tabpanel' + t_idx,
                    $tab = $(this),
                    $reveal = $reveals.eq(t_idx);
                $tab.attr({
                    'id': itemid,
                    'aria-controls': tabpanelid,
                    'data-idx': t_idx,
                    'href': '#'+ tabpanelid,
                    'role': 'tab',
                    'data-toggle': "tab",
                });
                $reveal.attr({
                    'id': tabpanelid,
                    'role': 'tabpanel',
                    'aria-labelledby': itemid
                });
                if (btnsState) {
                    if (btnsState.charAt(t_idx) === '1') {
                        $tab.addClass('item-done');
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
        $body.on('click', '.nav-link', function ( e ) {
            var $btn = $(this),
                $activity = $btn.closest('[data-activity]'),
                reveal = $btn.attr('href'),
                mandatory = $activity.data('mandatory'),
                required = mandatory === true ? $activity.find('.nav-link').length : mandatory;
                $btn.addClass('item-done');
                rebus.stateHelper.setElementState($activity, '1', $btn.data('idx'));
            if ($activity.find('.item-done').length >= required) {
                rebus.panels.setActivityAsComplete($activity);
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