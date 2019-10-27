import { elements } from "./elements.js";

const connectionClosed = () => {
    elements.serverSchema.url.removeAttribute('disabled');
    elements.connectButton.removeAttribute('disabled');
    elements.showLimit.removeAttribute('disabled');
    elements.serverSchema.binaryType.removeAttribute('disabled');
    elements.sendButton.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#000';
    elements.connectionStatus.innerText = 'CLOSED';
    elements.connectButton.innerText = 'Open';
};

const connectionOpening = () => {
    elements.serverSchema.url.setAttribute('disabled', 'disabled');
    elements.connectButton.setAttribute('disabled', 'disabled');
    elements.serverSchema.binaryType.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#999900';
    elements.connectionStatus.innerText = 'OPENING ...';
    elements.connectButton.innerText = 'Opening';
};

const connectionOpened = () => {
    elements.connectButton.removeAttribute('disabled');
    elements.sendButton.removeAttribute('disabled');
    elements.showLimit.setAttribute('disabled', 'disabled');
    elements.connectionStatus.style.color = '#009900';
    elements.connectionStatus.innerText = 'OPENED';
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
