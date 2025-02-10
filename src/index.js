import { elements } from './elements.js';
import { app } from './services/app.service.js';
import { connection } from './services/connection.service.js';
import { request } from './services/request.service.js';
import { history } from './services/msg-history.service.js';
import { response } from './services/response.service.js';
import { state } from './services/state.service.js';

import { autocomplete } from './services/autocomplete.service.js';

export const init = () => {
    state.init();
    app.init();
    request.init();
    response.init();
    connection.init();
    history.init();

    document.addEventListener('click', (event) => {
        if (
            autocomplete.isShown() &&
            !elements.url.contains(event.target) && // show autocomplete action
            !elements.urlHistory.contains(event.target) && // click on autocomplete icon
            !event.target.parentNode?.classList?.contains('addr-act-icon') && // add/remove favorite
            !event.target.firstChild?.classList?.contains('addr-act-icon') // add/remove favorite
        ) {
            autocomplete.hide();
        }
    });
};
