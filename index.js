(function () {
    let ws = null;

    let filterMessage = '',
        showLimit = '',
        urlHistory = '',
        favorites = '',
        favApplyButton = '',
        favDelButton = '',
        favAddButton = '',
        msToTimestamp = '',
        connectionStatus,
        messages,
        connectButton,
        disconnectButton,
        sendButton,
        delButton,
        clearMsgButton,
        parsedMessage,
        editor,
        parsedToRequest;

    const serverSchema = {
        schema: '',
        host: '',
        port: '',
        path: '',
        params: '',
        binaryType: '',
    };

    let options = {
        showLimit: 1000,
        urlHistory: {},
        favorites: {},
        lastRequest: null,
        msToTimestamp: false,
    };

    const beautifyOptions = {
        indent_size: 4,
        indent_char: " ",
        max_preserve_newlines: "-1",
    };

    const STG_URL_SCHEMA_KEY = 'ext_swc_schema';
    const STG_OPTIONS_KEY = 'ext_swc_options';

    const getItem = key => localStorage.getItem(key);
    const setItem = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    const isBinaryTypeArrayBuffer = () => (serverSchema.binaryType.val() === 'arraybuffer');

    const enableUrl = () => Object.keys(serverSchema).forEach(key =>  serverSchema[key].removeAttr('disabled'));
    const disableUrl = () => Object.keys(serverSchema).forEach(key => serverSchema[key].attr('disabled', 'disabled'));

    const enableConnectButton = () => {
        connectButton.hide();
        disconnectButton.show();
    };

    const disableConnectButton = () => {
        connectButton.show();
        disconnectButton.hide();
    };

    const getUrl = function () {
        let url = serverSchema.schema.val() + '://' + serverSchema.host.val();
        if (serverSchema.port.val()) {
            url += ':' + serverSchema.port.val();
        }
        if (serverSchema.path.val()) {
            url += '/' + serverSchema.path.val();
        }
        if (serverSchema.params.val()) {
            url += '?' + serverSchema.params.val();
        }
        return url;
    };

    const getNowDateStr = () => {
        const now = new Date();
        String(now.getDate()).padStart(2, "0");
        let res = now.getFullYear()
            + '-' + String(now.getMonth() + 1).padStart(2, "0")
            + '-' + String(now.getDate()).padStart(2, "0")
            + ' ' + String(now.getHours()).padStart(2, "0")
            + ':' + String(now.getMinutes()).padStart(2, "0")
            + ':' + String(now.getSeconds()).padStart(2, "0");
        if (msToTimestamp.is(':checked')) {
            res += '.' + String(now.getMilliseconds()).padStart(3, "0");
        }
        return res;
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

    const compileSchema = () => Object
        .keys(serverSchema)
        .reduce((acc, key) => ({ ...acc, [key]: serverSchema[key].val() }), {});

    const updateDataInStorage = (key, value) => {
        const data = getDataFromStorage();
        if (!data[key]) data[key] = {};

        data[key][value] = compileSchema();

        setItem(STG_OPTIONS_KEY, data);
    };

    const updateSelect = function (isFavorites, isFirstStart) {
        const key = isFavorites ? 'favorites' : 'urlHistory';
        const selectElement = isFavorites ? favorites : urlHistory;
        const hist = getDataFromStorage()[key];
        selectElement.find('option').remove().end();

        let index = 0;
        let count = 0;

        for (const url in hist) {
            if(url === getUrl()) index = count;
            count += 1;
            selectElement
                .append($('<option></option>')
                .attr('value', url)
                .text(url));
        }

        if (isFavorites && isFirstStart) {
            selectElement.prop('selectedIndex', -1);
        } else {
            selectElement.prop('selectedIndex', index);
        }
    };

    const wsIsAlive = () => (
        typeof ws === 'object'
            && ws !== null
            && 'readyState' in ws
            && ws.readyState === ws.OPEN
        );

    const open = () => {
        const limit = parseInt(showLimit.val(), 10);
        if (!Number.isNaN(limit)) {
            options.showLimit = limit;
        }

        const url = getUrl();
        ws = new WebSocket(url);

        if (isBinaryTypeArrayBuffer()) {
            ws.binaryType = 'arraybuffer';
        }

        ws.onopen = onOpen;
        ws.onerror = onError;
        ws.onclose = onClose;
        ws.onmessage = onMessage;

        connectionStatus.css('color', '#999900');
        connectionStatus.text('OPENING ...');
        disableUrl();
        enableConnectButton();

        const schema = compileSchema();

        options.urlHistory = Object.assign(options.urlHistory, { [url]: schema });

        setItem(STG_URL_SCHEMA_KEY, schema);
        setItem(STG_OPTIONS_KEY, options);

        updateSelect();
    };

    const _onClose = () => {
        connectionStatus.css('color', '#000');
        connectionStatus.text('CLOSED');

        enableUrl();
        disableConnectButton();
        sendButton.attr('disabled', 'disabled');
        showLimit.removeAttr('disabled');
    };

    const close = () => {
        if (wsIsAlive()) {
            ws.close();
        }
        _onClose();
    };

    const clearLog = () =>  messages.html('');

    const onOpen = () => {
        connectionStatus.css('color', '#009900');
        connectionStatus.text('OPENED');
        sendButton.removeAttr('disabled');
        showLimit.attr('disabled', 'disabled');
    };

    const onClose = () => {
        ws = null;
        _onClose();
    };

    const onMessage = event => {
        let data = event.data;
        if (isBinaryTypeArrayBuffer()) {
            const buffer = new Uint8Array(data);
            data = new TextDecoder().decode(buffer).slice(1);
        }
        addMessage(data);
    };

    const onError = event => {
        const { data } = event;
        if (data !== undefined) {
            console.error('ERROR: ' + data);
        }
        _onClose();
        ws.onclose = () => {};
        connectionStatus.css('color', '#990008');
        connectionStatus.text(` ERROR${data ? ': ' + data : ''}`);
    };

    const onFilter = function (event) {
        messages
            .find('pre')
            .each(function () {
                const element = $(this);

                if (element.html().indexOf(event.target.value) === -1) {
                    element.attr('hidden', 'hidden');
                } else {
                    element.removeAttr('hidden');
                }
            });
    };

    const addMessage = function(data, type) {
        const msg = $('<pre>').text('[' + getNowDateStr() + '] ' + data);
        msg.on('click', function() {
            parsedMessage.setValue(js_beautify(data));
        });
        parsedMessage.setValue(js_beautify(data));
        const filterValue = filterMessage.val();

        if (filterValue && data.indexOf(filterValue) === -1) {
            msg.attr('hidden', 'hidden');
        }

        if (type === 'SENT') {
            msg.addClass('sent');
        }
        const messages = $('#messages');
        messages.append(msg);

        const msgBox = messages.get(0);
        while (msgBox.childNodes.length > options.showLimit) {
            msgBox.removeChild(msgBox.firstChild);
        }
        msgBox.scrollTop = msgBox.scrollHeight;
    };

    const urlKeyDown = e => {
        if (e.which === 13) {
            connectButton.click();
            return false;
        }
    };

    const applyUrlData = data => Object
        .keys(data)
        .filter(key => data[key] !== undefined)
        .forEach(key => serverSchema[key].val(data[key]));

    const applyCurrentFavorite = function () {
        const url = favorites.val();
        const data = getDataFromStorage().favorites;
        if (!(url in data)) {
            console.warn('could not retrieve favorites item');
            return;
        }
        applyUrlData(data[url]);
        close();
    };

    const toJson = str => {
        let res;
        try {
            res = JSON.stringify(JSON.parse(str));
        } catch (e) {
            res = str
            // wrap keys without quote with valid double quote
                .replace(/([\w]+)\s*:\s/g, function (_, $1) {
                    return '"' + $1 + '":'
                })
                // replacing single quote wrapped ones to double quote
                .replace(/'([^']+)'\s*/g, function (_, $1) {
                    return '"' + $1 + '"'
                })
                .replace(/,([\s,\n]*[\],}])/g, function (_, $1) {
                    return $1
                });
        }
        return res;
    };

    const editorOptions = {
        value: 'Press Ctrl-Alt-J to prettify the input',
        mode: { name: 'javascript', json: true },
        indentUnit: 4,
        lineNumbers: true,
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Q": cm => cm.foldCode(cm.getCursor()),
            "Ctrl-Enter": () => sendButton.click(),
            "Ctrl-Alt-J": cm => cm.setValue(js_beautify(cm.getValue(), beautifyOptions)),
        },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", 'errors'],
        autoCloseBrackets: true
    };

    const createErrorMarker = lineInfo => {
        if (lineInfo && lineInfo.gutterMarkers && lineInfo.gutterMarkers.errors) {
            return lineInfo.gutterMarkers.errors;
        }
        const marker = document.createElement("div");
        marker.innerHTML = "⊗";
        marker.className = 'CodeMirror-gutter-elt CodeMirror-gutter-markers';

        return marker;
    };

    const setErrorMarker = (errorMessage, message) => {
        const position = errorMessage.match(/at position (\d+)/)[1];
        const lineNumber = message.substr(0, +position).split(/\r\n|\r|\n/).length - 1;

        const lineInfo = editor.lineInfo(lineNumber);

        editor.setGutterMarker(lineNumber, "errors", createErrorMarker(lineInfo));
        editor.refresh();
    };

    const createEditors = () => {
        editor = CodeMirror.fromTextArea(document.getElementById("editor"), editorOptions);
        parsedMessage = CodeMirror.fromTextArea(document.getElementById("parsedMessage"), editorOptions);

        parsedMessage.setSize(null, '93vh');
    };

    const applySettings = () => {
        const stg_url_schema = JSON.parse(getItem(STG_URL_SCHEMA_KEY) || "{}");

        options = Object.assign({}, options, getDataFromStorage());

        Object
            .keys(stg_url_schema)
            .filter(key => stg_url_schema[key] !== null)
            .forEach(key =>  serverSchema[key].val(stg_url_schema[key]));

        if (options.showLimit) showLimit.val(options.showLimit);
        if (options.msToTimestamp === true) msToTimestamp.prop('checked', true);
        if (options.lastRequest) editor.setValue(options.lastRequest);
    };

    const applyServerSchema = () => {
        serverSchema.schema = $('#serverSchema');
        serverSchema.host = $('#serverHost');
        serverSchema.port = $('#serverPort');
        serverSchema.path = $('#serverPath');
        serverSchema.params = $('#serverParams');
        serverSchema.binaryType = $('#binaryType');
    };

    App = {
        init() {
            filterMessage    = $('#filterMessage');
            delButton        = $('#delButton');
            favApplyButton   = $('#favApplyButton');
            favDelButton     = $('#favDelButton');
            favAddButton     = $('#favAddButton');
            connectButton    = $('#connectButton');
            disconnectButton = $('#disconnectButton');
            sendButton       = $('#sendButton');
            clearMsgButton   = $('#clearMessage');
            messages         = $('#messages');
            connectionStatus = $('#connectionStatus');
            showLimit        = $('#showLimit');
            urlHistory       = $('#urlHistory');
            favorites        = $('#favorites');
            msToTimestamp    = $('#msToTimestamp');
            parsedToRequest  = $('#parsedToRequest');

            applyServerSchema();
            createEditors();
            applySettings();
            updateSelect();
            updateSelect(true, true);

            urlHistory.on('change', () => {
                const url = urlHistory.val();
                const data = getDataFromStorage();
                if (!data || !(url in data.urlHistory)) {
                    console.warn('could not retrieve history item');
                    return;
                }
                applyUrlData(data.urlHistory[url]);
                close();
            });

            sendButton.on('click', () => {
                if(!wsIsAlive()) return;
                const content = editor.getValue();
                let msg = toJson(content);

                try {
                    msg = JSON.stringify(JSON.parse(msg)).replace(/(\n\s*)/g, '');
                } catch (e) {
                    return setErrorMarker(e.message, content);
                }

                editor.clearGutter('errors');

                addMessage(msg, 'SENT');
                ws.send(msg);

                options.lastRequest = content;
                setItem(STG_OPTIONS_KEY, options);
            });

            msToTimestamp.on('change', () => {
                options.msToTimestamp = msToTimestamp.is(':checked');
                setItem(STG_OPTIONS_KEY, options);
            });

            delButton.on('click', () => {
                const url = urlHistory.val();
                const history = getDataFromStorage().urlHistory;
                if (url in history) {
                    delete history[url];
                }
                options.urlHistory = history;
                setItem(STG_OPTIONS_KEY, options);
                updateSelect();
            });

            favDelButton.on('click', () => {
                const url = favorites.val();
                const fav = getDataFromStorage().favorites;
                if (url in fav) {
                    delete fav[url];
                }
                options.favorites = fav;
                setItem(STG_OPTIONS_KEY, options);
                updateSelect(true);
            });

            favAddButton.on('click', () => {
                updateDataInStorage('favorites', getUrl());
                updateSelect(true);
            });

            parsedToRequest.on('click', () => {
                const content = parsedMessage.getValue();
                if (content) editor.setValue(js_beautify(content));
            });

            connectButton.on('click', () => {
                return wsIsAlive() ? close() : open();
            });

            disconnectButton.on('click', close);
            favApplyButton.on('click', applyCurrentFavorite);
            clearMsgButton.on('click', clearLog);
            filterMessage.on('input', onFilter);
            favorites.on('change', applyCurrentFavorite);

            Object.values(serverSchema).forEach(item => item.on('keydown', urlKeyDown))
        }
    }
})();

$(function() {
    App.init();
});
