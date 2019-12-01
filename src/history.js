import { elements } from './elements.js';
import { getNowDateStr } from './helpers.js';
import { options, STG_OPTIONS_KEY } from './options.js'
import editors from './editor.js';
import * as storage from "./storage.js";

const clear = () =>  {
    const items = elements.history.querySelectorAll('pre');

    for (const element of items){
        const dummy = element.cloneNode(false);
        element.parentNode.replaceChild(dummy, element);
        elements.history.removeChild(dummy);
    }

    options.messageHistory = [];
    storage.set(STG_OPTIONS_KEY, options);
};

const filter = event => {
    const items = elements.history.querySelectorAll('pre');

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

    const filterValue = elements.filterMessage.value;

    if (filterValue && data.indexOf(filterValue) === -1) {
        msg.setAttribute('hidden', 'hidden');
    }

    if (type === 'SENT') {
        msg.classList += ' sent';
    } else {
        editors.response.setValue(beautified);
    }

    const { history } = elements;
    history.appendChild(msg);

    while (history.childNodes.length > options.showLimit) {
        history.removeChild(history.firstChild);
    }

    history.scrollTop = history.scrollHeight;
};

export {
    add,
    clear,
    filter,
}
