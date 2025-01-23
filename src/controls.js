import { elements } from "./elements.js";

const connectionClosed = () => {
    elements.url.removeAttribute('disabled');
    elements.connectBtn.removeAttribute('disabled');
    elements.logLimit.removeAttribute('disabled');
    elements.sendBtn.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#777';
    elements.connectionStatus.innerText = 'Connection';
    elements.connectBtn.innerText = 'Open';
};

const connectionOpening = () => {
    elements.url.setAttribute('disabled', 'disabled');
    elements.connectBtn.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#999900';
    elements.connectionStatus.innerText = 'CONNECTING...';
    elements.connectBtn.innerText = '...';
};

const connectionOpened = () => {
    elements.connectBtn.removeAttribute('disabled');
    elements.sendBtn.removeAttribute('disabled');
    elements.logLimit.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#009900';
    elements.connectionStatus.innerText = 'CONNECTED';
    elements.connectBtn.innerText = 'Close';
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
