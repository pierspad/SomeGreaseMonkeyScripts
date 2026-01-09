// ==UserScript==
// @name         Fixes Deepl ad visualization 
// @namespace    https://pierspad.com
// @match        https://www.deepl.com/*
// @grant        none
// @version      1.0
// @author       pierspad
// @description  Removes the grayscale logo banner
// ==/UserScript==

(function() {
    'use strict';

    const LOGO_SELECTOR = 'img[src*="logo-cloud-grayscale"]';

    const removeLogo = () => {
        const logo = document.querySelector(LOGO_SELECTOR);
        if (logo) {
            logo.remove();
        }
    };

    removeLogo();

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                removeLogo();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
