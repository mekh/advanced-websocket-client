/**
 * @typedef Message
 * @property {'RECEIVED'|'SENT'} type
 * @property {string} data
 * @property {string} timestamp
 */
import { MsgHistoryFilterComponent } from '../components/msg-history-filter.component.js';
import { MsgHistoryLimitComponent } from '../components/msg-history-limit.component.js';
import { MsgHistoryComponent } from '../components/msg-history.component.js';
import { elements } from '../elements.js';
import { editors } from './editors.service.js';
import { state } from './state.service.js';

export class MsgHistoryService {
    historyComp = MsgHistoryComponent.create();

    limitComp =  MsgHistoryLimitComponent.create();

    filterComp = MsgHistoryFilterComponent.create();

    constructor() {
        this.historyComp.element.addEventListener('click', this.onClick.bind(this));
        this.limitComp.element.addEventListener('blur', this.onLimitChange.bind(this));
        this.limitComp.element.addEventListener('focus', this.onLimitFocus.bind(this));
        this.filterComp.element.addEventListener('input', this.onFilterInput.bind(this));
    }

    get limit() {
        return this.limitComp.value;
    }

    set limit(val) {
        this.limitComp.value = val;
    }

    init() {
        elements.clearLogBtn.addEventListener('click', this.clear.bind(this));
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

        this.push(data);

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

        this.push(data);

        editors.response.setValue(msg);

        state.lastResponse = msg;
        state.addHistoryMessage(data);
        state.save();
    }

    /**
     * @param {Message} message
     */
    push(message) {
        this.historyComp.push(message);

        this.historyComp.truncate(this.limit);
    }

    clear() {
        this.historyComp.removeAll();

        state.messageHistory = [];
        state.save();
    }

    /**
     * @param {MouseEvent} e
     */
    onClick(e) {
        const { data } = this.historyComp.parseClickEvent(e);

        editors.response.setValue(data);
    }

    /**
     * @param {InputEvent} e
     */
    onLimitChange(e) {
        this.limit = e.target.value;

        this.historyComp.truncate(this.limit);

        state.showLimit = this.limit;
        state.save();
    }

    onLimitFocus() {
        this.limitComp.saveCurrent();
    }

    /**
     * @param {InputEvent} e
     */
    onFilterInput(e) {
        this.filterComp.value = e.target.value;

        this.historyComp.filter = this.filterComp.value;
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
