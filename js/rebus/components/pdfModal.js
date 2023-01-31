import { $body } from '../globals.js';
var html, modal, onClosed, url;
var showCore = function () {

    modal = rebus.controls.modal.show({
        'class': 'pdf-modal full-width max-width-content',
        body: html,
        onClosed: onClosed,
        noFade: true,
        onBuild: buildComplete
    });
    
    
    
};
var buildComplete = function() {
    var $iframe = document.getElementById('pdf_iframe');
    $iframe.src = url +'#view=fitH&pagemode=none&toolbar=1&navpanes=0';
}
export default {
    show: function (callback, $url) {
        onClosed = callback;
        url = $url;
        if (html) {
            showCore();
        } else {
            $.get("content/ajax/pdf_viewer.html", function (data) {
                html = data;
                showCore();
            });
        }
    },
    hide: function (callback) {
        modal.hide(callback);
    },
    reshow: function (callback) {
        modal.show(callback);
    }
};
