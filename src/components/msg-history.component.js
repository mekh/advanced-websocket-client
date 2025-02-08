/**
 * @typedef Message
 * @property {'RECEIVED'|'SENT'} type
 * @property {string} data
 * @property {string} timestamp
 */

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
        return this.element.querySelectorAll('pre');
    }

    /**
     * @param {Message} message
     * @returns {HTMLPreElement}
     */
    push(message) {
        const msg = document.createElement('pre');
        if (message.type === 'SENT') {
            msg.classList.add('sent');
        }

        msg.innerText= `[${message.timestamp}]${message.data}`;

        this.setHidden(msg);

        this.element.appendChild(msg);

        return msg;
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
