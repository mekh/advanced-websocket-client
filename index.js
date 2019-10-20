let ws = null;

let filterMessage,
    showLimit,
    urlHistory,
    favorites,
    msToTimestamp,
    connectionStatus,
    messages,
    connectButton,
    sendButton,
    parsedMessage,
    editor;

const STG_URL_SCHEMA_KEY = 'ext_swc_schema';
const STG_OPTIONS_KEY = 'ext_swc_options';

let options = {
    showLimit: 1000,
    urlHistory: [],
    favorites: [],
    lastRequest: null,
    msToTimestamp: false,
};

const beautifyOptions = {
    indent_size: 4,
    indent_char: " ",
    max_preserve_newlines: "-1",
};

const serverSchema = {
    url: '',
    binaryType: '',
};

const isBinaryTypeArrayBuffer = () => (serverSchema.binaryType.value === 'arraybuffer');

const getItem = key => localStorage.getItem(key);
const setItem = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getUrl = () => serverSchema.url.value;
const setUrl = url => serverSchema.url.value = url;

const getNowDateStr = () => {
    const now = new Date();
    const date = new Date(now.getTime() - (now.getTimezoneOffset() * 60000 ))
        .toISOString().split("T").join(' ').slice(0, -1);

    return msToTimestamp.checked === true ? date : date.slice(0, -4);
};

const getDataFromStorage = () => {
    const data = getItem(STG_OPTIONS_KEY);
    let ret = {};
    if (data !== null) {
        try {
            ret = JSON.parse(data);
        } catch (e) {
            console.error('could not parse json from storage: ' + e.message);
        }
    }
    return ret;
};

const updateDataInStorage = (key, value) => {
    const data = getDataFromStorage();
    if (!data[key]) data[key] = [];
    if(data[key].includes(value)) return;

    data[key].push(value);

    setItem(STG_OPTIONS_KEY, data);
};

const connectionAlive = () => (
    typeof ws === 'object'
    && ws !== null
    && 'readyState' in ws
    && ws.readyState === ws.OPEN
);

const connectionClosed = () => {
    serverSchema.url.removeAttribute('disabled');
    connectButton.removeAttribute('disabled');
    showLimit.removeAttribute('disabled');
    sendButton.setAttribute('disabled', 'disabled');
    connectionStatus.style.color = '#000';
    connectionStatus.innerHTML = 'CLOSED';
    connectButton.innerHTML = 'Open';
};

const connectionOpening = () => {
    serverSchema.url.setAttribute('disabled', 'disabled');
    connectButton.setAttribute('disabled', 'disabled');
    connectionStatus.style.color = '#999900';
    connectionStatus.innerHTML = 'OPENING ...';
    connectButton.innerHTML = 'Opening';
};

const connectionOpened = () => {
    connectButton.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
    showLimit.setAttribute('disabled', 'disabled');
    connectionStatus.style.color = '#009900';
    connectionStatus.innerHTML = 'OPENED';
    connectButton.innerHTML = 'Close';
};

const connectionError = () => {
    connectionClosed();
    ws.onclose = () => {};
    connectionStatus.style.color = '#990008';
    connectionStatus.innerHTML = 'ERROR';
};

const openConnection = () => {
    const limit = parseInt(showLimit.value, 10);
    if (!Number.isNaN(limit)) {
        options.showLimit = limit;
    }

    const url = getUrl();
    ws = new WebSocket(url);
    connectionOpening();

    if (isBinaryTypeArrayBuffer()) {
        ws.binaryType = 'arraybuffer';
    }

    ws.onopen = connectionOpened;
    ws.onerror = connectionError;
    ws.onclose = connectionClosed;
    ws.onmessage = message => addToMessageHistory(message, 'RECEIVED');

    if (!options.urlHistory.includes(url)) options.urlHistory.push(url);

    localStorage.setItem(STG_URL_SCHEMA_KEY, url);
    setItem(STG_OPTIONS_KEY, options);

    updateSelect();
};

const switchConnection = () => ( connectionAlive() ? ws.close() : openConnection() );


// ----- Message History
const clearMessageHistory = () =>  {
    const items = messages.querySelectorAll('pre');

    for (let i=0; i < items.length; i += 1){
        const element = items[i];
        const dummy = element.cloneNode(false);
        element.parentNode.replaceChild(dummy, element);
        messages.removeChild(dummy);
    }
};

