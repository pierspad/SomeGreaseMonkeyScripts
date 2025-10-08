// ==UserScript==
// @name         Widen ChatGPT UI
// @namespace    https://pierspad.com
// @version      1.0
// @description  Enlarge the central box on ChatGPT, leaving space at the edges.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  const css = `
:root{
  --gpt-wide-max: 1400px;   /* absolute limit */
  --gpt-wide-vw: 92vw;      /* leave ~4% on each side */
}

#main .mx-auto,
#main [class*="max-w-"],
main .mx-auto,
main [class*="max-w-"]{
  max-width: min(var(--gpt-wide-max), var(--gpt-wide-vw)) !important;
}

#main [data-testid="conversation-turns"],
#main [data-testid="composer"],
#main form{
  max-width: min(var(--gpt-wide-max), var(--gpt-wide-vw)) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

#main [style*="max-width"]{
  max-width: min(var(--gpt-wide-max), var(--gpt-wide-vw)) !important;
}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.documentElement.appendChild(style);
})();
