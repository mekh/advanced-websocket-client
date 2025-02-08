export class MsgHistoryFilterComponent {
    element = document.getElementById('log-filter');

    get value() {
        return this.element.value;
    }
}
