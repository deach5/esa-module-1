import { $body } from '../globals.js';

/*
[data-submit-text]: Submit button text; if not present, defaults to 'Submit'

<div data-activity="slider" data-mandatory="partial" data-required="left|right">
    <div class="question">
        <p class="lms-question-text">...</p>
    </div>
    <div id="image-and-slider-container">
        <div class="img-container">
            <div class="point-img">...</div>
            <div class="point-img">...</div>
        </div>
        <div class="text-container">
            <div class="point-text">...</div>
            <div class="point-text">...</div>
        </div>
        <div class="activity-container"></div>
    </div>
</div>
*/
var performSubmit = function ($btn, $activity) {
    var selected,
        required,
        correct;
    $activity = $activity || $btn.closest('[data-activity]');
    selected = $activity.find('.activity-slider').slider('value');
    required = $activity.data('required') === 'left' ? 0 : 2;
    correct = selected === required;
    if (correct || !$activity.data('mandatory') || $activity.data('mandatory') === 'partial') {
        page.setInteraction({
            $activity: $activity,
            type: 'other',
            learnerResponse: selected,
            correctResponse: required,
            correct: correct
        });
        rebus.panels.setActivityAsComplete($activity, true, correct);
    }
    //alert('slider fb')
    questionFeedback.show(correct ? 'correct' : 'incorrect');
};

export default {
    init: function (partial) {
        $('[data-activity="slider"]').each(function () {
            var $activity = $(this),
                $container = $activity.find('.activity-container'),
                $question_text = $activity.find('.lms-question-text').last(),
                instantSubmit = 'instant' === $activity.data('submit-type'),
                state = rebus.stateHelper.getElementDetails($activity).state,
                $slider = $([
                    '<div class="activity-slider">',
                    '<div class="ui-slider-handle"></div>',
                    '</div>'
                ].join('\n')),
                $html = $('<div />', { 'class': 'activity-slider-range left' }).add($slider).add($('<div />', { 'class': 'activity-slider-range right' }));
                if (! $activity.find('.question-instructions') ) {
                    $('<p class="question-instructions">Slide to select the correct answer.</p>').insertAfter($question_text);
                }
            $container.append($html);
            if (!instantSubmit) {
                $container.append('<button type="button" class="btn-submit-answer btn btn-primary d-block mx-auto" disabled><span>' + ($activity.data('submit-text') || 'Submit') + '</span></button>');
            }
            $slider.slider({ orientation: 'horizontal', min: 0, max: 2, value: 1 });
            if (!state) {
                rebus.stateHelper.setElementState($activity, '0');
            }
        });
        if (partial) {
            return;
        }
        $body.on('slidechange', '[data-activity="slider"] .activity-slider', function (e, ui) {
            var $activity = $(this).closest('[data-activity]'),
                instantSubmit = 'instant' === $activity.data('submit-type');
            $('.activity-slider-range', $activity).removeClass('active');
            $activity.removeClass('isLeft isRight')
            if (ui.value === 1) {
                if (!instantSubmit) {
                    $('button', $activity).attr('disabled', true);
                }
            }
            else {
                if (ui.value === 0) {
                    $('.activity-slider-range.left', $activity).addClass('active');
                    $activity.addClass('isLeft');
                }
                else {
                    $('.activity-slider-range.right', $activity).addClass('active');
                    $activity.addClass('isRight');
                }
                if (instantSubmit) {
                    performSubmit(null, $activity);
                }
                else {
                    $('button', $activity).removeAttr('disabled');
                }
            }
        }).on('click', '[data-activity="slider"] button', function () {
            performSubmit($(this));
        }).on('click', '[data-activity="slider"] .point-text, [data-activity="slider"] .point-img', function () {
            var $this = $(this),
                $activity = $this.closest('[data-activity]');
            $('.activity-slider', $activity).slider("value", $this.index() === 0 ? 0 : 2);
            return false;
        });
    }
};