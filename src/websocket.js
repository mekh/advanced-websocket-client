import * as controls from './controls.js';
import * as history from './history.js'
import { elements } from './elements.js';

let client = {
    get connectionAlive() {
        return typeof client.ws === 'object'
            && client.ws !== null
            && 'readyState' in client.ws
            && client.ws.readyState === client.ws.OPEN
    }
};


client.connect = (url, binary) => {
    client.ws = new WebSocket(url);
    controls.connectionOpening();

    if (binary) {
        client.ws.binaryType = 'arraybuffer';
    }

    client.ws.onopen = controls.connectionOpened;
    client.ws.onclose = controls.connectionClosed;

    client.ws.onerror = () => {
        client.ws.onclose = () => {};
        controls.connectionError();
    };

    client.ws.onmessage = message => {
        let data = message.data;
        if (elements.serverSchema.binaryType.value) {
            const buffer = new Uint8Array(message.data);
            data = new TextDecoder().decode(buffer).slice(1);
        }

        history.add(data, 'RECEIVED');
    }
};

export default client;
