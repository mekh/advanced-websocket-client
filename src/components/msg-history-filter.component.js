export class MsgHistoryFilterComponent {
    static create() {
        return new MsgHistoryFilterComponent();
    }

    element = document.getElementById('log-filter');

    get value() {
        return this.element.value;
    }

    set value(val) {
        this.element.value = val;
    }
}
