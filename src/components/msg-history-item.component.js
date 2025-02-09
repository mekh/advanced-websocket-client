export class MsgHistoryItemComponent {
    /**
     * @param {string} timestamp
     * @param {string} data
     */
    static create(timestamp, data) {
        return new MsgHistoryItemComponent(timestamp, data);
    }

    static fromElem(elem) {
        const [date, data] = [...elem.children];

        return new MsgHistoryItemComponent(date.textContent, data.textContent);
    }

    /**
     * @param {string} timestamp
     * @param {string} data
     */
    constructor(timestamp, data) {
        this.timestamp = timestamp;
        this.data = data;
    }

    createInnerHtml() {
        return `
            <span class='msg-log-i msg-log-i-t'>${this.timestamp}</span>
            <pre class='msg-log-i'>${this.data}</pre>
        `;
    }
}
