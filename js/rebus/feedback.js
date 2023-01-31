/**
 * Feedback class that automatically switches to modal feedback based on options.
 * Can be created either using the feedback jquery function, or using the rebus.feedback class.
 * 
 * options can either be passed to the constructor, or be set on the element using data-* attrs
 * the options passed to the constructor will override any data attrs set
 * 
 * @class
 * @alias rebus.feedback
 *
 * @param {jQueryElement} $feedback - the feedback element
 * @param {Object} options - options to control how the feedback el is setup
 * @param {bool|string} options.modal - when bool is used, contols whether to turn feedback el into modal or not.
 *                                    - when string is used, it will only turn it into a modal when the current screen size matched the one given (xs,sm,md,lg)
 *                                    - this will default to true if the feedback el has the modal class set
 * @example <caption>Show a basic, non-modal feedback</caption>
 * <div class="feedback correct">...</div>
 * <script>$( '.feedback' ).feedback().show()</script>
 * @example <caption>Show a modal feedback using modal class</caption>
 * <div class="feedback modal correct">...</div>
 * <script>$( '.feedback' ).feedback().show()</script>
 * @example <caption>Show a modal feedback using option</caption>
 * <div class="feedback correct">...</div>
 * <script>$( '.feedback' ).feedback( { modal: true } ).show()</script>
 * @example <caption>Show a modal feedback xs screens using data attr</caption>
 * <div class="feedback correct" data-modal="xs">...</div>
 * <script>$( '.feedback' ).feedback().show()</script>
 */
var Feedback = function ( $feedback, options ) {
    this.$feedback = $feedback;
    this.options = {};

    $.extend( this.options, {
        modal: $feedback.hasClass( 'modal' )
    }, $feedback.data(), options );

    if (
        this.options.modal === true ||
        ( typeof this.options.modal === 'string' && rebus.features.isSize( this.options.modal ) )
    )
    {
        // setup modal
        this.$feedback.detach().removeClass( 'feedback' ).addClass('feedback-modal modal').appendTo( $( 'body' ) );
        rebus.components.modalTemplates.buildFullModal( this.$feedback );
    }
};

Feedback.prototype.show = function()
{
    if ( this.$feedback.hasClass( 'modal' ) )
        this.$feedback.modal( 'show' );
    else
        this.$feedback.addClass( 'show' );
};
Feedback.prototype.hide = function()
{
    if ( this.$feedback.hasClass( 'modal' ) )
        this.$feedback.modal( 'hide' );
    else
        this.$feedback.removeClass( 'show' );
};

$.fn.feedback = function ( options )
{
    var $this = $( this ), obj;

    // only return obj if this is a single el query
    if ( $this.length == 1 )
    {
        obj = $this.data( 'feedback-obj' );
        if ( obj )
            return obj;
    }

    // init any feedbacks that require it
    $this.each( function () {
        var $feedback = $( this ),
            obj = $feedback.data( 'feedback-obj' );

        if ( ! obj )
        {
            obj = new Feedback( $feedback, options );
            $feedback.data( 'feedback-obj', obj );
        }
    } );

    return $this;
};

export default Feedback;
