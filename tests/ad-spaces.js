// FMKOREA_AD_SPACES_BEGIN v1.1.0
(function () {
    'use strict';
    if (!/(^|\.)fmkorea\.com$/.test(location.hostname)) return;
    if (window.__dongminFmkoreaAdSpaces) return;
    window.__dongminFmkoreaAdSpaces = true;

    var marker = 'data-dongmin-fmkorea-ad-space';
    var styleId = 'dongmin-fmkorea-ad-spaces-style';
    var queued = false;
    var collapsedStyle = {
        'display': 'none', 'height': '0px', 'min-height': '0px',
        'max-height': '0px', 'margin': '0px', 'padding': '0px'
    };

    function collapse(node) {
        if (!node.hasAttribute(marker)) node.setAttribute(marker, '');
        Object.keys(collapsedStyle).forEach(function (property) {
            var value = collapsedStyle[property];
            if (node.style.getPropertyValue(property) !== value ||
                node.style.getPropertyPriority(property) !== 'important') {
                node.style.setProperty(property, value, 'important');
            }
        });
    }

    function sweep() {
        queued = false;
        if (!document.documentElement) return;
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.textContent = '[' + marker + '], [class$="_ad"] {' +
                'display:none!important;height:0!important;min-height:0!important;' +
                'max-height:0!important;margin:0!important;padding:0!important;}';
            (document.head || document.documentElement).appendChild(style);
        }
        // Match the FMKorea hidden spacer documented by the gallery filter.
        // Do not infer advertisements from a blank div, its size, or its text.
        document.querySelectorAll('div[style], [' + marker + ']').forEach(function (node) {
            var s = node.style;
            var isSpacer = node.tagName === 'DIV' &&
                s.getPropertyValue('display') === 'block' &&
                s.getPropertyPriority('display') === 'important' &&
                s.getPropertyValue('visibility') === 'hidden' &&
                parseFloat(s.getPropertyValue('height')) > 0;
            if (isSpacer || node.hasAttribute(marker)) collapse(node);
        });
    }

    function schedule() {
        if (!queued) {
            queued = true;
            (window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); })(sweep);
        }
    }

    function start() {
        if (!document.documentElement) return;
        sweep();
        // Style writes are idempotent: the follow-up observer pass makes no writes.
        new MutationObserver(schedule).observe(document.documentElement, {
            childList: true, subtree: true, attributes: true,
            attributeFilter: ['style', 'class']
        });
        window.addEventListener('pageshow', schedule);
    }
    if (document.documentElement) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
// FMKOREA_AD_SPACES_END
