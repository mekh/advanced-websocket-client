import { elements } from './elements.js';
import { getNowDateStr } from './helpers.js';
import { options } from './options.js'
import editors from './editor.js';

const clear = () =>  {
    const items = elements.history.querySelectorAll('pre');

    for (let i=0; i < items.length; i += 1){
        const element = items[i];
        const dummy = element.cloneNode(false);
        element.parentNode.replaceChild(dummy, element);
        elements.history.removeChild(dummy);
    }
};

const filter = event => {
    const items = elements.history.querySelectorAll('pre');

    for (let i=0; i < items.length; i += 1){
        const element = items[i];

        if (element.innerText.indexOf(event.target.value) === -1) {
            element.setAttribute('hidden', 'hidden');
        } else {
            element.removeAttribute('hidden');
        }
    }
};

const add = (message, type) => {
    let data = message;

    const msg = document.createElement('pre');
    msg.innerHTML = `[${getNowDateStr(true)}]${data}`;

    msg.addEventListener('click', () => {
        editors.response.setValue(js_beautify(data));
    });

    editors.response.setValue(js_beautify(data));
    const filterValue = elements.filterMessage.value;

    if (filterValue && data.indexOf(filterValue) === -1) {
        msg.setAttribute('hidden', 'hidden');
    }

    if (type === 'SENT') {
        msg.classList += ' sent';
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
