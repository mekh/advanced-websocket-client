import * as controls from '../controls.js';
import { history } from './msg-history.service.js';

class WsClient {
    /**
     * @returns {boolean}
     */
    get isConnected() {
        return this.ws && this.ws.readyState === this.ws.OPEN
    }

    /**
     * @param {string} url
     */
    connect(url) {
        controls.connectionOpening();

        this.ws = new WebSocket(url);

        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    disconnect() {
        if (!this.isConnected) {
            return;
        }

        this.ws.close();
    }

    /**
     * @param {string|ArrayBufferLike|Blob|ArrayBufferView} data
     */
    send(data) {
        if (!this.isConnected) {
            throw new Error('not connected');
        }

        const payload = this.serialize(data);
        history.addSent(payload);
        this.ws.send(payload);
    }

    serialize(str) {
        let res;

        try {
            res = JSON.stringify(JSON.parse(str));
        } catch (e) {
            const data = str
                .replace(/\/\/.*/g, '') // remove comments
                .replace(/(\w+)\s*:\s/g, (_, sub) => `"${sub}":`) // wrap keys without quote with valid double quote
                .replace(/'([^']+)'\s*/g, (_, sub) => `"${sub}"`) // replacing single quote wrapped ones to double quote
                .replace(/,([\s,\n]*[\],}])/g, (_, sub) => sub); // remove trailing comma

            try {
                res = JSON.stringify(JSON.parse(data));
            } catch {
                res = str;
            }
        }

        return res;
    }

    onOpen() {
        controls.connectionOpened();
    }

    onClose() {
        controls.connectionClosed();
    }

    onError(err) {
        console.error(err);
        controls.connectionError();

        this.ws.onclose = () => {};
    }

    onMessage({ data }) {
        history.addReceived(data);
    }
}

export default new WsClient();