const filterMessageHistory = event => {
    const items = messages.querySelectorAll('pre');

    for (let i=0; i < items.length; i += 1){
        const element = items[i];

        if (element.innerText.indexOf(event.target.value) === -1) {
            element.setAttribute('hidden', 'hidden');
        } else {
            element.removeAttribute('hidden');
        }
    }
};

const addToMessageHistory = (message, type) => {
    let data = message;
    if (type === 'RECEIVED') {
        data = message.data;
        if (isBinaryTypeArrayBuffer()) {
            const buffer = new Uint8Array(message.data);
            data = new TextDecoder().decode(buffer).slice(1);
        }
    }

    const msg = document.createElement('pre');
    msg.innerHTML = `[${getNowDateStr()}]${data}`;

    msg.addEventListener('click', () => {
        parsedMessage.setValue(js_beautify(data));
    });

    parsedMessage.setValue(js_beautify(data));
    const filterValue = filterMessage.value;

    if (filterValue && data.indexOf(filterValue) === -1) {
        msg.setAttribute('hidden', 'hidden');
    }

    if (type === 'SENT') {
        msg.classList += ' sent';
    }

    const messages = document.getElementById('messages');
    messages.appendChild(msg);

    while (messages.childNodes.length > options.showLimit) {
        messages.removeChild(messages.firstChild);
    }

    messages.scrollTop = messages.scrollHeight;
};
// -----

// ----- Connection Settings
const updateSelect = (isFavorites, isFirstStart) => {
    const key = isFavorites ? 'favorites' : 'urlHistory';
    const selectElement = isFavorites ? favorites : urlHistory;
    const hist = getDataFromStorage()[key] || [];

    const items = selectElement.querySelectorAll('option');

    for (let i=0; i < items.length; i += 1){
        items[i].parentNode.removeChild(items[i]);
    }

    let index = 0;
    let count = 0;

    for (const url of hist) {
        if(url === getUrl()) index = count;
        count += 1;
        const opt = document.createElement('option');
        selectElement.appendChild(opt);
        opt.innerHTML = url;

    }

    selectElement.selectedIndex = (isFavorites && isFirstStart) ? -1 : index;
};

const applyCurrentFavorite = () => {
    setUrl(favorites.value);
    if (connectionAlive()) ws.close();
};

const applySettings = () => {
    setUrl(getItem(STG_URL_SCHEMA_KEY) || '');
    options = Object.assign({}, options, getDataFromStorage());

    if (options.showLimit) showLimit.value = options.showLimit;
    if (options.msToTimestamp === true) msToTimestamp.checked = true;
    if (options.lastRequest) editor.setValue(options.lastRequest);
};

const setServerSchema = () => {
    serverSchema.url = document.getElementById('wsConnectionString');
    serverSchema.binaryType = document.getElementById('binaryType');
};
// -----


// ----- Editors
const toJson = str => {
    let res;
    try {
        res = JSON.stringify(JSON.parse(str));
    } catch (e) {
        res = str
            // replace comments
            .replace(/\/\/.*/g, '')
            // wrap keys without quote with valid double quote
            .replace(/([\w]+)\s*:\s/g, (_, sub) => `"${sub}":`)
            // replacing single quote wrapped ones to double quote
            .replace(/'([^']+)'\s*/g, (_, sub) => `"${sub}"`)
            .replace(/,([\s,\n]*[\],}])/g, (_, sub) => sub);
    }
    return res;
};

