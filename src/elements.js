const get = id => document.getElementById(id);

export const elements = {
    get container() { return get("container") },
    get left() { return get("left") },
    get right() { return get("right") },
    get handle() { return get("drag") },
    get filterMessage() { return get('filterMessage') },
    get connectButton() { return get('connectButton') },
    get sendButton() { return get('sendButton') },
    get history() { return get('history') },
    get connectionStatus() { return get('connectionStatus') },
    get showLimit() { return get('showLimit') },
    get urlHistory() { return get('urlHistory') },
    get favorites() { return get('favorites') },
    get delButton() { return get('delButton') },
    get favAddButton() { return get('favAddButton') },
    get favDelButton() { return get('favDelButton') },
    get clearButton() { return get('clearMessage') },
    get copyButton() { return get('responseToRequest') },
    get serverSchema() {
        return {
            get url(){ return get('wsConnectionString') },
            get binaryType(){ return get('binaryType') },
        }
    },
};

