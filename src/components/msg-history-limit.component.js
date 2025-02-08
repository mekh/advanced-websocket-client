export class MsgHistoryLimitComponent {
    static create() {
        return new MsgHistoryLimitComponent();
    }

    element = document.getElementById('log-limit');

    default = 1000;

    get value() {
        const val = this.element.value;
        const intVal = parseInt(val, 10);

        if (Number.isFinite(intVal)) {
            return intVal;
        }

        console.error('Invalid value, revert to default');
        this.element.value = this.default;

        return this.element.value;
    }

    /**
     * @param {string | number} val
     */
    set value(val) {
        const def = this.current || this.default;

        if (!val) {
            this.element.value = def;

            return;
        }

        if (typeof val === 'string') {
            if (!val.match(/^[1-9][0-9]*$/)) {
                this.element.value = def;

                throw new Error('value must be a positive integer');
            }

            this.element.value = val;
        }

        if (typeof val === 'number') {
            if (Math.abs(val) !== val || Math.floor(val) !== val) {
                this.element.value = def;

                throw new Error('value must be a positive integer');
            }

            this.element.value = val;
        }
    }

    saveCurrent() {
        this.current = this.element.value;
    }
}
