/**
 * @typedef Message
 * @property {'RECEIVED'|'SENT'} type
 * @property {string} data
 * @property {string} timestamp
 */
import { elements } from './elements.js';
import editors from './editor.js';
import * as storage from './storage.js'
import * as history from './history.js'

class State {
    #dataKey =  'ext_swc_options';

    #urlKey = 'ext_swc_schema';

    #data = {
        showLimit: 1000,
        urlHistory: [],
        messageHistory: [],
        favorites: [],
        lastRequest: '',
        lastResponse: '',
    }

    #url = '';

    /**
     * @returns {string}
     */
    get url() {
        return this.#url;
    }

    /**
     * @param {string} url
     * @private
     */
    set url(url) {
        this.#url = url;
    }

    /**
     * @returns {string[]}
     */
    get urlHistory() {
        return this.#data.urlHistory;
    }

    /**
     * @param {string[]} urlHistory
     * @private
     */
    set urlHistory(urlHistory) {
        this.#data.urlHistory = urlHistory.filter(Boolean);
    }

    /**
     * @returns {Message[]}
     * @private
     */
    get messageHistory() {
        return this.#data.messageHistory;
    }

    /**
     * @param {Message[]} messageHistory
     */
    set messageHistory(messageHistory) {
        this.#data.messageHistory = messageHistory.filter(Boolean);
    }

    /**
     * @returns {string[]}
     * @private
     */
    get favorites() {
        return this.#data.favorites;
    }

    /**
     * @param {string[]}favorites
     */
    set favorites(favorites) {
        this.#data.favorites = favorites.filter(Boolean);
    }

    /**
     * @returns {number}
     */
    get showLimit() {
        return this.#data.showLimit;
    }

    /**
     * @param {number} showLimit
     * @private
     */
    set showLimit(showLimit) {
        if (
            !showLimit ||
            !Number.isFinite(showLimit) ||
            showLimit !== Math.floor(showLimit) ||
            showLimit !== Math.abs(showLimit)
        ) {
            throw new Error('show limit must be a positive integer');
        }

        this.#data.showLimit = showLimit;

        elements.logLimitInput.value = this.showLimit;
    }

    /**
     * @returns {string}
     */
    get lastRequest() {
        return this.#data.lastRequest;
    }

    /**
     * @param {string|undefined} [lastRequest]
     * @private
     */
    set lastRequest(lastRequest) {
        if (!lastRequest) {
            return;
        }

        this.#data.lastRequest = lastRequest;

        editors.request.setValue(this.lastRequest);
    }

    /**
     * @returns {string}
     */
    get lastResponse() {
        return this.#data.lastResponse;
    }

    /**
     * @param {string|undefined} [lastResponse]
     * @private
     */
    set lastResponse(lastResponse) {
        if (!lastResponse) {
            return;
        }

        this.#data.lastResponse = lastResponse;

        editors.response.setValue(this.lastResponse);
    }

    /**
     * @returns {State}
     */
    init() {
        this.load();

        if (this.url) {
            this.setUrl(this.url);
        }

        elements.logLimitInput.value = this.showLimit;
        editors.request.setValue(this.lastRequest);
        editors.response.setValue(this.lastResponse);

        this.messageHistory.forEach(history.add);

        return this;
    }

    /**
     * @returns {State}
     * @private
     */
    load() {
        const opts = storage.get(this.#dataKey);

        Object
            .entries(this.#data)
            .forEach(([key, value]) => {
                this[key] = opts?.[key] !== undefined
                    ? opts[key]
                    : value;
            });

        const url = storage.get(this.#urlKey);
        if (url) {
            this.setUrl(url);
        }

        return this;
    }

    save() {
        storage.set(this.#dataKey, this.#data);
        storage.set(this.#urlKey, this.url);

        return this;
    }

    /**
     * @param {string} url
     */
    setUrl(url) {
        this.validateUrl(url);

        this.url = url;
        elements.url.value = this.url;

        if (this.isFavorite(this.url)) {
            elements.addressFaviconSvg.classList.add('url-is-fav');
        } else {
            elements.addressFaviconSvg.classList.remove('url-is-fav');
        }

        return this;
    }

    /**
     * @param {string} url
     */
    addHistoryUrl(url) {
        this.validateUrl(url);
        if (!this.urlHistory.includes(url)) {
            this.urlHistory.push(url);
        }

        return this;
    }

    /**
     * @param {string} url
     */
    removeHistoryUrl(url) {
        this.validateUrl(url);

        if (this.url === url) {
            this.url = '';
        }

        this.removeFavorite(url);
        this.urlHistory = this.urlHistory.filter((item) => item !== url);

        return this;
    }

    /**
     * @param {Message} msg
     */
    addHistoryMessage(msg) {
        this.messageHistory.push(msg);

        if (this.messageHistory.length > this.showLimit) {
            this.messageHistory.shift();
        }

        return this;
    }

    /**
     * @param {string} url
     */
    isFavorite(url) {
        return url && this.favorites.includes(url);
    }

    /**
     * @param {string} url
     */
    addFavorite(url) {
        this.validateUrl(url);

        if (!this.isFavorite(url)) {
            this.favorites.push(url);
        }

        return this;
    }

    /**
     * @param {string} url
     */
    removeFavorite(url) {
        this.validateUrl(url);

        this.favorites = this.favorites.filter((item) => item !== url);

        return this;
    }

    /**
     * @param {*} url
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('url must be a non-empty string');
        }
    }
}

export const state = new State();
