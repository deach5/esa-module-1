/*
    <div data-activity="click-and-reveal" data-reveal-type="show|expand" data-reveal-in-order="true" data-show-only-one="true" data-mandatory="true">
        <ul>
            <li>
                <button type="button" class="btn btn-primary btn-reveal one" data-reveal=".reveal.one"><span>Item 1</span></button>
                <button type="button" class="btn btn-primary btn-reveal one" data-reveal=".reveal.two"><span>Item 2</span></button>
                ...
            </li>
        </ul>
        <p class="reveal one">Reveal 1</p>
        <p class="reveal two">Reveal 2</p>
        <div class="reveal one">Another Reveal 1</div>
    </div>

    > data-show-only-one: hide previous reveal item
    > The class 'item-active' is added to the current button and reveal items
    > The class 'click-and-reveal-item' is added to all reveal items
    > The class 'item-done' is added to the buttons and reveal items that have been completed
    > If [data-reveal-type] is omitted, "show" is used.
      > By default the following CSS is used to reveal the blocks:
        [data-activity="click-and-reveal"][data-reveal-type="show"] .click-and-reveal-item:not(.item-done) { display: none; }
    > [data-reveal-type="expand"] uses Bootstrap collapse to show/hide
*/
export default {
    init: function (partial) {
        if($(window).width() <= 767){
            $(".desktop-show").remove();
        }else{
            $(".modals.mobile-show").remove();
        }
        $('[data-activity="click-and-reveal"]').each(function () {
            var $activity = $(this),
                revealInOrder = $activity.data('reveal-in-order'),
                revealType = $activity.data('reveal-type'),
                details = rebus.stateHelper.getElementDetails($activity),
                btnsState = details.state,
                userText = '',
                textarea = false,
                qLabel,
                userTextInput = ($activity[0].dataset.textinput+"" === "true"),
                btnsDefaultState = '',
                activityStarted;
            // does this contain a text inut
            if(userTextInput)
            {
                textarea = $activity.find('textarea');
                // split text from button state
                if((typeof btnsState !== 'undefined') && (btnsState.indexOf('~|~') !== -1))
                {
                    let pieces  = btnsState.split('~|~')
                    btnsState   = pieces[0];
                    userText    = pieces[1];
                    qLabel      = pieces[2];
                    // populate with any retrieved data
                    textarea.val(userText);
                }
                // add keyup event (enable submit button)
                textarea[0].addEventListener('keyup', (event) => {
                   setTimeout(function(){
                    event.target.value !== "" ? 
                    $('button.submit', $activity).removeClass('disabled').prop('disabled', false) :
                    $('button.submit', $activity).addClass('disabled').prop('disabled', true);
                    $('.item-active', $activity).removeClass('item-active');
                   },100);
                });
            }
            if (!revealType) {
                revealType = 'show';
                $activity.attr('data-reveal-type', 'show');
            }
            $('[data-reveal]', $activity).each(function (btnIdx) {
                var $btn = $(this).attr('data-idx', btnIdx),
                    revealSelector = $btn.data('reveal'),
                    $associate = $btn.data('partner') ? $($btn.data('partner')) : null,            
                    $reveal = $(revealSelector,$activity).addClass('click-and-reveal-item'),
                    id = $reveal.attr('id');
                if($associate){
                    var $parent = $associate.parent(),
                        $kids = $parent.find('img:not(.static)').fadeOut();
                }
                if (revealType === 'expand') {
                    if (!id) {
                        id = details.storeId + '-' + btnIdx;
                        $reveal.attr('id', id);
                    }
                    $btn.attr({
                        'data-toggle': 'collapse',
                        'data-target': '#' + id,
                        'aria-expanded': 'false',
                        'aria-controls': id
                    });
                    $reveal.addClass('collapse');
                }
                if (btnsState) {
                    if (btnsState.charAt(btnIdx) === '1') {
                        $btn.addClass('item-done');
                        $reveal.addClass('item-done');
                        activityStarted = true;
                    }
                } else {
                    btnsDefaultState += '0';
                }
                if (revealInOrder && btnIdx > 0 && (btnsState || btnsDefaultState)[btnIdx - 1] === '0') {
                    $btn.attr('disabled', true);
                }
            });
            if (activityStarted) {
                rebus.panels.markActivityAsStarted($activity);
            }
            rebus.stateHelper.setElementState($activity, (btnsState || btnsDefaultState), undefined, userTextInput && textarea ? textarea.val()+'~|~'+textarea.attr('aria-label') : undefined);
        });
        if (partial) {
            return;
        }
        $('body').on('click', '[data-reveal]', function () {
            var $btn = $(this),
                idx = $btn.data('idx'),
                $activity = $btn.closest('[data-activity]'),
                userTextInput = ($activity[0].dataset.textinput+"" === "true"),
                textarea = $activity.find('textarea'),
                count = $('[data-reveal]', $activity).length,
                revealSelector = $btn.data('reveal'),
                $reveal = $(revealSelector, $activity),
                $associate = $btn.data('partner') ? $($btn.data('partner')) : null,
                mandatory = $activity.data('mandatory'),
                required = mandatory === true ? count : mandatory,
                data = "";
                if($btn.hasClass('submit')) $($btn).addClass('disabled').prop('disabled', true);
            $('.click-and-reveal-item.item-active', $activity).removeClass('item-active');

            if (mandatory) {
                $btn.append([
                    '<svg class="done-indicator gfx" focusable="false" role="presentation" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">',
                        '<use href="content/images/icons.svg#icon-topic-complete" xlink:href="content/images/icons.svg#icon-topic-complete" />',
                    '</svg>'
                ].join('\n'));
            }
            if($activity.data('show-only-one')){
                var _obs = $('.item-active', $activity);
                _obs.removeClass('item-active');
            }
            $btn.addClass('item-done item-active');
            $reveal.addClass('item-done item-active');
            if($associate){
                var $parent = $associate.parent(),
                    $kids = $parent.find('img:not(.static):not('+$btn.data('partner')+')');
                    $kids.fadeOut();
                    $associate.fadeIn()
            }
            if ( $reveal.hasClass( 'modal' ) ) {
                if ( $reveal.find( '.modal-body' ).length === 0 )
                    rebus.components.modalTemplates.buildFullModal( $reveal );
                $reveal.modal( 'show' );
            }
            if ($activity.data('reveal-in-order') && idx < count - 1) {
                $('[data-reveal][data-idx="' + (idx + 1) + '"]', $activity).removeAttr('disabled');
            }
            rebus.stateHelper.setElementState($activity, '1', $btn.data('idx'), (userTextInput ? (textarea.val() + '~|~' + textarea.attr('aria-label')) : undefined));
            if ($('[data-reveal].item-done', $activity).length >= required) {
                rebus.panels.setActivityAsComplete($activity);
            } else {
                rebus.panels.markActivityAsStarted($activity);
            }
            rebus.stateHelper.save();
        });
    }
};