const byId = id => document.getElementById(id);

export const elements = {
    /**
     * @return {HTMLElement|null}
     */
    get boxLeft() {
        return byId('box-left');
    },

    /**
     * @return {HTMLElement|null}
     */
    get boxRight() {
        return byId('box-right');
    },

    /**
     * @return {HTMLElement|null}
     */
    get boxRequest() {
        return byId('request');
    },

    /**
     * @return {HTMLElement|null}
     */
    get boxHistory() {
        return byId('history');
    },

    /**
     * @return {HTMLElement|null}
     */
    get resizeH() {
        return byId('resize-h');
    },

    /**
     * @return {HTMLElement|null}
     */
    get resizeV() {
        return byId('resize-v');
    },

    /**
     * @return {HTMLElement|null}
     */
    get connectBtn() {
        return byId('connect-btn');
    },

    /**
     * @return {HTMLElement|null}
     */
    get sendBtn() {
        return byId('send-btn');
    },

    /**
     * @return {HTMLElement|null}
     */
    get connectionStatus() {
        return byId('connection-status');
    },

    /**
     * @return {HTMLElement|null}
     */
    get urlHistory() {
        return byId('url-history');
    },

    /**
     * @return {HTMLElement|null}
     */
    get logLimitInput() {
        return byId('log-limit');
    },

    /**
     * @return {HTMLElement|null}
     */
    get clearLogBtn() {
        return byId('clear-log');
    },

    /**
     * @return {HTMLElement|null}
     */
    get copyButton() {
        return byId('copy-to-req-editor');
    },

    /**
     * @return {HTMLElement|null}
     */
    get addressFaviconDiv() {
        return byId('address-favicon-div');
    },

    /**
     * @return {HTMLElement|null}
     */
    get addressFaviconSvg() {
        return byId('address-favicon-svg');
    },

    /**
     * @return {HTMLElement|null}
     */
    get addressRemove() {
        return byId('address-remove');
    },

    /**
     * @return {HTMLElement|null}
     */
    get url() {
        return byId('ws-url');
    },
};

