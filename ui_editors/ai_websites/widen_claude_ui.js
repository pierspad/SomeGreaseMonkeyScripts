// ==UserScript==
// @name         Widen Claude UI (Full Width)
// @namespace    https://pierspad.com
// @version      1.1
// @description  Expand the central box on claude.ai while maintaining a side margin
// @match        https://claude.ai/*
// @match        https://www.claude.ai/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  const MARGIN_VW = 2;

  const css = `
    :root { --cw-margin: ${MARGIN_VW}vw; }
    html, body { overflow-x: hidden !important; }

    @media (min-width: 1024px){
      .flex.min-h-screen.w-full.overflow-x-clip > :nth-child(2),
      main[role="main"],
      [data-testid="main-content"],
      [data-testid="desktop-scroll-container"] > div {
        width: calc(100vw - (2 * var(--cw-margin))) !important;
        max-width: none !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      [data-testid="chat-input-ssr"],
      [data-testid="chat-input"],
      [data-testid="chat-input-ssr"] > div,
      [data-testid="chat-input"] > div {
        width: 100% !important;
        max-width: none !important;
      }

      [class*="max-w-"] {
        max-width: none !important;
        width: 100% !important;
      }

      .prose, .markdown, [data-testid="message-content"] {
        max-width: none !important;
        width: 100% !important;
      }

      pre, code, table, img, video, canvas {
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
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
