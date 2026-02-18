(function() {
    'use strict';

    const MAX_VISIBLE_DOTS = 15;
    const SCROLL_STEP = 10;
    const DOT_SIZE_PERCENT = 115;
    const STABILIZATION_MS = 2500;
    const GRACE_PERIOD_MS = 12000;

    const COLOR_DOT_BG = '#2d2e30';
    const COLOR_DOT_BORDER = '#444746';
    const COLOR_DOT_TEXT = '#f0f0f0';
    const COLOR_ACTIVE_BG = '#a8c7fa';
    const COLOR_ACTIVE_TEXT = '#0b57d0';
    const COLOR_UNREAD_BORDER = '#f28b82';
    const COLOR_UNREAD_TEXT = '#f28b82';

    const basePx = 28;
    const dotSize = Math.round(basePx * DOT_SIZE_PERCENT / 100);
    const dotFontSize = Math.round(11 * DOT_SIZE_PERCENT / 100);
    const arrowWidth = dotSize;
    const arrowHeight = Math.round(20 * DOT_SIZE_PERCENT / 100);
    const containerWidth = dotSize + 14;

    const style = document.createElement('style');
    style.textContent = `
        #gemini-nav-container {
            position: fixed;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 9999;
            padding: 6px;
            background: transparent;
            width: ${containerWidth}px;
            align-items: center;
            transition: opacity 0.2s ease, visibility 0.2s;
        }

        #gemini-nav-container.hidden-force {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        .nav-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 4px 0;
        }

        .nav-loading-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${COLOR_DOT_BORDER};
            animation: loading-fade 1.2s ease-in-out infinite;
        }

        .nav-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .nav-loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes loading-fade {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }

        .nav-dot {
            width: ${dotSize}px;
            height: ${dotSize}px;
            min-height: ${dotSize}px;
            border-radius: 50%;
            background: ${COLOR_DOT_BG};
            border: 1px solid ${COLOR_DOT_BORDER};
            color: ${COLOR_DOT_TEXT};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            margin: 0;
            line-height: 0;
            font-family: 'Google Sans', sans-serif;
            font-size: ${dotFontSize}px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            opacity: 0.6;
            flex-shrink: 0;
        }

        .nav-dot:hover {
            background: ${COLOR_ACTIVE_BG};
            color: ${COLOR_ACTIVE_TEXT};
            opacity: 1;
            transform: scale(1.2);
            border-color: ${COLOR_ACTIVE_BG};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .nav-dot.is-active {
            background: ${COLOR_ACTIVE_BG};
            color: ${COLOR_ACTIVE_TEXT};
            border-color: ${COLOR_ACTIVE_BG};
            opacity: 1;
            transform: scale(1.1);
        }

        .nav-dot.is-unread {
            border-color: ${COLOR_UNREAD_BORDER};
            color: ${COLOR_UNREAD_TEXT};
            opacity: 1;
            animation: unread-pulse 2s ease-in-out infinite;
        }

        .nav-dot.is-unread.is-active {
            animation: none;
            background: ${COLOR_ACTIVE_BG};
            color: ${COLOR_ACTIVE_TEXT};
            border-color: ${COLOR_ACTIVE_BG};
        }

        @keyframes unread-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(242, 139, 130, 0.4); }
            50% { box-shadow: 0 0 8px 3px rgba(242, 139, 130, 0.6); }
        }

        .nav-arrow {
            width: ${arrowWidth}px;
            height: ${arrowHeight}px;
            min-height: ${arrowHeight}px;
            border-radius: 10px;
            background: ${COLOR_DOT_BG};
            border: 1px solid ${COLOR_DOT_BORDER};
            color: #aaa;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
            font-size: 10px;
            line-height: 1;
            user-select: none;
        }

        .nav-arrow:hover:not(.is-disabled) {
            background: ${COLOR_DOT_BORDER};
            color: ${COLOR_DOT_TEXT};
            border-color: #666;
        }

        .nav-arrow.is-disabled {
            opacity: 0.25;
            cursor: default;
            pointer-events: none;
        }

        .nav-arrow.has-unread {
            border-color: ${COLOR_UNREAD_BORDER};
            color: ${COLOR_UNREAD_TEXT};
            opacity: 1;
            animation: unread-arrow-pulse 2s ease-in-out infinite;
        }

        .nav-arrow.has-unread:hover {
            background: ${COLOR_UNREAD_BORDER};
            color: #fff;
            border-color: ${COLOR_UNREAD_BORDER};
        }

        .nav-arrow.is-disabled.has-unread {
            opacity: 0.25;
            animation: none;
        }

        @keyframes unread-arrow-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(242, 139, 130, 0.4); background: ${COLOR_DOT_BG}; }
            50% { box-shadow: 0 0 10px 4px rgba(242, 139, 130, 0.6); background: rgba(242, 139, 130, 0.15); }
        }

        .nav-page-info {
            font-family: 'Google Sans', sans-serif;
            font-size: 9px;
            color: #888;
            text-align: center;
            flex-shrink: 0;
            user-select: none;
        }
    `;
    document.head.appendChild(style);

    const oldContainer = document.getElementById('gemini-nav-container');
    if (oldContainer) oldContainer.remove();

    const navContainer = document.createElement('div');
    navContainer.id = 'gemini-nav-container';
    document.body.appendChild(navContainer);

    function showLoading() {
        if (navContainer.querySelector('.nav-loading')) return;
        const loading = document.createElement('div');
        loading.className = 'nav-loading';
        for (let i = 0; i < 3; i++) {
            const d = document.createElement('div');
            d.className = 'nav-loading-dot';
            loading.appendChild(d);
        }
        navContainer.replaceChildren(loading);
    }
    showLoading();

    let currentBlocks = [];
    let activeIndex = -1;
    let windowStart = 0;
    let manualOverride = false;
    let manualOverrideTimeout = null;
    const readBlocks = new Set();
    let previousBlockCount = 0;
    let initialized = false;
    let clickScrolling = false;
    let lastDetectedCount = 0;
    let lastCountChangeTime = Date.now();
    let lastUrl = location.href;
    let graceEndTime = 0;
    let forceLoadPhase = 0;
    function checkUrlChange() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            resetState();
        }
    }

    function resetState() {
        currentBlocks = [];
        activeIndex = -1;
        windowStart = 0;
        manualOverride = false;
        clearTimeout(manualOverrideTimeout);
        readBlocks.clear();
        previousBlockCount = 0;
        initialized = false;
        clickScrolling = false;
        lastDetectedCount = 0;
        lastCountChangeTime = Date.now();
        graceEndTime = 0;
        forceLoadPhase = 0;
        showLoading();
    }

    function getScrollParent(element) {
        if (!element) return document.body;
        const st = getComputedStyle(element);
        if (st.overflowY === 'auto' || st.overflowY === 'scroll') {
            return element;
        }
        return element.parentElement ? getScrollParent(element.parentElement) : document.body;
    }
    function safeScrollTo(target, options) {
        window.__geminiAllowScroll = true;
        try {
            if (target === window) {
                if (window.__geminiOriginalScroll && window.__geminiOriginalScroll.windowScrollTo) {
                    window.__geminiOriginalScroll.windowScrollTo(options);
                } else {
                    window.scrollTo(options);
                }
            } else {
                if (window.__geminiOriginalScroll && window.__geminiOriginalScroll.elementScrollTo) {
                    window.__geminiOriginalScroll.elementScrollTo.call(target, options);
                } else {
                    target.scrollTo(options);
                }
            }
        } finally {
            setTimeout(() => { window.__geminiAllowScroll = false; }, 1500);
        }
    }

    function forceLoadAllBlocks() {
        const firstBlock = document.querySelector('.conversation-container') ||
                          document.querySelector('model-response, .conversation-turn');
        if (!firstBlock) {
            forceLoadPhase = 2;
            return;
        }

        const scroller = getScrollParent(firstBlock);
        if (!scroller) {
            forceLoadPhase = 2;
            return;
        }

        forceLoadPhase = 1;
        const isWindow = scroller === document.body || scroller === document.documentElement;
        const savedPos = isWindow ? window.scrollY : scroller.scrollTop;

        window.__geminiAllowScroll = true;

        const doScroll = (top) => {
            if (isWindow) {
                if (window.__geminiOriginalScroll?.windowScrollTo) {
                    window.__geminiOriginalScroll.windowScrollTo({ top, behavior: 'auto' });
                } else {
                    window.scrollTo({ top, behavior: 'auto' });
                }
            } else {
                if (window.__geminiOriginalScroll?.elementScrollTo) {
                    window.__geminiOriginalScroll.elementScrollTo.call(scroller, { top, behavior: 'auto' });
                } else {
                    scroller.scrollTo({ top, behavior: 'auto' });
                }
            }
        };

        doScroll(0);

        setTimeout(() => {
            const maxScroll = isWindow ? document.documentElement.scrollHeight : scroller.scrollHeight;
            doScroll(maxScroll);

            setTimeout(() => {
                doScroll(0);

                setTimeout(() => {
                    const maxScroll2 = isWindow ? document.documentElement.scrollHeight : scroller.scrollHeight;
                    doScroll(maxScroll2);

                    setTimeout(() => {
                        doScroll(savedPos);

                        setTimeout(() => {
                            window.__geminiAllowScroll = false;
                            lastDetectedCount = 0;
                            lastCountChangeTime = Date.now();
                            forceLoadPhase = 2;
                        }, 200);
                    }, 400);
                }, 400);
            }, 400);
        }, 400);
    }
    function detectActiveBlock() {
        if (currentBlocks.length === 0) return -1;

        const viewportH = window.innerHeight;
        const viewportCenter = viewportH * 0.35;
        let bestIndex = 0;
        let bestDistance = Infinity;

        for (let index = 0; index < currentBlocks.length; index++) {
            const block = currentBlocks[index];
            const rect = block.getBoundingClientRect();
            const distance = Math.abs(rect.top - viewportCenter);
            if (rect.bottom > 0 && rect.top < viewportH) {
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = index;
                }
            }
        }

        if (bestIndex !== activeIndex) {
            activeIndex = bestIndex;

            if (!manualOverride) {
                adjustWindowToIndex(activeIndex);
            }

            if (!clickScrolling) {
                markVisibleAsRead();
            }

            renderDots();
        }
        return activeIndex;
    }

    function adjustWindowToIndex(index) {
        const total = currentBlocks.length;
        const maxVisible = Math.min(MAX_VISIBLE_DOTS, total);
        if (index < windowStart) {
            windowStart = index;
        } else if (index >= windowStart + maxVisible) {
            windowStart = index - maxVisible + 1;
        }
        const maxStart = Math.max(0, total - maxVisible);
        windowStart = Math.max(0, Math.min(windowStart, maxStart));
    }

    function markAsRead(index) {
        if (readBlocks.has(index)) return;
        readBlocks.add(index);
        const dot = navContainer.querySelector(`.nav-dot[data-index="${index}"]`);
        if (dot) {
            dot.classList.remove('is-unread');
        }
    }

    function markVisibleAsRead() {
        const viewportH = window.innerHeight;
        for (let i = 0; i < currentBlocks.length; i++) {
            if (readBlocks.has(i)) continue;
            const rect = currentBlocks[i].getBoundingClientRect();
            if (rect.top < viewportH - 50 && rect.bottom > 100) {
                markAsRead(i);
            }
        }
    }

    let scrollTarget = null;
    function attachScrollListener() {
        const firstBlock = document.querySelector('.conversation-container');
        const newTarget = firstBlock ? getScrollParent(firstBlock) : null;

        if (newTarget && newTarget !== scrollTarget) {
            if (scrollTarget) {
                scrollTarget.removeEventListener('scroll', onScroll);
                window.removeEventListener('scroll', onScroll);
            }
            scrollTarget = newTarget;

            if (scrollTarget === document.body || scrollTarget === document.documentElement) {
                window.addEventListener('scroll', onScroll, { passive: true });
            } else {
                scrollTarget.addEventListener('scroll', onScroll, { passive: true });
            }
        }
    }

    let scrollRAF = null;
    function onScroll() {
        if (scrollRAF) return;
        scrollRAF = requestAnimationFrame(() => {
            detectActiveBlock();
            scrollRAF = null;
        });
    }

    navContainer.addEventListener('click', (e) => {
        const arrow = e.target.closest('.nav-arrow');
        if (arrow) {
            if (arrow.classList.contains('is-disabled')) return;
            const direction = arrow.dataset.direction;
            const total = currentBlocks.length;
            const maxVisible = Math.min(MAX_VISIBLE_DOTS, total);
            const maxStart = Math.max(0, total - maxVisible);
            const step = Math.min(SCROLL_STEP, maxStart);

            if (direction === 'up' && windowStart > 0) {
                windowStart = Math.max(0, windowStart - step);
                manualOverride = true;
                clearTimeout(manualOverrideTimeout);
                manualOverrideTimeout = setTimeout(() => { manualOverride = false; }, 5000);
                renderDots();
            } else if (direction === 'down' && windowStart < maxStart) {
                windowStart = Math.min(maxStart, windowStart + step);
                manualOverride = true;
                clearTimeout(manualOverrideTimeout);
                manualOverrideTimeout = setTimeout(() => { manualOverride = false; }, 5000);
                renderDots();
            }
            return;
        }

        const dot = e.target.closest('.nav-dot');
        if (!dot) return;

        const index = parseInt(dot.dataset.index);

        if (currentBlocks[index]) {
            const block = currentBlocks[index];
            const headerOffset = 80;
            const scroller = getScrollParent(block);

            manualOverride = false;
            clearTimeout(manualOverrideTimeout);

            if (scroller === document.body || scroller === document.documentElement) {
                const elementPosition = block.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                safeScrollTo(window, { top: offsetPosition, behavior: "smooth" });
            } else {
                const scrollerRect = scroller.getBoundingClientRect();
                const blockRect = block.getBoundingClientRect();
                const targetScroll = scroller.scrollTop + (blockRect.top - scrollerRect.top) - headerOffset;
                safeScrollTo(scroller, { top: targetScroll, behavior: 'smooth' });
            }

            // Blocca il markAsRead automatico durante lo scroll
            clickScrolling = true;
            markAsRead(index);
            setTimeout(() => { clickScrolling = false; }, 1600);
        }
    });

    setInterval(() => {
        checkUrlChange();
        const sidebar = document.querySelector('.sidenav-with-history-container, mat-sidenav, [class*="sidenav"]');
        let isMenuOpen = false;
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            const st = window.getComputedStyle(sidebar);
            if (st.visibility !== 'hidden' && sidebar.getBoundingClientRect().width > 10) {
                isMenuOpen = true;
            }
        }
        navContainer.classList.toggle('hidden-force', isMenuOpen);
    }, 200);

    function countUnreadInRange(from, to) {
        let count = 0;
        for (let i = from; i < to; i++) {
            if (!readBlocks.has(i)) count++;
        }
        return count;
    }

    function renderDots() {
        if (!initialized || currentBlocks.length === 0) return;

        const total = currentBlocks.length;
        const maxVisible = Math.min(MAX_VISIBLE_DOTS, total);
        const maxStart = Math.max(0, total - maxVisible);

        windowStart = Math.max(0, Math.min(windowStart, maxStart));

        const startIdx = windowStart;
        const endIdx = windowStart + maxVisible;

        // Conta non letti sopra e sotto la finestra visibile
        const unreadAbove = countUnreadInRange(0, startIdx);
        const unreadBelow = countUnreadInRange(endIdx, total);

        navContainer.replaceChildren();

        // Freccia su (sempre visibile, disabilitata al limite)
        const needsPagination = total > maxVisible;
        
        if (needsPagination) {
            const upArrow = document.createElement('div');
            upArrow.className = 'nav-arrow';
            upArrow.dataset.direction = 'up';
            upArrow.innerHTML = '&#9650;';
            if (windowStart === 0) {
                upArrow.classList.add('is-disabled');
                upArrow.title = 'Inizio lista';
            } else {
                upArrow.title = unreadAbove > 0
                    ? `${unreadAbove} non lett${unreadAbove === 1 ? 'o' : 'i'} sopra`
                    : `${windowStart} pallini sopra`;
            }
            if (unreadAbove > 0) upArrow.classList.add('has-unread');
            navContainer.appendChild(upArrow);
        }

        for (let index = startIdx; index < endIdx; index++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.dataset.index = index;
            dot.innerText = index + 1;

            if (!readBlocks.has(index)) dot.classList.add('is-unread');
            if (index === activeIndex) dot.classList.add('is-active');

            navContainer.appendChild(dot);
        }

        if (needsPagination) {
            const downArrow = document.createElement('div');
            downArrow.className = 'nav-arrow';
            downArrow.dataset.direction = 'down';
            downArrow.innerHTML = '&#9660;';
            if (endIdx >= total) {
                downArrow.classList.add('is-disabled');
                downArrow.title = 'Fine lista';
            } else {
                downArrow.title = unreadBelow > 0
                    ? `${unreadBelow} non lett${unreadBelow === 1 ? 'o' : 'i'} sotto`
                    : `${total - endIdx} pallini sotto`;
            }
            if (unreadBelow > 0) downArrow.classList.add('has-unread');
            navContainer.appendChild(downArrow);
        }

        // Indicatore posizione (solo se servono frecce)
        if (needsPagination) {
            const pageInfo = document.createElement('div');
            pageInfo.className = 'nav-page-info';
            pageInfo.textContent = `${startIdx + 1}-${endIdx}/${total}`;
            navContainer.appendChild(pageInfo);
        }
    }

    function updateNavigation() {
        checkUrlChange();

        let blocks = document.querySelectorAll('.conversation-container');
        if (blocks.length === 0) {
            blocks = document.querySelectorAll('model-response, .conversation-turn');
        }
        const count = blocks.length;

        if (count === 0) {
            if (!initialized) showLoading();
            return;
        }

        if (count !== lastDetectedCount) {
            lastDetectedCount = count;
            lastCountChangeTime = Date.now();
        }

        if (!initialized) {
            if (Date.now() - lastCountChangeTime < STABILIZATION_MS) {
                showLoading();
                return;
            }

            if (forceLoadPhase === 0) {
                forceLoadAllBlocks();
                showLoading();
                return;
            }
            
            if (forceLoadPhase === 1) {
                showLoading();
                return;
            }
            initialized = true;
            currentBlocks = Array.from(blocks);
            previousBlockCount = count;
            currentBlocks.forEach((_, i) => readBlocks.add(i));

            // Rileva il blocco attivo
            const viewportH = window.innerHeight;
            const viewportCenter = viewportH * 0.35;
            let bestDist = Infinity;
            activeIndex = 0;
            for (let i = 0; i < currentBlocks.length; i++) {
                const rect = currentBlocks[i].getBoundingClientRect();
                if (rect.bottom > 0 && rect.top < viewportH) {
                    const dist = Math.abs(rect.top - viewportCenter);
                    if (dist < bestDist) {
                        bestDist = dist;
                        activeIndex = i;
                    }
                }
            }

            adjustWindowToIndex(activeIndex);
            renderDots();
            attachScrollListener();
            graceEndTime = Date.now() + GRACE_PERIOD_MS;
            return;
        }

        if (count === previousBlockCount) return;

        // Nuovi blocchi apparsi
        // Se siamo nel grace period (lazy load iniziale), segnali come letti
        const inGracePeriod = Date.now() < graceEndTime;
        const oldCount = previousBlockCount;
        currentBlocks = Array.from(blocks);
        previousBlockCount = count;

        if (inGracePeriod) {
            // Blocchi caricati dal lazy-load, non sono nuovi messaggi
            for (let i = oldCount; i < count; i++) {
                readBlocks.add(i);
            }
        }

        // Ri-rileva blocco attivo
        detectActiveBlock();
        renderDots();
        attachScrollListener();
    }

    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(updateNavigation, 300);
    });

    function startObserving() {
        const targetNode = document.querySelector('infinite-scroller') || document.body;
        observer.observe(targetNode, { childList: true, subtree: true });

        if (targetNode === document.body) {
            setTimeout(() => {
                const scroller = document.querySelector('infinite-scroller');
                if (scroller) {
                    observer.disconnect();
                    observer.observe(scroller, { childList: true, subtree: true });
                }
            }, 3000);
        }
    }
    startObserving();

    let pollCount = 0;
    const pollInterval = setInterval(() => {
        updateNavigation();
        pollCount++;
        if (pollCount >= 30) {
            clearInterval(pollInterval);
            setInterval(updateNavigation, 3000);
        }
    }, 500);

    updateNavigation();

})();