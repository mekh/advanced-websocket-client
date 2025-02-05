import * as controls from './controls.js';
import * as history from './history.js'
import { state } from "./state.js";
import { getNowDateStr } from './helpers.js';

let client = {
    get connectionAlive() {
        return client.ws
            && typeof client.ws === 'object'
            && 'readyState' in client.ws
            && client.ws.readyState === client.ws.OPEN
    }
};


/**
 * @param {string} url
 */
client.connect = (url) => {
    client.ws = new WebSocket(url);
    controls.connectionOpening();

    client.ws.onopen = controls.connectionOpened;
    client.ws.onclose = controls.connectionClosed;

    client.ws.onerror = (e) => {
        console.log(e);
        client.ws.onclose = () => {};
        controls.connectionError();
    };

    client.ws.onmessage = ({ data }) => {
        const msg = { type: 'RECEIVED', data, timestamp: getNowDateStr(true) };

        history.add(msg);

        state.addHistoryMessage(msg);
        state.lastResponse = js_beautify(data);

        state.save();
    }
};

export default client;
