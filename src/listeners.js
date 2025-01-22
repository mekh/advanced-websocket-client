import { elements } from './elements.js';
import client from './websocket.js';
import * as storage from './storage.js';
import { toJson } from './helpers.js';
import { getNowDateStr } from './helpers.js';
import * as history from './history.js'
import editors from './editor.js';
import { options, STG_OPTIONS_KEY, STG_URL_SCHEMA_KEY } from './options.js';

const getUrl = () => elements.serverSchema.url.value;

const updateSelect = () => {
    const selectElement = elements.urlHistory;
    const hist = storage.get(STG_OPTIONS_KEY)?.urlHistory ?? [];

    selectElement
        .querySelectorAll('option')
        .forEach(item => item.parentNode.removeChild(item));

    let index = 0;
    let count = 0;

    for (const url of hist) {
        if (url === elements.serverSchema.url.value) {
            index = count;
        }

        count += 1;
        const opt = document.createElement('option');
        opt.value = url;
        selectElement.appendChild(opt);
    }

    selectElement.selectedIndex = index;
};

const switchConnection = () => {
    if (client.connectionAlive) {
        client.ws.close();

        return;
    }

    const limit = parseInt(elements.showLimit.value, 10);
    if (!Number.isNaN(limit)) {
        options.showLimit = limit;
    }

    const url = getUrl();

    client.connect(url);

    if (!options.urlHistory.includes(url)) {
        options.urlHistory.push(url);
    }

    storage.set(STG_URL_SCHEMA_KEY, url);
    storage.set(STG_OPTIONS_KEY, options);

    updateSelect();
};

const startListeners = () => {
    updateSelect();

    // elements.urlHistory.addEventListener('change', () => {
    //     setUrl(elements.urlHistory.value);
    //     if (client.connectionAlive) client.ws.close();
    // });

    elements.sendButton.addEventListener('click', () => {
        const content = editors.request.getValue();
        let data = toJson(content);

        try {
            data = JSON.stringify(JSON.parse(data)).replace(/(\n\s*)/g, '');
        } catch (e) {
            return
        }

        const msg = { data, type: 'SENT', timestamp: getNowDateStr(true) };
        history.add(msg);
        client.ws.send(data);

        options.lastRequest = content;
        options.messageHistory.push(msg);
        storage.set(STG_OPTIONS_KEY, options);
    });

    elements.copyButton.addEventListener('click', () => {
        const content = editors.response.getValue();
        if (content) {
            editors.request.setValue(js_beautify(content));
        }
    });

    elements.clearButton.addEventListener('click', history.clear);
    elements.filterMessage.addEventListener('input', history.filter);
    elements.connectButton.addEventListener('click', switchConnection);

    elements.serverSchema.url.addEventListener('keydown', e => {
        if (e.which === 13) {
            elements.connectButton.click();
            return false;
        }
    });
};

export default startListeners;
