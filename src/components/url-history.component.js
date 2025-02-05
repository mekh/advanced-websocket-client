import { elements } from '../elements.js';
import { state } from '../state.js';

const actions = {
    TOGGLE_FAV: 'toggle_fav',
    DELETE_URL: 'delete_url',
    SET_URL: 'set_url',
};

export class UrlHistoryComponent {
    static ACTIONS = actions;

    static element = elements.urlHistory;

    /**
     * @param {string} [substr]
     */
    static build(substr) {
        return new UrlHistoryComponent().build(substr);
    }

    element = UrlHistoryComponent.element;

    activeIdx = -1;

    cssItemActiveCls = 'url-history-item-active';

    cssUrlIsFavCls = 'url-is-fav';

    constructor() {
        this.destroy();
    }

    /**
     * @returns {string}
     */
    get url() {
        return state.url;
    }

    /**
     * @returns {string[]}
     */
    get urls() {
        return [
            ... new Set([...state.favorites, ...state.urlHistory].filter(Boolean)),
        ];
    }

    set active(isActive) {
        this.element.style.display = isActive
            ? 'block'
            : 'none';
    }

    get active() {
        return this.element.style.display !== 'none';
    }

    get length() {
        return this.element.childElementCount;
    }

    /**
     * @param {string} [substr]
     */
    build(substr) {
        const filter = substr
            ? new RegExp(`.*${substr}.*`, 'i')
            : '';

        const urls = this.urls.filter((i) => i !== this.url && i.match(filter));

        urls.forEach((url) => {
            const li = this.createChild(url);

            this.element.appendChild(li);
        });

        return this;
    }

    destroy() {
        this.active = false;

        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }

    /**
     * @param {string} url
     * @returns {HTMLLIElement}
     */
    createChild(url) {
        const child = document.createElement('li');

        child.classList.add('url-history-item');
        child.innerHTML = this.createInnerHTML(url);

        return child;
    }

    /**
     * @param {string} url
     * @returns {string}
     */
    createInnerHTML(url) {
        const isFav = state.isFavorite(url);

        return `
            <div
                class='addr-act-icon-div addr-act-toggle-fav'
                data-action=${actions.TOGGLE_FAV}
            >
                <svg class='addr-act-icon ${isFav ? this.cssUrlIsFavCls : ''}'>
                    <use href='resources/icons.svg#icon-star'></use>
                </svg>
            </div>
            <div
                class='url-text'
                data-action=${actions.SET_URL}
            >${url}</div>
            <div
                class='addr-act-icon-div addr-act-remove-url'
                data-action=${actions.DELETE_URL}
            >
                <svg class='addr-act-icon'>
                    <use href='resources/icons.svg#icon-cross'></use>
                </svg>
            </div>
        `;
    }

    /**
     * Parse the click event that's registered on the this.htmlElem level
     * This method should be in consistency with the 'createInnerHTML' one
     *
     * @param {MouseEvent} e
     * @returns {{svg:Element|undefined,url:string,action:string}}
     */
    parseClickEvent(e) {
        const target = e.target.closest('[data-action]');
        const item = target.parentElement;
        const url = this.getChildUrl(item);
        const svg = target.firstElementChild;

        return {
            svg,
            url,
            action: target.dataset.action,
        };
    }

    /**
     * @param {number} idx
     * @returns {Element|undefined}
     */
    getNthChild(idx) {
            return idx >= 0
                ? this.element.children[idx]
                : undefined;
    }

    /**
     * @param {HTMLElement} childElem
     */
    getChildUrl(childElem) {
        return childElem
            .querySelector(`[data-action='${actions.SET_URL}']`)
            .textContent
    }

    getActiveUrl() {
        const active = this.getNthChild(this.activeIdx);

        return active
            ? this.getChildUrl(active)
            : undefined;
    }

    /**
     * @param {boolean} [reverse=false]
     */
    activateNext(reverse = false) {
        const prevIdx = this.activeIdx;

        this.activeIdx += reverse ? -1 : 1;
        this.activeIdx = (this.activeIdx + this.length) % this.length;

        this.unsetActive(prevIdx);
        this.setActive(this.activeIdx);
    }

    /**
     * @param {Element} svg
     */
    toggleFavSvg(svg) {
        return svg.classList.toggle(this.cssUrlIsFavCls);
    }

    /**
     * @param {number} idx
     */
    unsetActive(idx) {
        this.getNthChild(idx)?.classList.remove(this.cssItemActiveCls);
    }

    /**
     * @param {number} idx
     */
    setActive(idx) {
        this.getNthChild(idx)?.classList.add(this.cssItemActiveCls);
    }
}
