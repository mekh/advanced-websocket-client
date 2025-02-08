import { elements } from '../elements.js';

export class EditorComponent {
    /**
     * @param {string} elementId
     * @param {'json'} [mode='json']
     * @returns {EditorComponent}
     */
    static create(elementId, mode = 'json') {
        return new EditorComponent(elementId, mode);
    }

    defaults = {
        value: 'Press Ctrl-Alt-J (Cmd-Ctrl-J for Mac) to prettify the input',
        indentUnit: 4,
        autoCloseBrackets: true,
        foldGutter: true,
        lineNumbers: true,
        lineWrapping: true,
        lint: true,
        extraKeys: {
            'Ctrl-/': this.toggleComment.bind(this),
            'Cmd-/': this.toggleComment.bind(this),
            'Ctrl-Q': this.foldCode.bind(this),
            'Ctrl-Enter': this.send.bind(this),
            'Cmd-Enter': this.send.bind(this),
            'Ctrl-Alt-J': this.formatContent.bind(this),
            'Cmd-Ctrl-J': this.formatContent.bind(this),
            'F2': this.toggleLineWrapping.bind(this),
            'F1': this.toggleFullScreen.bind(this),
            'Esc': this.handleEsc.bind(this),
        },
        gutters: [
            'CodeMirror-lint-markers',
            'CodeMirror-linenumbers',
            'CodeMirror-foldgutter',
        ],
    }

    json = {
        options: {
            mode: { name: 'javascript', json: true },
        },
        beautifyOptions: {
            indent_size: 4,
            indent_char: ' ',
            max_preserve_newlines: '-1',
        },
        beautifyFn: js_beautify
    };

    mode = this.json;

    /**
     * @param {string} elementId
     * @param {'json'} [mode]
     * @returns {EditorComponent}
     */
    constructor(elementId, mode) {
        switch (mode) {
            case 'json':
                this.mode = this.json;
                break;
            default:
                throw new Error(`Unsupported mode "${mode}"`);
        }

        this.editor = CodeMirror.fromTextArea(
            document.getElementById(elementId),
            { ...this.defaults, ...this.mode.options },
        );
    }

    toggleComment(cm) {
        cm.execCommand('toggleComment');

        if (cm.getSelection()) {
            return;
        }

        const { line, ch } = cm.getCursor();

        cm.setCursor({ line: line + 1, ch});
    }

    toggleLineWrapping(cm) {
        const optName = 'lineWrapping';

        cm.setOption(optName, !cm.getOption(optName))
    }

    toggleFullScreen(cm) {
        const optName = 'fullScreen';

        cm.setOption(optName, !cm.getOption(optName))
    }

    handleEsc(cm) {
        const optName = 'fullScreen';

        if (cm.getOption(optName)) {
            cm.setOption(optName, false);
        }
    }

    foldCode(cm) {
        return cm.foldCode(cm.getCursor());
    }

    send() {
        elements.sendBtn.click();
    }

    formatContent(cm) {
        const content = this.getValue();

        cm.setValue(this.beautify(content));
    }

    setValue(value, beautify = true) {
        this.editor.setValue(
            beautify
                ? this.beautify(value)
                : value,
        );
    }

    getValue() {
        return this.editor.getValue();
    }

    beautify(value) {
        console.log()
        const { beautifyFn: fn, beautifyOptions: opts } = this.mode;
        const args = opts !== undefined ? [value, opts] : [value];

        return fn ? fn.apply(fn, args) : value;
    }
}
