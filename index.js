import { elements } from './src/elements.js';
import startListeners from './src/listeners.js';
import editors from './src/editor.js';
import * as options from './src/options.js';

const initResizeHandler = () => {
    let isResizing = false;
    elements.handle.onmousedown = () => isResizing = true;

    document.onmousemove = e => {
        if (!isResizing) {
            return;
        }

        const offsetRight = elements.container.clientWidth - (e.clientX - elements.container.offsetLeft);
        const minWidthLeft = parseInt(elements.left.style.minWidth.split('px')[0], 10);
        const minWidthRight = parseInt(elements.right.style.minWidth.split('px')[0], 10);
        if (minWidthRight > offsetRight || (elements.container.clientWidth - offsetRight) < minWidthLeft) {
            return;
        }

        elements.left.style.right = `${offsetRight}px`;
        elements.right.style.width = `${offsetRight}px`;
    };

    document.onmouseup = () => {
        isResizing = false;
    }
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
