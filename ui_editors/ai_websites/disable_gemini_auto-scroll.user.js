// ==UserScript==
// @name         Disable Gemini Auto-Scroll 
// @namespace    https://pierspad.com
// @author       https://pierspad.com
// @version      1.0
// @description  Disable Gemini Auto-Scroll when generating an answer (compatible with Nav Dots)
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==


(function() {
    'use strict';

    function injectBlocker() {
        const _scrollIntoView = Element.prototype.scrollIntoView;
        const _elementScrollTo = Element.prototype.scrollTo;
        const _windowScrollTo = window.scrollTo.bind(window);

        window.__geminiOriginalScroll = {
            scrollIntoView: _scrollIntoView,
            elementScrollTo: _elementScrollTo,
            windowScrollTo: _windowScrollTo
        };

        window.__geminiAllowScroll = false;

        Element.prototype.scrollIntoView = function(...args) {
            if (window.__geminiAllowScroll) {
                return _scrollIntoView.apply(this, args);
            }
        };

        Element.prototype.scrollTo = function(...args) {
            if (window.__geminiAllowScroll) {
                return _elementScrollTo.apply(this, args);
            }
        };

        window.scrollTo = function(...args) {
            if (window.__geminiAllowScroll) {
                return _windowScrollTo(...args);
            }
        };

        const originalFocus = HTMLElement.prototype.focus;
        HTMLElement.prototype.focus = function(options) {
            const newOptions = options || {};
            newOptions.preventScroll = true;
            return originalFocus.call(this, newOptions);
        };

        console.log("Auto-Scroll block active (v1.1 - flag system)");
    }

    const script = document.createElement('script');
    script.textContent = `(${injectBlocker.toString()})();`;
    (document.head || document.documentElement).appendChild(script);
    script.remove(); 
})();