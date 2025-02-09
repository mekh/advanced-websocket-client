import { FavIconComponent } from './components/fav-icon.component.js';
import { elements } from './elements.js';
import { ws } from './services/websocket.service.js';
import { history } from './services/msg-history.service.js';
import { editors } from './services/editors.service.js';
import { state } from './services/state.service.js';
import { resizeH, resizeV } from './resize.js';

import { autocomplete } from './services/autocomplete.service.js';

const startListeners = () => {
    let isResizing = false;
    let resizeHandler  = null;

    elements.sendBtn.addEventListener('click', () => {
        ws.send(editors.request.getValue());
    });

    elements.copyButton.addEventListener('click', () => {
        const content = editors.response.getValue();
        if (content) {
            editors.request.setValue(content);
        }
    });

    elements.clearLogBtn.addEventListener('click', history.clear.bind(history));
    elements.connectBtn.addEventListener('click', ws.toggleConnection.bind(ws));


    elements.addressFaviconDiv.addEventListener('click', () => {
        const url = elements.url.value;
        if (!url) {
            return;
        }

        const svg = FavIconComponent.fromElem(elements.addressFaviconSvg);

        const handle = svg.toggleFav()
            ? state.addFavorite
            : state.removeFavorite;

        handle.call(state, url).save();
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
