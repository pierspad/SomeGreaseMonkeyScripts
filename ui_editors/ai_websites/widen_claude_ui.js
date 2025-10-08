// ==UserScript==
// @name         Widen Claude UI
// @namespace    https://pierspad.com
// @version      1.0
// @description  Expand the central box on claude.ai while maintaining a side margin
// @match        https://claude.ai/*
// @match        https://www.claude.ai/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  const MAX_WIDTH_PX = 1600; 
  const MARGIN_VW    = 4;    

  const css = `
    @media (min-width: 1280px){
      .flex.min-h-screen.w-full.overflow-x-clip > :nth-child(2){
        width: auto !important;
        max-width: calc(min(${MAX_WIDTH_PX}px, (100vw - ${2*MARGIN_VW}vw))) !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      .flex.min-h-screen.w-full.overflow-x-clip > :nth-child(2) *,
      [data-testid="chat-input-ssr"],
      [data-testid="chat-input"]{
        max-width: 100% !important;
      }

      [data-testid="chat-input-ssr"] > div,
      [data-testid="chat-input"] > div{
        max-width: 100% !important;
      }
    }
  `;

  const inject = () => {
    if (document.getElementById('claude-wide-style')) return;
    const style = document.createElement('style');
    style.id = 'claude-wide-style';
    style.textContent = css;
    document.documentElement.appendChild(style);
  };

  inject();
  const mo = new MutationObserver(inject);
  mo.observe(document.documentElement, {childList: true, subtree: true});
})();
