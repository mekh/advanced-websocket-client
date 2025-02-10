import { FavIconComponent } from '../components/fav-icon.component.js';
import { elements } from '../elements.js';
import { autocomplete } from './autocomplete.service.js';
import { state } from './state.service.js';
import { ws } from './websocket.service.js';

class ConnectionService {
    init() {
        elements.connectBtn.addEventListener('click', this.toggleConnection.bind(this));
        elements.addressFaviconDiv.addEventListener('click', this.toggleFav.bind(this));
        elements.addressRemove.addEventListener('click', this.deleteUrl.bind(this));

        ws.addEventListener('opening', this.onOpening.bind(this));
        ws.addEventListener('open', this.onOpen.bind(this));
        ws.addEventListener('close', this.onClose.bind(this));
        ws.addEventListener('error', this.onError.bind(this));
    }

    toggleConnection() {
        if (ws.isConnected) {
            ws.disconnect();

            return;
        }

        state.setUrl(elements.url.value);
        state.addHistoryUrl(state.url);
        state.save();

        ws.connect(state.url);
    }

    toggleFav() {
        const url = elements.url.value;
        if (!url) {
            return;
        }

        const svg = FavIconComponent.fromElem(elements.addressFaviconSvg);

        const handle = svg.toggleFav()
            ? state.addFavorite
            : state.removeFavorite;

        handle.call(state, url).save();
    }

    deleteUrl() {
        const url = elements.url.value;
        if (!url) {
            return;
        }

        state.removeHistoryUrl(url).save();

        elements.url.value = '';

        autocomplete.show();
    }

    onOpening() {
        elements.url.disabled = true;
        elements.connectBtn.disabled = true;
        elements.connectBtn.innerText = '...';
        elements.connectionStatus.style.color = '#999900';
        elements.connectionStatus.innerText = 'CONNECTING...';
    }

    onOpen() {
        elements.connectBtn.disabled = false;
        elements.connectBtn.innerText = 'Close';
        elements.connectionStatus.style.color = '#009900';
        elements.connectionStatus.innerText = 'CONNECTED';
        elements.sendBtn.disabled = false;
        elements.logLimitInput.disabled = true;
    }

    onClose() {
        elements.url.disabled = false;
        elements.connectBtn.disabled = false;
        elements.connectBtn.innerText = 'Open';
        elements.connectionStatus.style.color = '#777';
        elements.connectionStatus.innerText = 'Connection';
        elements.sendBtn.disabled = true;
        elements.logLimitInput.disabled = false;
    }

    onError() {
        this.onClose();
        elements.connectionStatus.style.color = '#990008';
        elements.connectionStatus.innerText = 'ERROR';
    }
}

export const connection = new ConnectionService();
