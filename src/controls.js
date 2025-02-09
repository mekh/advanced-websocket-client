import { elements } from './elements.js';

const connectionClosed = () => {
    elements.url.disabled = false;
    elements.connectBtn.disabled = false;
    elements.connectBtn.innerText = 'Open';
    elements.connectionStatus.style.color = '#777';
    elements.connectionStatus.innerText = 'Connection';
    elements.sendBtn.disabled = true;
    elements.logLimitInput.disabled = false;
};

const connectionOpening = () => {
    elements.url.disabled = true;
    elements.connectBtn.disabled = true;
    elements.connectBtn.innerText = '...';
    elements.connectionStatus.style.color = '#999900';
    elements.connectionStatus.innerText = 'CONNECTING...';
};

const connectionOpened = () => {
    elements.connectBtn.disabled = false;
    elements.connectBtn.innerText = 'Close';
    elements.connectionStatus.style.color = '#009900';
    elements.connectionStatus.innerText = 'CONNECTED';
    elements.sendBtn.disabled = false;
    elements.logLimitInput.disabled = true;
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
