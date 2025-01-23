import { elements } from './elements.js';
import * as storage from './storage.js'
import * as history from './history.js'
import editors from "./editor.js";

let options = {
    showLimit: 1000,
    urlHistory: [],
    messageHistory: [],
    favorites: [],
    lastRequest: null,
    lastResponse: null,
};

const STG_URL_SCHEMA_KEY = 'ext_swc_schema';
const STG_OPTIONS_KEY = 'ext_swc_options';

const init = () => {
    elements.url.value = storage.get(STG_URL_SCHEMA_KEY) || '';
    options = Object.assign({}, options, storage.get(STG_OPTIONS_KEY));

    if (options.showLimit) elements.logLimit.value = options.showLimit;
    if (options.lastRequest) editors.request.setValue(options.lastRequest);
    if (options.lastResponse) editors.response.setValue(options.lastResponse);

    options.messageHistory.forEach(history.add);
};

export {
    options,
    STG_URL_SCHEMA_KEY,
    STG_OPTIONS_KEY,
    init
}
