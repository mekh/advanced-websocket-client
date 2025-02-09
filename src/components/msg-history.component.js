/**
 * @typedef Message
 * @property {'RECEIVED'|'SENT'} type
 * @property {string} data
 * @property {string} timestamp
 */
import { MsgHistoryItemComponent } from './msg-history-item.component.js';

export class MsgHistoryComponent {
    /**
     * @returns {MsgHistoryComponent}
     */
    static create() {
        return new MsgHistoryComponent();
    }

    element = document.getElementById('message-log');

    logFilter = null;

    /**
     * @param {string|null} val
     */
    set filter(val) {
        this.logFilter = val;
        this.filterLog();
    }

    /**
     * @returns {NodeListOf<HTMLElement>}
     * @private
     */
    get items() {
        return this.element.querySelectorAll('li');
    }

    /**
     * @param {Message} message
     * @returns {HTMLLIElement}
     */
    push(message) {
        const msg = document.createElement('li');
        msg.classList.add('msg-log-line');
        if (message.type === 'SENT') {
            msg.classList.add('sent');
        }

        msg.innerHTML = MsgHistoryItemComponent
            .create(message.timestamp, message.data)
            .createInnerHtml();

        this.setHidden(msg);

        this.element.appendChild(msg);

        return msg;
    }

    /**
     * @param {MouseEvent} e
     * @return {MsgHistoryItemComponent}
     */
    parseClickEvent(e) {
        const target = e.target.closest('li');

        return MsgHistoryItemComponent.fromElem(target);
    }

    filterLog() {
        this.items.forEach(item => {
            this.setHidden(item);
        });
    }

    removeAll() {
        for (const item of this.items) {
            this.element.removeChild(item);
        }
    }

    truncate(limit) {
        while (this.items.length > limit) {
            this.shift();
        }
    }

    /**
     * @return {ChildNode}
     * @private
     */
    shift() {
        const item = this.element.firstChild;
        this.element.removeChild(item);

        return item;
    }

    /**
     * @param {HTMLElement} item
     * @private
     */
    setHidden(item) {
        item.hidden = this.logFilter
            ? !item.textContent.includes(this.logFilter)
            : false;
    }
}
