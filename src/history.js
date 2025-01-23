import { elements } from './elements.js';
import { getNowDateStr } from './helpers.js';
import { options, STG_OPTIONS_KEY } from './options.js'
import editors from './editor.js';
import * as storage from "./storage.js";

const clear = () =>  {
    const items = elements.messageLog.querySelectorAll('pre');

    for (const element of items){
        const dummy = element.cloneNode(false);
        element.parentNode.replaceChild(dummy, element);
        elements.messageLog.removeChild(dummy);
    }

    options.messageHistory = [];
    storage.set(STG_OPTIONS_KEY, options);
};

const filter = event => {
    const items = elements.messageLog.querySelectorAll('pre');

    for (const element of items) {
        if (element.innerText.indexOf(event.target.value) === -1) {
            element.setAttribute('hidden', 'hidden');
        } else {
            element.removeAttribute('hidden');
        }
    }
};



const add = ({ data, type, timestamp }) => {
    const msg = document.createElement('pre');
    msg.innerHTML = `[${timestamp || getNowDateStr(true)}]${data}`;

    const beautified = js_beautify(data);
    msg.addEventListener('click', () => {
        editors.response.setValue(beautified);
    });

    const filterValue = elements.filterLogInput.value;

    if (filterValue && data.indexOf(filterValue) === -1) {
        msg.setAttribute('hidden', 'hidden');
    }

    if (type === 'SENT') {
        msg.classList += ' sent';
    } else {
        editors.response.setValue(beautified);
    }

    const { messageLog } = elements;
    messageLog.appendChild(msg);

    while (messageLog.childNodes.length > options.showLimit) {
        messageLog.removeChild(messageLog.firstChild);
    }

    messageLog.scrollTop = messageLog.scrollHeight;
};

export {
    add,
    clear,
    filter,
}
