import { UrlHistoryComponent } from '../components/url-history.component.js';
import { state } from './state.service.js';
import { elements } from '../elements.js';

class AutocompleteService {
    static init() {
        const svc = new AutocompleteService();
        const elem = UrlHistoryComponent.element;

        elem.addEventListener('click', svc.onClick.bind(svc));
        elements.url.addEventListener('keydown', svc.onKeyDown.bind(svc));
        elements.url.addEventListener('input', svc.onInput.bind(svc));
        elements.url.addEventListener('focus', svc.onFocus.bind(svc));

        return svc;
    }

    actions = UrlHistoryComponent.ACTIONS;

    component = UrlHistoryComponent.build();

    /**
     * @returns {boolean}
     */
    isShown() {
        return !!this.component?.active;
    }

    /**
     * @param {string} [substr]
     */
    show(substr) {
        this.component = UrlHistoryComponent.build(substr);

        this.component.active = true;
    }

    hide() {
        if (!this.component) {
            return;
        }

        this.component.destroy();

        this.component = null;
    }

    /**
     * @param {MouseEvent} e
     */
    onClick(e) {
        const { svg, url, action } = this.component.parseClickEvent(e);

        switch (action) {
            case this.actions.SET_URL:
                state.setUrl(url).save();

                return this.hide();
            case this.actions.DELETE_URL:
                state.removeHistoryUrl(url).save();

                return this.show();
            case this.actions.TOGGLE_FAV:
                const handle = svg.toggleFav()
                    ? state.addFavorite
                    : state.removeFavorite;

                handle.call(state, url).save();

                return this.show();
        }
    }

    /**
     * @param {InputEvent} e
     */
    onInput(e) {
        this.show(e.target.value);
    }

    onFocus() {
        this.show();
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
        switch (e.code) {
            case 'ArrowUp':
            case 'ArrowDown':
                if (!this.isShown()) {
                    return;
                }

                e.preventDefault();
                return this.component.activateNext(e.code === 'ArrowUp');
            case 'Escape':
                return this.hide();
            case 'Enter':
                if (!this.isShown()) {
                    return elements.connectBtn.click();
                }

                const activeUrl = this.component.getActiveUrl();
                if (activeUrl) {
                    state.setUrl(activeUrl).save();
                }

                return this.hide();
        }
    }
}

export const autocomplete = AutocompleteService.init();
