const get = id => document.getElementById(id);

export const elements = {
    get boxLeft() { return get('box-left') },
    get boxRight() { return get('box-right') },
    get boxRequest() { return get('request') },
    get boxHistory() { return get('history') },
    get resizeH() { return get('resize-h') },
    get resizeV() { return get('resize-v') },
    get connectBtn() { return get('connect-btn') },
    get sendBtn() { return get('send-btn') },
    get messageLog() { return get('message-log') },
    get connectionStatus() { return get('connection-status') },
    get logLimit() { return get('log-limit') },
    get urlHistory() { return get('url-history') },
    get filterLogInput() { return get('log-filter') },
    get clearLogBtn() { return get('clear-log') },
    get copyButton() { return get('copy-to-req-editor') },
    get requestEditor() { return get('request-editor') },
    get responseEditor() { return get('response-editor') },
    get url() { return get('ws-url') },
};

