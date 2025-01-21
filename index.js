import { elements } from './src/elements.js';
import startListeners from './src/listeners.js';
import editors from './src/editor.js';
import * as options from './src/options.js';

const initResizeHandler = () => {
    let isResizing = false;
    let resizeHandler;

    const containerH = elements.container;
    const containerV = document.getElementById('boxLeftMain');
    const boxLeft = elements.boxLeft;
    const boxRequest = elements.boxRequest;
    const boxHistory = elements.boxHistory;

    const minWidthLeft = 480;
    const minHeightLeft = 150;
    const minWidthRight = minWidthLeft;

    const resizeH = e => {
        const { offsetLeft, clientWidth } = containerH;

        const clientX = (e && e.clientX) ? e.clientX : clientWidth / 2 - offsetLeft;
        const pointerPos = clientX - offsetLeft;

        const widthLeft = Math.max(minWidthLeft, pointerPos);
        if (widthLeft > clientWidth - minWidthRight) {
            return;
        }

        boxLeft.style.width = `${widthLeft}px`;
    };

    const resizeV = e => {
        const parentY = containerV.getBoundingClientRect().top + window.scrollY;
        const parentHeight = containerV.clientHeight;

        const newTopHeight = Math.max(minHeightLeft, Math.min(e.clientY - parentY, parentHeight));
        const newBottomHeight = Math.max(minHeightLeft, parentHeight - newTopHeight);

        boxRequest.style.height = `${newTopHeight}px`;
        boxHistory.style.height = `${newBottomHeight}px`;
    };

    elements.dragH.addEventListener('mousedown', () => {
        isResizing = true;
        resizeHandler = resizeH;
    });

    elements.dragV.addEventListener('mousedown', () => {
        isResizing = true;
        resizeHandler = resizeV;
    });

    document.addEventListener('mouseup', () => isResizing = false);
    document.addEventListener('mousemove', e => {
        if (isResizing) resizeHandler(e);
    });
};

const App = {
    init() {
        initResizeHandler();
        editors.init();
        options.init();
        startListeners();
    }
};


window.addEventListener('load', App.init);
