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

const toggleFav = (svg, url) => {
    const isFav = svg.classList.toggle('url-is-fav');

    if (!isFav) {
        options.favorites = options.favorites.filter((item) => item !== url);
    } else {
        options.favorites.push(url);
    }

    options.save();
}

const showUrlAutocomplete = (addListener) => {
    const elem = elements.urlHistory;
    const hist = options.urlHistory;
    const favs = options.favorites;

    elem.innerHTML = '';

    const curr = elements.url.value;

    const urls = [
        ...new Set(
            [...favs, ...hist].filter((i) => i !== curr),
        ),
    ];

    if (!urls.length) {
        return;
    }

    let showAutocompleteTimeout;

    urls.forEach((url) => {
        const li = document.createElement('li');
        const svgDiv = document.createElement('div');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        svg.innerHTML = '<use href="resources/icons.svg#icon-star"></use>'
        svg.classList.add('url-fav-icon');

        if (favs.includes(url)) {
            svg.classList.add('url-is-fav');
        }

        svgDiv.classList.add('fav-svg');
        svgDiv.appendChild(svg);

        const urlTextDiv = document.createElement('div');
        urlTextDiv.classList.add('url-text');
        urlTextDiv.textContent = url;

        li.classList.add('url-history-item');
        li.appendChild(svgDiv);
        li.appendChild(urlTextDiv);

        elem.appendChild(li);

        li.addEventListener('click', (e) => {
            // click on fav-icon is handled other listener
            if (e.target === svg.firstChild || e.target === svgDiv) {
                return;
            }

            elements.url.value = url;

            removeUrlAutocomplete();
        });

        svgDiv.addEventListener('click', (e) => {
            const parent = e.target.parentNode; // <svg class=url-fav-icon>...</svg>
            const child = e.target.firstChild; // <div class="fav-svg"><svg class="url-fav-icon">...</div>

            const target = parent?.classList.contains('url-fav-icon')
                ? parent // clicked on icon
                : child; // clicked on div

            toggleFav(target, url);

            if (showAutocompleteTimeout) {
                clearTimeout(showAutocompleteTimeout);
                showAutocompleteTimeout = null;
            }

            showAutocompleteTimeout = setTimeout(showUrlAutocomplete, 2000);
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
        if (
            !elements.url.contains(event.target) && // show autocomplete action
            !elements.urlHistory.contains(event.target) && // click on autocomplete icon
            !event.target.parentNode?.classList?.contains('url-fav-icon') && // add/remove favorite
            !event.target.firstChild?.classList?.contains('url-fav-icon') // add/remove favorite
        ) {
            removeUrlAutocomplete();
        }
    });
};

export default startListeners;
