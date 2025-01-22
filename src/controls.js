import { elements } from "./elements.js";

const connectionClosed = () => {
    elements.serverSchema.url.removeAttribute('disabled');
    elements.connectButton.removeAttribute('disabled');
    elements.showLimit.removeAttribute('disabled');
    elements.sendButton.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#777';
    elements.connectionStatus.innerText = 'Connection';
    elements.connectButton.innerText = 'Open';
};

const connectionOpening = () => {
    elements.serverSchema.url.setAttribute('disabled', 'disabled');
    elements.connectButton.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#999900';
    elements.connectionStatus.innerText = 'CONNECTING...';
    elements.connectButton.innerText = '...';
};

const connectionOpened = () => {
    elements.connectButton.removeAttribute('disabled');
    elements.sendButton.removeAttribute('disabled');
    elements.showLimit.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#009900';
    elements.connectionStatus.innerText = 'CONNECTED';
    elements.connectButton.innerText = 'Close';
};

const connectionError = () => {
    connectionClosed();
    elements.connectionStatus.style.color = '#990008';
    elements.connectionStatus.innerText = 'ERROR';
};

export {
    connectionOpened,
    connectionClosed,
    connectionError,
    connectionOpening
}
