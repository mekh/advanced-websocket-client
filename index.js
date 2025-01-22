import { elements } from './src/elements.js';
import startListeners from './src/listeners.js';
import editors from './src/editor.js';
import * as options from './src/options.js';

const resizeH = ({
    leftInc = 0,
    left = elements.boxLeft,
    right = elements.boxRight,
    minLeft = 500,
    minRight = 500,
} = {}) => {
    const leftWidth = left.getBoundingClientRect().width;
    const rightWidth = right.getBoundingClientRect().width;

    const newLeftWidth = leftWidth + leftInc;
    const newRightWidth = rightWidth - leftInc;

    if (newLeftWidth < minLeft || newRightWidth < minRight) {
        return;
    }

    left.style.width = `${newLeftWidth}px`;
    right.style.width = `${newRightWidth}px`;
}

const resizeV = ({
    topInc = 0,
    top = elements.boxRequest,
    bottom = elements.boxHistory,
    minTop = 150,
    minBottom = 150,
} = {}) => {
    const topHeight = top.getBoundingClientRect().height;
    const bottomHeight = bottom.getBoundingClientRect().height;

    const newTopHeight = topHeight + topInc;
    const newBottomHeight = bottomHeight - topInc;

    if (newTopHeight < minTop || newBottomHeight < minBottom) {
        return;
    }

    top.style.height = `${newTopHeight}px`;
    bottom.style.height = `${newBottomHeight}px`;
};

const initResizeHandler = () => {
    let isResizing = false;
    let resizeHandler  = null;

    elements.dragH.addEventListener('mousedown', () => {
        isResizing = true;
        let resizeCurrentX = null;

        resizeHandler = (event) => {
            if (resizeCurrentX === null) {
                resizeCurrentX = event.clientX;

                return;
            }

            const leftInc = event.clientX - resizeCurrentX;

            resizeH({ leftInc });

            resizeCurrentX = event.clientX;
        }
    });

    elements.dragV.addEventListener('mousedown', () => {
        isResizing = true;
        let resizeCurrentY = null;

        resizeHandler = (event) => {
            if (resizeCurrentY === null) {
                resizeCurrentY = event.clientY;

                return;
            }

            const topInc = event.clientY - resizeCurrentY;

            resizeV({ topInc });

            resizeCurrentY = event.clientY;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

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
