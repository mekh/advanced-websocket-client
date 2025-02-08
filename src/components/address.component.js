import { FavIconComponent } from './fav-icon.component.js';

export class AddressComponent {
    /**
     * @param {string} url
     * @param {boolean} [isFavorite=false]
     */
    static create(url, isFavorite = false) {
        return new AddressComponent(url, isFavorite);
    }

    actions = {
        TOGGLE_FAV: 'toggle_fav',
        DELETE_URL: 'delete_url',
        SET_URL: 'set_url',
    }

    /**
     * @param {string} url
     * @param {boolean} [isFavorite=false]
     */
    constructor(url, isFavorite = false) {
        this.url = url;
        this.favIcon = FavIconComponent.create(isFavorite);
    }

    createInnerHTML() {
        const favIconHtml = this.favIcon.innerHTML;

        return `
            <div
                class='addr-act-icon-div addr-act-toggle-fav'
                data-action=${this.actions.TOGGLE_FAV}
            >${favIconHtml}</div>

            <div
                class='url-text'
                data-action=${this.actions.SET_URL}
            >${this.url}</div>

            <div
                class='addr-act-icon-div addr-act-remove-url'
                data-action=${this.actions.DELETE_URL}
            >
                <svg class='addr-act-icon'>
                    <use href='resources/icons.svg#icon-cross'></use>
                </svg>
            </div>
        `;
    }
}
