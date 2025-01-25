import { elements } from './elements.js';
import * as storage from './storage.js'
import * as history from './history.js'
import editors from "./editor.js";

class Options {
    #dataKey =  'ext_swc_options';

    #urlKey = 'ext_swc_schema';

    showLimit =  1000;

    urlHistory =  [];

    messageHistory =  [];

    favorites =  [];

    lastRequest =  '';

    lastResponse =  '';

    url = '';

    get #data() {
        return {
            showLimit: this.showLimit,
            urlHistory: this.urlHistory,
            messageHistory: this.messageHistory,
            favorites: this.favorites,
            lastRequest: this.lastRequest,
            lastResponse: this.lastResponse,
        }
    }

    init() {
        this.load();

        elements.url.value = this.url;
        elements.logLimit.value = this.showLimit;
        editors.request.setValue(this.lastRequest ?? '');
        editors.response.setValue(this.lastResponse ?? '');

        this.messageHistory.forEach(history.add);

        return this;
    }

    load() {
        const opts = storage.get(this.#dataKey);

        Object
            .entries(this.#data)
            .forEach(([key, value]) => {
                this[key] = opts[key] !== undefined
                    ? opts[key]
                    : value;
            });

        this.url = storage.get(this.#urlKey);

        return this;
    }

    save() {
        this.#data.urlHistory = [...new Set(this.#data.urlHistory)];
        this.#data.favorites = [...new Set(this.#data.favorites)];

        storage.set(this.#dataKey, this.#data);
        storage.set(this.#urlKey, this.url);

        return this;
    }
}

export const options = new Options();
