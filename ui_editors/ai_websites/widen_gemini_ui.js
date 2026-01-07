// ==UserScript==
// @name         Gemini Ultrawide & Full Width
// @namespace    https://pierspad.com
// @author       https://pierspad.com
// @version      1.0
// @description  Forces the Google Gemini interface to use the full width of the screen (great for 21:9)
// @match        https://gemini.google.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const TARGET_WIDTH = '95%';

    const css = `
        /* 1. Allarga il container principale della chat */
        /* Selettori multipli per coprire diverse versioni dell'UI di Google */
        main .infinite-scroller,
        .conversation-container,
        div[class*="conversation-container"],
        div[class*="centering-container"] {
            max-width: ${TARGET_WIDTH} !important;
            width: ${TARGET_WIDTH} !important;
        }

        /* 2. Allarga la barra di input in basso */
        .input-area-container,
        div[class*="input-area"],
        footer {
            max-width: ${TARGET_WIDTH} !important;
            width: ${TARGET_WIDTH} !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }

        /* 3. Gestione dei messaggi e delle tabelle di codice */
        /* Assicura che il contenuto interno si espanda per riempire il nuovo spazio */
        .message-content,
        app-message-content,
        .model-response-content {
            max-width: 100% !important;
        }

        /* Espande i blocchi di codice per evitare lo scroll orizzontale inutile */
        pre, code-block, .code-block-decoration {
            max-width: 100% !important;
        }
    `;

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(css);
    } else {
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    }

})();