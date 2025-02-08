const CSS_IS_FAV = 'url-is-fav';

export class FavIconComponent {
    /**
     * @param {boolean} [isFavorite=false]
     * @return {FavIconComponent}
     */
    static create(isFavorite = false) {
        return new FavIconComponent(isFavorite);
    }

    /**
     * @param {HTMLElement} elem
     * @return {FavIconComponent}
     */
    static fromElem(elem) {
        const isFav = elem.classList.contains(CSS_IS_FAV);

        const instance = new FavIconComponent(isFav);
        instance.element = elem;

        return instance;
    }

    cssIsFav = CSS_IS_FAV;

    element = document.createElement('svg');

    /**
     * @param {boolean} [isFavorite=false]
     */
    constructor(isFavorite = false) {
        this.isFavorite = isFavorite;
        this.element.innerHTML = this.createInnerHTML();
    }

    get innerHTML() {
        return this.element.innerHTML;
    }

    createInnerHTML() {
        return `
            <svg class='addr-act-icon ${this.isFavorite ? this.cssIsFav : ''}'>
                <use href='resources/icons.svg#icon-star'></use>
            </svg>
        `;
    }

    /**
     * @return {boolean}
     */
    toggleFav() {
        return this.element.classList.toggle(this.cssIsFav);
    }
}
