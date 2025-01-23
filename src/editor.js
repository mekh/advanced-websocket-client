import { elements } from './elements.js';

const commentLine = cm => {
    cm.execCommand('toggleComment');
    if (!cm.getSelection()) {
        const { line, ch } = cm.getCursor();
        cm.setCursor({ line: line + 1, ch});
    }
};

const beautifyOptions = {
    indent_size: 4,
    indent_char: " ",
    max_preserve_newlines: "-1",
};

const editorOptions = {
    value: 'Press Ctrl-Alt-J (Cmd-Ctrl-J for Mac) to prettify the input',
    mode: { name: 'javascript', json: true },
    indentUnit: 4,
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {
        'Ctrl-/': commentLine,
        'Cmd-/': commentLine,
        'Ctrl-Q': cm => cm.foldCode(cm.getCursor()),
        'Ctrl-Enter': () => elements.sendBtn.click(),
        'Cmd-Enter': () => elements.sendBtn.click(),
        'Ctrl-Alt-J': cm => cm.setValue(js_beautify(cm.getValue(), beautifyOptions)),
        'Cmd-Ctrl-J': cm => cm.setValue(js_beautify(cm.getValue(), beautifyOptions)),
        'F2': cm => cm.setOption('lineWrapping', !cm.getOption('lineWrapping')),
        'F1': cm => cm.setOption('fullScreen', !cm.getOption('fullScreen')),
        'Esc': cm => (cm.getOption('fullScreen') ? cm.setOption('fullScreen', false) : null),
    },
    foldGutter: true,
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    // viewportMargin: Infinity,
    lint: true,
};

const createEditors = (element, options = editorOptions) => CodeMirror.fromTextArea(element, options);

let request;
let response;

const init = () => {
    request = request || createEditors(elements.requestEditor);
    response = response || createEditors(elements.responseEditor);
    response.setSize('100%', '98%');
};

export default {
    init,
    get request() { return request },
    get response() { return response }
};
