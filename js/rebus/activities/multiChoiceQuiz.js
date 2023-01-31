import { $body } from '../globals.js';
import components from '../components.js';

/*
    [data-show-answer]: Boolean
    [data-type]: 'checkbox' | 'radio'
    [data-answer]: 'any' | 'anyOrNone' - Use instead of individual [data-required] attributes on the items. Can be, used in the future, for more complex requirements
    [data-required-selections]: Number | 'min:Number'. If omitted, at least one selection must be made
    [data-feedback] - used if there is more than 1 incorrect modal
    [data-instant-feedback-mouse] - If present, the submit button is only shown if keyboard input is detected
    [data-submit]: Submit button text; if not present, defaults to 'Check my answer'
    [data-noannounce]: 'true' | 'false' - Used to determine whether to use aria-live="assertive" on feedback - If not present the default is 'false'

    <form onsubmit="return false;" class="multiple-choice-quiz" data-activity="multiple-choice-quiz" data-type="radio" data-mandatory="true" data-show-answer="true">
        <ul class="multiple-choice-quiz-options">
            <li>Yes</li>
            <li data-required="true">No</li>
        </ul>
        <div class="modal correct" data-audio-file="...">...</div>
        <div class="modal incorrect" data-audio-file="...">...</div>
        <div class="modal no-answer" data-audio-file="...">...</div>
    </form>

    If there's more than one incorrect feedback, specify as follows:

        <li data-feedback="incorrect.other">...</li>
        ...
        <div class="modal incorrect other">...</div>

    Inline feedback
    ---------------
    Replace the modal feedbacks with:
        <div class="inline-feedback">...</div>
        <div class="inline-feedback">...</div>
        ...

    > List them in order of the options; one for each.
    > For incorrect feedback, make sure each is unique so that it'll be announced to screen-readers


    Other feedback
    --------------
    If a binary feedback option is needed and youi don't want a modal or inline you can simply add feedbacks within the data-activity e.g.

    <form class="multiple-choice-quiz quiz-option2 quiz-purple" data-activity="multiple-choice-quiz" data-type="radio" data-mandatory="true" >
        <ul class="multiple-choice-quiz-options">
            <li>...</li>
            <li data-required="true">...</li>
        </ul>
        <div class="feedback incorrect">
            <p>...</p>
        </div>
        <div class="feedback correct">
            <p>...</p>
        </div>
     </div>

    Complex content in the label
    ----------------------------

    It's not valid to put something like an image into a Label element and IE will fail to trigger a click if an image is clicked.
    To fix this:
    <li>MyText<img class="append-after triggers-input" src="..." /></li>

    The image will be appended after the label and, since .triggers-input is included, a click will be triggered on the input when the element is clicked.
*/
var setCheckAnswerBtnState = function ($activity) {
    var requiredSelections = $activity.attr('data-required-selections'),
        selected = $activity.find('input[type="' + $activity.data('type') + '"]:checked').length,
        enable;
    if (requiredSelections === undefined) {
        enable = selected > 0;
    }
    else {
        requiredSelections = requiredSelections.split(':');
        if (requiredSelections.length > 1) {
            enable = selected >= parseInt(requiredSelections[1], 10);
        }
        else {
            enable = selected === parseInt(requiredSelections[0], 10);
        }
    }
    $activity.find('.btn-check-multi-choice-answers, .btn-submit-assessment-answer').prop('disabled', !enable);
};

var showAnswer = function ($activity) {
    if ($activity.data('show-answer')) {
        $activity.addClass('show-answer');
    }
};

var setAsComplete = function ($activity) {
    showAnswer($activity);
    rebus.panels.setActivityAsComplete($activity, true);
};

// Returns true | false | 'partial' (for checkboxes)
var getResult = function ($activity) {
    var globalAnswer = $activity.data('answer');
    if (globalAnswer) {
        if (globalAnswer === 'anyOrNone') {
            return true;
        }
        if (globalAnswer === 'any') {
            return !!$activity.find('input[type="' + $activity.data('type') + '"]:checked').length;
        }
    }
    if ($activity.data('type') === 'radio') {
        return !!$('input:checked', $activity).closest('li').data('required');
    }
    var requiredCount = 0,
        correctCount = 0, notrequiredCount = 0;
    $('.multiple-choice-quiz-options li', $activity).each(function () {
        var $this = $(this),
            checked = $this.find('input').prop('checked'),
            required = $this.attr('data-required') === 'true';
        requiredCount += required ? 1 : 0;
        notrequiredCount += !required && checked ? 1 : 0;
        correctCount += required && checked === required ? 1 : 0;
    });
    let result = ((correctCount === requiredCount) && (notrequiredCount === 0) ? true : correctCount > 0 ? 'partial' : false);
    return result
};

