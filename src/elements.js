const byId = id => document.getElementById(id);

export const elements = {
    get boxLeft() { return byId('box-left') },
    get boxRight() { return byId('box-right') },
    get boxRequest() { return byId('request') },
    get boxHistory() { return byId('history') },
    get resizeH() { return byId('resize-h') },
    get resizeV() { return byId('resize-v') },
    get connectBtn() { return byId('connect-btn') },
    get sendBtn() { return byId('send-btn') },
    get messageLog() { return byId('message-log') },
    get connectionStatus() { return byId('connection-status') },
    get urlHistory() { return byId('url-history') },
    get logLimitInput() { return byId('log-limit') },
    get logFilterInput() { return byId('log-filter') },
    get clearLogBtn() { return byId('clear-log') },
    get copyButton() { return byId('copy-to-req-editor') },
    get requestEditor() { return byId('request-editor') },
    get responseEditor() { return byId('response-editor') },
    get addressFaviconDiv() { return byId('address-favicon-div') },
    get addressFaviconSvg() { return byId('address-favicon-svg') },
    get url() { return byId('ws-url') },
};

