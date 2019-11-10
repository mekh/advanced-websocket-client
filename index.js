import { elements } from './src/elements.js';
import startListeners from './src/listeners.js';
import editors from './src/editor.js';
import * as options from './src/options.js';

const initResizeHandler = () => {
    let isResizing = false;
    const container = elements.container;
    const handler = elements.dragH;
    const boxLeft = elements.boxLeft;
    const boxRight = elements.boxRight;

    const minWidthLeft = 740;
    const minWidthRight = 480;

    const resize = e => {
        const { offsetLeft, clientWidth } = container;
        let clientX = (e && e.clientX) ? e.clientX : clientWidth / 2 - offsetLeft;
        const pointerPos = clientX - offsetLeft;

        const widthLeft = Math.max(minWidthLeft, pointerPos);
        const widthRight = Math.max(minWidthRight, clientWidth - widthLeft);
        if (widthRight === minWidthRight || widthLeft === minWidthLeft) {
            return;
        }

        boxLeft.style.width = widthLeft + 'px';
        boxRight.style.width = widthRight + 'px';
        boxLeft.style.flexGrow = 0;
        boxRight.style.flexGrow = 0;
    };

    handler.addEventListener('mousedown', () => isResizing = true);
    document.addEventListener('mouseup', () => isResizing = false);
    document.addEventListener('mousemove', e => {
        if (isResizing) resize(e);
    });

    window.addEventListener('resize', resize);

    resize(); // initial call
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
