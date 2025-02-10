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
            !event.target.closest('#main-addr') &&
            !event.target.closest('.url-history-item')
        ) {
            autocomplete.hide();
        }
    });
};
