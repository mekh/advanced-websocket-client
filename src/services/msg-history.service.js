/**
 * @typedef Message
 * @property {'RECEIVED'|'SENT'} type
 * @property {string} data
 * @property {string} timestamp
 */

import { MsgHistoryComponent } from '../components/msg-history.component.js';
import { editors } from './editors.service.js';
import { state } from './state.service.js';

export class MsgHistoryService {
    component = MsgHistoryComponent.create();

    constructor() {
        this.component.element.addEventListener('click', this.onClick.bind(this));
    }

    /**
     * @param {string} msg
     */
    addSent(msg) {
        const data = {
            type: 'SENT',
            data: msg,
            timestamp: this.getTimestamp(),
        };

        this.component.push(data);

        state.lastRequest = msg;
        state.addHistoryMessage(data);
        state.save();
    }

    /**
     * @param {string} msg
     */
    addReceived(msg) {
        const data = {
            type: 'RECEIVED',
            data: msg,
            timestamp: this.getTimestamp(),
        };

        this.component.push(data);

        editors.response.setValue(msg);

        state.lastResponse = msg;
        state.addHistoryMessage(data);
        state.save();
    }

    filter(str) {
        this.component.filter = str;
    }

    /**
     * @param {Message} message
     */
    push(message) {
        this.component.push(message);
    }

    clear() {
        this.component.removeAll();

        state.messageHistory = [];
        state.save();
    }

    /**
     * @param {MouseEvent} e
     */
    onClick(e) {

    }

    /**
     * @return {string}
     * @private
     */
    getTimestamp() {
        const now = new Date();

        return new Date(now.getTime() - (now.getTimezoneOffset() * 60000 ))
            .toISOString()
            .split("T")
            .join(' ')
            .slice(0, -1);
    }
}

export const history = new MsgHistoryService();