export default {
    init: function () {
            if($('[data-activity="multiple-choice-quiz"]').length === 0) return;
            var keyboard = true;
            var performSubmit = function ($submit, $activity, announce, pageload) {
                var $checkedOption, result,
                    responses, response,
                    showPartialCorrect, $type, $customfeedback, $attempt;
                if($submit) $submit.prop('disabled','true');
                $activity = $activity || $submit.closest('[data-activity="multiple-choice-quiz"]');
                showPartialCorrect = $activity.hasClass('show-partial-correct');
                $type = $activity.data('type');
                responses = $activity.data('responses');
                $customfeedback = ($activity.data('custom-feedback') && $activity.data('custom-feedback')+"" === "true");
                $attempt = Number($activity.attr('data-attempt'));
                $checkedOption = $activity.find('input:checked').closest('li');
                result = getResult($activity);
                if(result === true)
                {
                    $activity.find('.multiple-choice-quiz-options > li').addClass('disabled');
                    // $activity.find('.multiple-choice-quiz-options').addClass('disabled');
                }
                pageload = pageload || false;
                if($activity.data('noannounce')) announce = false;
                $activity.attr('data-correct', result === true ? 'true' : showPartialCorrect ? result : 'false').addClass('activity-submit');
                
                if($customfeedback)
                {
                    // increment attempt
                    $attempt++;
                    // correct
                    if(result+"" === "true") 
                    {   
                        response = responses['correct'];
                    // incorrect
                    }else{
                        // check attempts
                        response = ($attempt === 1 ? responses['incorrect-tryagain'] : responses['incorrect']);
                    }
                    $activity.attr('data-attempt', $attempt);
                }else{
                    if($type !== "checkbox")
                    {
                        response = responses[$checkedOption.attr('data-response')];
                    }else {
                        response = responses[(result === true ? 'correct' : 'incorrect')];
                    }
                    if (showPartialCorrect && result === 'partial') {
                        response = '<p class="first">That’s not quite right, have another go. </p>' + response;
                    }
                }
                $activity.data('$fb').liveFeedback('value', response, {
                    silent: !announce
                });
                $activity.find('.btn-quiz-try-again').on('click', '', function () {
                    var $button = $(this),
                        $activity = $button.closest('[data-activity="multiple-choice-quiz"]');
                        $activity.attr('data-correct','').removeClass('activity-submit');
                        $('.response-text',$activity).html("");
                        $('.checked',$activity).removeClass('checked');
                        $('.btn-check-multi-choice-answers',$activity).prop('disabled',false);
                        $activity.find('.multiple-choice-quiz-options > li').removeClass('disabled');
                        $activity.find('.multiple-choice-quiz-options').removeClass('disabled');
                        $activity.find('input').prop('checked', false);
                        $('html, body').animate({
                            scrollTop: ($('.multiple-choice-quiz-options',$activity).offset().top - ($('header').height()+20))
                        }, 500, 'swing', function(){
                            $('ul > li:first-child > input',$activity)[0].focus();
                        });
                })
                if (result === true || !$activity.data('mandatory') || $activity.data('mandatory') === 'partial' || ($customfeedback && $attempt > 1)) {
                    setAsComplete($activity);
                }
                
                if(!pageload)
                {
                    var container = $activity.find('.response');
                    // clear tabindexes
                    $('.response').removeAttr('tabIndex');
                    // give current response a focusable tabindex
                    container.attr('tabIndex','0');
                    // send the cursor to the element
                    container[0].focus();
                } 

            };

            $('[data-activity="multiple-choice-quiz"]').each(function () {
                var $activity = $(this),
                    $ul = $activity.find('ul.multiple-choice-quiz-options'),
                    //$inlineFeedback,
                    details = rebus.stateHelper.getElementDetails($activity),
                    activityId = details.storeId,
                    optionsState = details.state,
                    optionsDefaultState = '',
                    type = $activity.data('type'),
                    noannounce = ($activity.data('noannounce')+'' === 'true' || false),
                    activityStarted,
                    needsIconSwap = $activity.data('dark-icons');

                $ul.addClass(type === 'radio' ? 'radio-list' : 'checkbox-list');

                // $activity.find('.modal').each(function () {
                //     var $modal = $(this),
                //         btnText = $modal.hasClass('correct') ? 'Continue' : $modal.hasClass('incorrect') ? 'Continue' : 'OK, thank you. I understand.',
                //         modalId = activityId + '-' + $modal.attr('class').split(' ').join('-');
                //     hasFeedback = true;
                //     if ($modal.hasClass('no-answer')) {
                //         hasGiveUpModal = true;
                //     }
                //     $modal.detach().addClass('modal-template multiple-choice-quiz-modal').attr({ 'id': modalId, 'data-buttons': btnText }).appendTo($body);
                // });

                var responses = {};
                $activity.data('responses', responses);
                $('[data-response]', $activity).each(function () {
                    var $response = $(this);
                    responses[$response.attr('data-response')] = $response.html();
                    $response.remove();
                });
                if (!$('.btn-check-multi-choice-answers', $activity).length) {
                    $ul.after('<div class="text-right"><button type="button" class="btn btn-lg btn-primary btn-check-multi-choice-answers" disabled><span>' + ($activity.data('submit') || 'Check my answer') + '</span></button></div><p class="mobile-feedback-indicator-container"><span class="feedback-pointer"></span></p>');
                }
                if ($activity.attr('data-instant-feedback-mouse') !== undefined) {
                    $activity.find('.btn-check-multi-choice-answers').attr('hidden', true);
                }
                var $icon = typeof(needsIconSwap) === 'undefined' ?  'thumbs-down' : 'thumbs-down-dark';
                var $arialive = noannounce ? '' : 'aria-live="assertive" aria-atomic="false"';
                var $response = $([
                    '<div class="response">',
                        '<div class="py-3">',
                            '<img class="icon-thumb-up" src="content/images/icons/thumbs-up.svg" alt="Correct!" />',
                            '<img class="icon-thumb-down" src="content/images/icons/'+$icon+'.svg" alt="Incorrect" />',
                            '<div class="response-text" '+$arialive+' ></div>',
                        '</div>',
                    '</div>'
                ].join('\n'));

                if ($activity.data('append-response-to')) {
                    $($activity.data('append-response-to')).append($response).addClass('response-container');
                }else {
                    $('.question', $activity).after($response);
                }
                $activity.data('$fb', $('.response-text', $response).liveFeedback());

                $ul.find('li').each(function (optionIdx) {
                    var $li = $(this),
                        $appendAfter = $li.find('.append-after').removeClass('append-after').detach(),
                        appendAfter = $appendAfter.length ? $appendAfter[0].outerHTML : '',
                        label = $li.html(),
                        optionId = activityId + '_o' + optionIdx,
                        response = ($li.attr('data-response') ? $li.attr('data-response') :( $li.attr('data-required') === 'true' ? 'correct' : 'incorrect')),
                        inputHTML;
                    if (type === 'radio') {
                        inputHTML = '<input type="radio" data-idx="' + optionIdx + '" id="' + optionId + '" name="rg_' + activityId + '" />';
                    }else {
                        inputHTML = '<input type="checkbox" data-idx="' + optionIdx + '" id="' + optionId + '" />';
                    }
                    $li.attr({ 'data-response': response }).empty().append([
                        inputHTML,
                        '<label for="' + optionId + '">',
                        '<span class="indicator">',
                        '<span class="sr-only">Correct option</span>',
                        '<svg focusable="false" role="presentation" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                        '<use href="content/images/icons.svg#icon-tick" xlink:href="content/images/icons.svg#icon-tick" />',
                        '</svg>',
                        '</span>',
                        label,
                        '</label>',
                        appendAfter
                    ].join('\n'));
                    //
                    if (optionsState) {
                        if ((type === 'checkbox' && optionsState.charAt(optionIdx) === '1') || (type === 'radio' && optionIdx + '' === optionsState)) {
                            $li.addClass('checked');
                            $li.find('input').prop('checked', true);
                            setCheckAnswerBtnState($activity);
                            activityStarted = true;
                        }
                    }else if (type === 'checkbox') {
                        optionsDefaultState += '0';
                    }else {
                        optionsDefaultState = '-1';
                    }
                });
                if (activityStarted) {
                    rebus.panels.markActivityAsStarted($activity);
                    if ($activity.hasClass('activity-done')) {
                        performSubmit(null, $activity, false, true);
                        showAnswer($activity);
                    }
                }
                rebus.stateHelper.setElementState($activity, optionsState || optionsDefaultState);
                setCheckAnswerBtnState($activity);
            });

            $('body').on('mousedown touchstart', '.radio-list li', function () {
                keyboard = false;
            }).on('keydown', '.radio-list li', function () {
                keyboard = true;
            }).on('focus', '.radio-list:not(.disabled) input, .checkbox-list:not(.disabled) input', function () {
                $(this).closest('li').addClass('focussed-pseudo');
            }).on('blur', '.radio-list:not(.disabled) input, .checkbox-list:not(.disabled) input', function () {
                $(this).closest('li').removeClass('focussed-pseudo');
            }).on('change', '.radio-list:not(.disabled) input', function (e) {
                var $input = $(this),
                    $activity = $input.closest('[data-activity="multiple-choice-quiz"]'),
                    $submit = $activity.find('.btn-check-multi-choice-answers'),
                    instantFeedback = !keyboard && $activity.attr('data-instant-feedback-mouse') !== undefined;
                $activity.removeAttr('data-correct data-partially-correct').data('$fb').liveFeedback('value', '');
                //$activity.removeClass('show-inline-feedback');
                $input.closest('.radio-list').find('.checked').removeClass('checked');
                $input.closest('li').addClass('checked');
                rebus.stateHelper.setElementState($activity, $input.data('idx') + '');
                rebus.panels.markActivityAsStarted($activity);
                rebus.stateHelper.save();
                if (instantFeedback) {
                    $submit.attr('hidden', true);
                    $activity.removeClass('submit-visible');
                    performSubmit($submit, $activity, true);
                }
                else {
                    $submit.removeAttr('hidden');
                    $activity.addClass('submit-visible');
                }
                setTimeout(function () {
                    setCheckAnswerBtnState($activity);
                }, 100);
            }).on('click', '.checkbox-list:not(.disabled) input', function () {
                var $input = $(this),
                    $activity = $input.closest('[data-activity="multiple-choice-quiz"]'),
                    $option = $input.closest('li'),
                    $submit = $activity.find('.btn-check-multi-choice-answers');
                $activity.removeAttr('data-correct data-partially-correct').data('$fb').liveFeedback('value', '');
                $option.toggleClass('checked')
                rebus.stateHelper.setElementState($activity, $input.is(":checked") ? '1' : '0', $input.data('idx'));
                rebus.panels.markActivityAsStarted($activity);
                rebus.stateHelper.save();
                setTimeout(function () {
                    setCheckAnswerBtnState($input.closest('[data-activity="multiple-choice-quiz"]'));
                }, 100);
                if ($activity.attr('data-instant-feedback-mouse')) {
                    performSubmit($submit, $activity, true);
                }
            }).on('click', '.btn-check-multi-choice-answers', function () {
                var $btn = $(this),
                    $activity = $btn.closest('[data-activity="multiple-choice-quiz"]');
                performSubmit($btn, null, true);
                document.dispatchEvent(new CustomEvent("multiplechoicesubmit", { detail: {
                    $activity: $activity,
                    result: getResult($activity)
                } }));
                return false;
            }).on('click', '.btn-tried', function () {
                var $btn = $(this),
                    $activity = $btn.closest('[data-activity="multiple-choice-quiz"]');
                //$btn.prop('disabled', true); We can't disable it because we focus on it after the modal is closed
                modalTemplates.setFocusOnClosed($btn);
                $('#' + $activity.attr('data-storeid') + '-modal-no-answer').modal();
                setAsComplete($activity);
            }).on('click', '.triggers-input', function () {
                $(this).closest('li').find('input').trigger('click');
            });
        },
        getResult: getResult,
        //reset: function ($quiz) {
        //    $quiz.find('input:checked').prop('checked', false);
        //    $quiz.find('.checked').removeClass('checked');
        //    return this;
        //},
        rebuildOptions: function ($activity) {
            var details = rebus.stateHelper.getElementDetails($activity),
                activityId = details.storeId,
                type = $activity.data('type');

            state[$activity.data('storeid')] = '-1';
            $activity.find('input:checked').prop('checked', false);
            $activity.find('.checked').removeClass('checked');

            $activity.find('ul.multiple-choice-quiz-options li').each(function (optionIdx) {
                var $li = $(this),
                    label = $li.html(),
                    optionId = activityId + '_o' + optionIdx,
                    inputHTML;
                if (type === 'radio') {
                    inputHTML = '<input type="radio" data-idx="' + optionIdx + '" id="' + optionId + '" name="rg_' + activityId + '" />';
                }
                else {
                    inputHTML = '<input type="checkbox" data-idx="' + optionIdx + '" id="' + optionId + '" />';
                }
                $li.addClass('clearfix').attr({ 'role': 'presentation' }).empty().append([
                    inputHTML,
                    '<label for="' + optionId + '">',
                    '<span class="indicator" aria-hidden="true"><img src="images/multichoice.png" alt="" /></span>',
                    '<span class="correct-indicator" aria-hidden="true"><img src="images/icon_tick_red.png" alt="" /></span>',
                    label,
                    '</label>'
                ].join('\n'));
            });
            return this;
    }
};