import { elements } from './elements.js';
import client from './services/websocket.service.js';
import * as history from './history.js'
import editors from './editor.js';
import { state } from './services/state.service.js';
import { resizeH, resizeV } from './resize.js';

import { autocomplete } from './services/autocomplete.service.js';

const toggleFav = (svg, url) => {
    if (state.isFavorite(url)) {
        state.removeFavorite(url);
        svg.classList.remove('url-is-fav')
    } else {
        state.addFavorite(url);
        svg.classList.add('url-is-fav');
    }

    state.save();
}

const switchConnection = () => {
    if (client.isConnected) {
        client.disconnect();

        return;
    }

    const limit = parseInt(elements.logLimitInput.value, 10);
    if (!Number.isNaN(limit)) {
        state.showLimit = limit;
    }

    state.setUrl(elements.url.value);
    state.addHistoryUrl(state.url);
    state.save();

    client.connect(state.url);
};

const startListeners = () => {
    let isResizing = false;
    let resizeHandler  = null;

    elements.sendBtn.addEventListener('click', () => {
        client.send(editors.request.getValue());
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


    elements.addressFaviconDiv.addEventListener('click', () => {
        const url = elements.url.value;
        if (!url) {
            return;
        }

        toggleFav(elements.addressFaviconSvg, url)
    });

    elements.addressRemove.addEventListener('click', () => {
        const url = elements.url.value;
        if (!url) {
            return;
        }

        state.removeHistoryUrl(url).save();

        elements.url.value = '';

        autocomplete.show();
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
            autocomplete.isShown() &&
            !elements.url.contains(event.target) && // show autocomplete action
            !elements.urlHistory.contains(event.target) && // click on autocomplete icon
            !event.target.parentNode?.classList?.contains('addr-act-icon') && // add/remove favorite
            !event.target.firstChild?.classList?.contains('addr-act-icon') // add/remove favorite
        ) {
            autocomplete.hide();
        }
    });
};

export default startListeners;