const commentLine = cm => {
    cm.execCommand('toggleComment');
    if (!cm.getSelection()) {
        const { line, ch } = cm.getCursor();
        cm.setCursor({ line: line + 1, ch});
    }
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
        'Ctrl-Enter': () => sendButton.click(),
        'Ctrl-Alt-J': cm => cm.setValue(js_beautify(cm.getValue(), beautifyOptions)),
        'F2': cm => cm.setOption('lineWrapping', !cm.getOption('lineWrapping')),
        'F11': cm => cm.setOption('fullScreen', !cm.getOption('fullScreen')),
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

const setErrorMarker = (errorMessage, message) => {
    const position = errorMessage.match(/at position (\d+)/)[1];
    const lineNumber = message.substr(0, +position).split(/\r\n|\r|\n/).length - 1;

    const lineInfo = editor.lineInfo(lineNumber);

    editor.setGutterMarker(lineNumber, 'errors', createErrorMarker(lineInfo));
    editor.refresh();
};

const createEditors = () => {
    CodeMirror.defineSimpleMode('simpleMode', {
        arguments: [],
        meta: { lineComment: '#' },
        start: [
          { regex: /#.*/,  token: 'comment' },
       ]
    });

    editor = CodeMirror.fromTextArea(document.getElementById('editor'), editorOptions);
    parsedMessage = CodeMirror.fromTextArea(document.getElementById('parsedMessage'), editorOptions);

    parsedMessage.setSize('100%', '890px');
};
// -----

const initResizeHandler = () => {
    let isResizing = false;

    const container = document.getElementById("wrapper");
    const left = document.getElementById("content");
    const right = document.getElementById("parsed");
    const handle = document.getElementById("drag");

    handle.onmousedown = () => isResizing = true;

    document.onmousemove = e => {
        if (!isResizing) {
            return;
        }

        const offsetRight = container.clientWidth - (e.clientX - container.offsetLeft);

        left.style.right = `${offsetRight}px`;
        right.style.width = `${offsetRight}px`;
        messages.style.width = `${e.clientX - 43}px`;
    };

    document.onmouseup = () => {
        isResizing = false;
    }
};

const App = {
    init() {
        filterMessage    = document.getElementById('filterMessage');
        connectButton    = document.getElementById('connectButton');
        sendButton       = document.getElementById('sendButton');
        messages         = document.getElementById('messages');
        connectionStatus = document.getElementById('connectionStatus');
        showLimit        = document.getElementById('showLimit');
        urlHistory       = document.getElementById('urlHistory');
        favorites        = document.getElementById('favorites');
        msToTimestamp    = document.getElementById('msToTimestamp');

        const delButton    = document.getElementById('delButton');
        const favAddButton = document.getElementById('favAddButton');
        const favDelButton = document.getElementById('favDelButton');
        const clearButton  = document.getElementById('clearMessage');
        const copyButton   = document.getElementById('parsedToRequest');

        initResizeHandler();
        setServerSchema();
        createEditors();
        applySettings();
        updateSelect();
        updateSelect(true, true);

        urlHistory.addEventListener('change', () => {
            setUrl(urlHistory.value);
            if (connectionAlive()) ws.close();
        });

        sendButton.addEventListener('click', () => {
            const content = editor.getValue();
            let msg = toJson(content);

            try {
                msg = JSON.stringify(JSON.parse(msg)).replace(/(\n\s*)/g, '');
            } catch (e) {
                console.error(e.message, msg);
                return setErrorMarker(e.message, content);
            }

            editor.clearGutter('errors');

            addToMessageHistory(msg, 'SENT');
            ws.send(msg);

            options.lastRequest = content;
            setItem(STG_OPTIONS_KEY, options);
        });

        msToTimestamp.addEventListener('change', () => {
            options.msToTimestamp = msToTimestamp.checked === true;
            setItem(STG_OPTIONS_KEY, options);
        });

        delButton.addEventListener('click', () => {
            const url = urlHistory.value;
            const history = getDataFromStorage().urlHistory;
            options.urlHistory = history.filter(uri => uri !== url);
            setItem(STG_OPTIONS_KEY, options);
            updateSelect();
        });

        favDelButton.addEventListener('click', () => {
            const url = favorites.value;
            const fav = getDataFromStorage().favorites;
            options.favorites = fav.filter(uri => uri !== url);
            setItem(STG_OPTIONS_KEY, options);
            updateSelect(true);
        });

        favAddButton.addEventListener('click', () => {
            updateDataInStorage('favorites', getUrl());
            updateSelect(true);
        });

        copyButton.addEventListener('click', () => {
            const content = parsedMessage.getValue();
            if (content) editor.setValue(js_beautify(content));
        });

        clearButton.addEventListener('click', clearMessageHistory);
        filterMessage.addEventListener('input', filterMessageHistory);
        connectButton.addEventListener('click', switchConnection);
        favorites.addEventListener('change', applyCurrentFavorite);

        serverSchema.url.addEventListener('keydown', e => {
           if (e.which === 13) {
                connectButton.click();
                return false;
            }
        });
    }
};


window.addEventListener('load', App.init);
