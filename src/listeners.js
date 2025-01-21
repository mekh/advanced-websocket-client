import { elements } from './elements.js';
import client from './websocket.js';
import * as storage from './storage.js';
import { toJson } from './helpers.js';
import { getNowDateStr } from './helpers.js';
import * as history from './history.js'
import editors from './editor.js';
import { options, STG_OPTIONS_KEY, STG_URL_SCHEMA_KEY } from './options.js';

const getUrl = () => elements.serverSchema.url.value;
const setUrl = url => elements.serverSchema.url.value = url;

const applyCurrentFavorite = () => {
    setUrl(elements.favorites.value);
    if (client.connectionAlive) client.ws.close();
};

const updateSelect = (isFavorites, isFirstStart) => {
    const key = isFavorites ? 'favorites' : 'urlHistory';
    const selectElement = isFavorites ? elements.favorites : elements.urlHistory;
    const hist = storage.get(STG_OPTIONS_KEY)
        ? storage.get(STG_OPTIONS_KEY)[key]
        : [];

    selectElement
        .querySelectorAll('option')
        .forEach(item => item.parentNode.removeChild(item));

    let index = 0;
    let count = 0;

    for (const url of hist) {
        if (url === elements.serverSchema.url.value) index = count;
        count += 1;
        const opt = document.createElement('option');
        selectElement.appendChild(opt);
        opt.innerHTML = url;
    }

    selectElement.selectedIndex = (isFavorites && isFirstStart) ? -1 : index;
};

const switchConnection = () => {
    if (client.connectionAlive) return client.ws.close();

    const limit = parseInt(elements.showLimit.value, 10);
    if (!Number.isNaN(limit)) {
        options.showLimit = limit;
    }

    const url = getUrl();
    const binary = elements.serverSchema.binaryType.checked;
    client.connect(url, binary);
    if (!options.urlHistory.includes(url)) options.urlHistory.push(url);

    storage.set(STG_URL_SCHEMA_KEY, url);
    storage.set(STG_OPTIONS_KEY, options);
    updateSelect();
};

const startListeners = () => {
    updateSelect();
    updateSelect(true, true);

    elements.urlHistory.addEventListener('change', () => {
        setUrl(elements.urlHistory.value);
        if (client.connectionAlive) client.ws.close();
    });

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

    elements.delButton.addEventListener('click', () => {
        const url = elements.urlHistory.value;
        const history = storage.get(STG_OPTIONS_KEY).urlHistory;
        options.urlHistory = history.filter(uri => uri !== url);
        storage.set(STG_OPTIONS_KEY, options);
        updateSelect();
    });

    elements.favDelButton.addEventListener('click', () => {
        const url = elements.favorites.value;
        const fav = storage.get(STG_OPTIONS_KEY).favorites;
        options.favorites = fav.filter(uri => uri !== url);
        storage.set(STG_OPTIONS_KEY, options);
        updateSelect(true);
    });

    elements.favAddButton.addEventListener('click', () => {
        storage.update('favorites', getUrl(), STG_OPTIONS_KEY);
        updateSelect(true);
    });

    elements.copyButton.addEventListener('click', () => {
        const content = editors.response.getValue();
        if (content) editors.request.setValue(js_beautify(content));
    });

    elements.clearButton.addEventListener('click', history.clear);
    elements.filterMessage.addEventListener('input', history.filter);
    elements.connectButton.addEventListener('click', switchConnection);
    elements.favorites.addEventListener('change', applyCurrentFavorite);

    elements.serverSchema.url.addEventListener('keydown', e => {
        if (e.which === 13) {
            elements.connectButton.click();
            return false;
        }
    });
};

export default startListeners;
