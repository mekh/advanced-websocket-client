class WsClient extends EventTarget {
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
        this.dispatchEvent(new Event('opening'));

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

        this.ws.send(data);
    }



    onOpen() {
        this.dispatchEvent(new Event('opened'));
    }

    onClose() {
        this.dispatchEvent(new Event('closed'));
    }

    onError(e) {
        this.ws.onclose = () => {};

        this.dispatchEvent(new Event(e.type, e));
    }

    /**
     * @param {MessageEvent} e
     */
    onMessage(e) {
        this.dispatchEvent(new MessageEvent(e.type, e));
    }
}

export const ws = new WsClient();
