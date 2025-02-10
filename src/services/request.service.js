import { elements } from '../elements.js';
import { editors } from './editors.service.js';
import { history } from './msg-history.service.js';
import { ws } from './websocket.service.js';

class RequestService {
    init() {
        elements.sendBtn.addEventListener('click', () => {
            const data = editors.request.getValue();

            this.send(data);
        });

        return this;
    }

    /**
     * @param {string|object} data
     */
    send(data) {
        const payload = this.serialize(data);
        history.addSent(payload);

        ws.send(payload);
    }

    /**
     * @param {string|object} data
     */
    serialize(data) {
        let res;

        try {
            res = JSON.stringify(JSON.parse(data));
        } catch (e) {
            const payload = data
                .replace(/\/\/.*/g, '') // remove comments
                .replace(/(\w+)\s*:\s/g, (_, sub) => `"${sub}":`) // wrap keys without quote with valid double quote
                .replace(/'([^']+)'\s*/g, (_, sub) => `"${sub}"`) // replacing single quote wrapped ones to double quote
                .replace(/,([\s,\n]*[\],}])/g, (_, sub) => sub); // remove trailing comma

            try {
                res = JSON.stringify(JSON.parse(payload));
            } catch {
                res = data;
            }
        }

        return res;
    }
}

export const request = new RequestService();
