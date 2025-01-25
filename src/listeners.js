import { elements } from './elements.js';
import client from './websocket.js';
import { toJson } from './helpers.js';
import { getNowDateStr } from './helpers.js';
import * as history from './history.js'
import editors from './editor.js';
import { options } from './options.js';
import { resizeH, resizeV } from './resize.js';

const removeUrlAutocomplete = () => {
    const elem = elements.urlHistory;

    elem.innerHTML = '';
    elem.style.display = 'none';
}

const showUrlAutocomplete = (addListener) => {
    const elem = elements.urlHistory;
    const hist = options.urlHistory;
    const favs = options.favorites;

    elem.innerHTML = '';

    const curr = elements.url.value;

    const urls = [...favs, ...hist]
        .filter((i) => i !== curr);

    if (!urls.length) {
        return;
    }

    urls.forEach((url) => {
        const li = document.createElement('li')
;
        li.textContent = url;
        li.classList.add('url-history-item');

        elem.appendChild(li);

        li.addEventListener('click', () => {
            elements.url.value = url;

            removeUrlAutocomplete();
        });
    });

    if (!addListener) {
        return;
    }

    let activeIdx = -1;
    elements.url.addEventListener('keydown', (e) => {
        // TODO: refactor, should not check this
        if (elem.style.display === 'none') {
            return;
        }

        if (!['Escape', 'Enter', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            return;
        }

        if (e.key === 'Escape') {
            removeUrlAutocomplete();

            return;
        }

        const items = [...elem.getElementsByTagName('li')];

        if (e.key === 'Enter') {
            if (activeIdx >= 0) {
                items[activeIdx].click();
            } else {
                removeUrlAutocomplete();
            }

            return;
        }

        activeIdx += e.key === 'ArrowUp' ? -1 : 1;

        if (activeIdx >= urls.length) {
            activeIdx = 0;
        }

        if (activeIdx < 0) {
            activeIdx = urls.length - 1;
        }

        items.forEach((item, idx) => {
            if (idx === activeIdx) {
                item.classList.add('url-history-item-active');
            } else {
                item.classList.remove('url-history-item-active');
            }
        });
    });
};

const switchConnection = () => {
    if (client.connectionAlive) {
        client.ws.close();

        return;
    }

    const limit = parseInt(elements.logLimitInput.value, 10);
    if (!Number.isNaN(limit)) {
        options.showLimit = limit;
    }

    const url = elements.url.value;

    client.connect(url);

    if (!options.urlHistory.includes(url)) {
        options.urlHistory.push(url);
    }

    options.url = url;
    options.save();
};

const startListeners = () => {
    let isResizing = false;
    let resizeHandler  = null;
    let initFinished = false;

    elements.url.addEventListener('input', function () {
        showUrlAutocomplete(!initFinished);
        elements.urlHistory.style.display = 'block';
        initFinished = true;
    });

    elements.url.addEventListener('focus', function () {
        showUrlAutocomplete(!initFinished);
        elements.urlHistory.style.display = 'block';
        initFinished = true;
    });

    elements.sendBtn.addEventListener('click', () => {
        const content = editors.request.getValue();

        const data = toJson(content);
        const msg = { data, type: 'SENT', timestamp: getNowDateStr(true) };
        history.add(msg);
        client.ws.send(data);

        options.lastRequest = content;
        options.messageHistory.push(msg);
        options.save();
    });

    elements.copyButton.addEventListener('click', () => {
        const content = editors.response.getValue();
        if (content) {
            editors.request.setValue(js_beautify(content));
        }
    });

    elements.clearLogBtn.addEventListener('click', history.clear);
    elements.logFilterInput.addEventListener('input', history.filter);
    elements.connectBtn.addEventListener('click', switchConnection);

    elements.url.addEventListener('keydown', e => {
        // TODO: refactor, remove checking the display prop
        if (e.key === 'Enter' && elements.urlHistory.style.display === 'none') {
            elements.connectBtn.click();

            return false;
        }
    });

    elements.resizeH.addEventListener('mousedown', () => {
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

    elements.resizeV.addEventListener('mousedown', () => {
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

    document.addEventListener('click', (event) => {
        if (!elements.url.contains(event.target) && !elements.urlHistory.contains(event.target)) {
            removeUrlAutocomplete();
        }
    });
};

export default startListeners;
