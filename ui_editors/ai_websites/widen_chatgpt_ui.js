// ==UserScript==
// @name         Full-Width ChatGPT UI
// @namespace    https://pierspad.com
// @version      1.1
// @description  Usa tutto lo spazio orizzontale per ChatGPT.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  const css = `
:root{
  --gpt-side-margin: 2vw; /* spazio laterale minimo */
}

#main .mx-auto,
#main [class*="max-w-"],
main .mx-auto,
main [class*="max-w-"]{
  max-width: none !important;
  width: calc(100% - 2 * var(--gpt-side-margin)) !important;
  margin-left: var(--gpt-side-margin) !important;
  margin-right: var(--gpt-side-margin) !important;
}

#main [data-testid="conversation-turns"],
#main [data-testid="composer"],
#main form{
  max-width: none !important;
  width: calc(100% - 2 * var(--gpt-side-margin)) !important;
  margin-left: var(--gpt-side-margin) !important;
  margin-right: var(--gpt-side-margin) !important;
}

#main [style*="max-width"]{
  max-width: none !important;
  width: calc(100% - 2 * var(--gpt-side-margin)) !important;
}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.documentElement.appendChild(style);
})();
