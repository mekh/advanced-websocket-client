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
    value: 'Press Ctrl-Alt-J to prettify the input',
    mode: { name: 'javascript', json: true },
    indentUnit: 4,
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {
        'Ctrl-/': commentLine,
        'Ctrl-Q': cm => cm.foldCode(cm.getCursor()),
        'Ctrl-Enter': () => document.getElementById('sendButton').click(),
        'Ctrl-Alt-J': cm => cm.setValue(js_beautify(cm.getValue(), beautifyOptions)),
        'F2': cm => cm.setOption('lineWrapping', !cm.getOption('lineWrapping')),
        'F1': cm => cm.setOption('fullScreen', !cm.getOption('fullScreen')),
        'Esc': cm => (cm.getOption('fullScreen') ? cm.setOption('fullScreen', false) : null),
    },
    foldGutter: true,
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'errors'],
    autoCloseBrackets: true,
    viewportMargin: Infinity,
    lint: true,
};

const createErrorMarker = lineInfo => {
    if (lineInfo && lineInfo.gutterMarkers && lineInfo.gutterMarkers.errors) {
        return lineInfo.gutterMarkers.errors;
    }
    const marker = document.createElement('div');
    marker.innerHTML = '⊗';
    marker.className = 'CodeMirror-gutter-elt CodeMirror-gutter-markers';

    return marker;
};

const setErrorMarker = (editor, errorMessage, message) => {
    editor.clearGutter('errors');
    const position = errorMessage.match(/at position (\d+)/)[1];
    const lineNumber = message.substr(0, +position).split(/\r\n|\r|\n/).length - 1;

    const lineInfo = editor.lineInfo(lineNumber);

    editor.setGutterMarker(lineNumber, 'errors', createErrorMarker(lineInfo));
    editor.refresh();
};

const createEditors = (id, options = editorOptions) => {
    const editor = CodeMirror.fromTextArea(document.getElementById(id), options);
    editor.setErrorMarker = setErrorMarker.bind(null, editor);
    return editor;
};

let request;
let response;

const init = () => {
    request = request || createEditors('editorRequest');
    response = response || createEditors('editorResponse');
    response.setSize('100%', '890px')
};

export default {
    init,
    get request() { return request },
    get response() { return response }
};
