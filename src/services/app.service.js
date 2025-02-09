import { elements } from '../elements.js';
import { resizeH, resizeV } from '../helpers/resize.js';

class AppService {
    resizeCurrentX = null;

    resizeCurrentY = null;

    handleResize = null;

    init() {
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        return this;
    }

    /**
     * @param pointerCoordinates
     * @param {number} pointerCoordinates.x
     */
    resizeH({ x }) {
        if (this.resizeCurrentX === null) {
            this.resizeCurrentX = x;

            return;
        }

        const leftInc = x - this.resizeCurrentX;
        resizeH({ leftInc });

        this.resizeCurrentX = x;
    }

    /**
     * @param pointerCoordinates
     * @param {number} pointerCoordinates.y
     */
    resizeV({ y }) {
        if (this.resizeCurrentY === null) {
            this.resizeCurrentY = y;

            return;
        }

        const topInc = y - this.resizeCurrentY;
        resizeV({ topInc });

        this.resizeCurrentY = y;
    }

    onMouseUp() {
        this.handleResize = null;
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseMove(e) {
        if (this.handleResize) {
            this.handleResize({ x: e.clientX, y: e.clientY });
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseDown(e) {
        if (e.target === elements.resizeH) {
            this.resizeCurrentX = null;
            this.handleResize = this.resizeH;
        }

        if (e.target === elements.resizeV) {
            this.resizeCurrentY = null;
            this.handleResize = this.resizeV;
        }
    }
}

export const app = new AppService;
