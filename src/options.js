import { elements } from './elements.js';
import * as storage from './storage.js'
import editors from "./editor.js";

let options = {
    showLimit: 1000,
    urlHistory: [],
    favorites: [],
    lastRequest: null,
};

const STG_URL_SCHEMA_KEY = 'ext_swc_schema';
const STG_OPTIONS_KEY = 'ext_swc_options';

const init = () => {
    elements.serverSchema.url.value = storage.get(STG_URL_SCHEMA_KEY) || '';
    options = Object.assign({}, options, storage.get(STG_OPTIONS_KEY));

    if (options.showLimit) elements.showLimit.value = options.showLimit;
    if (options.lastRequest) editors.request.setValue(options.lastRequest);
};

export {
    options,
    STG_URL_SCHEMA_KEY,
    STG_OPTIONS_KEY,
    init
}
