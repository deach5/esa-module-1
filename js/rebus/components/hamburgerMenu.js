import { $body } from '../globals.js';

var closeMenu = function ($btn) {
    var $menu = $btn ? $btn.closest('.dropdown-mnu') : $('.dropdown-mnu [aria-expanded="true"]').closest('.dropdown-mnu');
    $body.off('click.close-dropdown-mnu');
    $menu.find('a.toggle').attr('aria-expanded', 'false').find('.sr-only').text('Open menu');
    $menu.find('.dropdown-mnu-items').removeClass('in');
};

export default {
    init: function () {
        $body.on('click', '.dropdown-mnu a.toggle', function (e) {
            var $this = $(this);
            if ($this.attr('aria-expanded') === 'false') {
                $this.attr('aria-expanded', 'true').find('.sr-only').text('Close menu');
                $this.closest('.dropdown-mnu').find('.dropdown-mnu-items').addClass('in');
                $body.on('click.close-dropdown-mnu', function (e) {
                    if (!$(e.target).closest('.dropdown-mnu-items').length) {
                        closeMenu();
                    }
                });
            }
            e.preventDefault();
        }).on('click', '[data-action]', function () {
            var $btn = $(this),
                action = $btn.data('action'),
                $url = $btn.data('url');
            closeMenu($btn);
            /*if (action === 'show-resources') {
                resourcesModal.show();
            } else*/ 
            if (action === 'show-progress') {
                rebus.components.progressModal.show({
                    page: rebus.navigation.getPage(),
                    $focusOnClosed: $btn.closest('.dropdown-mnu').find('a')
                });
            } else if (action === 'show-help') {
                $.get("content/ajax/help.html", function (data) {
                    rebus.controls.modal.show({
                        'class': 'full-width max-width-content',
                        body: data,
                        focusOnClosed: $('#dropdown-mnu-main > a')
                    });
                });
            } else if (action === 'show-pdf') {
                if ($('resource-page').length > 0) {
                    rebus.components.resourcesModal.hide();
                    window.setTimeout(function () {
                        rebus.components.pdfModal.show(rebus.components.resourcesModal.show, $url);
                    }, 301);
                } else {
                    rebus.components.pdfModal.show(undefined, $url);
                }
                
            } else if (action === 'show-resources') {
                rebus.components.resourcesModal.show();
            } else if (action === 'show-glossary') {                
                $.get("content/ajax/glossary.html", function (data) {
                    rebus.controls.modal.show({
                        'class': 'full-width max-width-content',
                        body: data,
                        focusOnClosed: $('#dropdown-mnu-main > a')
                    });
                });
            }
            else if (action === 'show-references') {                
                $.get("content/ajax/references.html", function (data) {
                    rebus.controls.modal.show({
                        'class': 'full-width max-width-content',
                        body: data,
                        focusOnClosed: $('#dropdown-mnu-main > a')
                    });
                });
            }
            else if (action === 'show-intentions') {                
                $.get("content/ajax/intentions.html", function (data) {
                    rebus.controls.modal.show({
                        'class': 'full-width max-width-content',
                        body: data,
                        focusOnClosed: $('#dropdown-mnu-main > a')
                    });
                });
            }
            else if (action === 'exit') {
                Track.commit(true);
            }
            return false;
        });
    }
};
