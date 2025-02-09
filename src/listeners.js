import { FavIconComponent } from './components/fav-icon.component.js';
import { elements } from './elements.js';
import { ws } from './services/websocket.service.js';
import { history } from './services/msg-history.service.js';
import { editors } from './services/editors.service.js';
import { state } from './services/state.service.js';

import { autocomplete } from './services/autocomplete.service.js';

const startListeners = () => {
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
