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

    const STG_URL_SCHEMA_KEY = 'ext_swc_schema';
    const STG_OPTIONS_KEY = 'ext_swc_options';

    const isBinaryTypeArrayBuffer = function () {
        return serverSchema.binaryType.val() === 'arraybuffer';
    };

    const enableUrl = function () {
        Object.keys(serverSchema).forEach( function (key) {
            serverSchema[key].removeAttr('disabled');
        })
    };

    const disableUrl = function () {
        Object.keys(serverSchema).forEach( function (key) {
            serverSchema[key].attr('disabled', 'disabled');
        })
    };

    const enableConnectButton = function () {
        connectButton.hide();
        disconnectButton.show();
    };

    const disableConnectButton = function () {
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

    const getNowDateStr = function () {
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

    const getDataFromStorage = function () {
        const data = localStorage.getItem(STG_OPTIONS_KEY);
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

    const updateDataInStorage = function (key, value) {
        const data = getDataFromStorage();
        if (!data[key]) data[key] = {};

        data[key][value] = Object.keys(serverSchema).reduce(function(acc, key) {
            acc[key] = serverSchema[key].val();
            return acc;
        }, {});

        localStorage.setItem(STG_OPTIONS_KEY, JSON.stringify(data));
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

    const wsIsAlive = function () {
        return (typeof ws === 'object'
            && ws !== null
            && 'readyState' in ws
            && ws.readyState === ws.OPEN
        );
    };

    const open = function () {
        const limit = parseInt(showLimit.val(), 10);
        if (!isNaN(limit)) {
            options.showLimit = limit;
        }

        const url = getUrl();
        ws = new WebSocket(url);
        console.log('OPEN: ' + url);
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

        const schema = Object.keys(serverSchema).reduce(function(acc, key) {
            acc[key] = serverSchema[key].val();
            return acc;
        }, {});

        options.urlHistory = Object.assign(options.urlHistory, { [url]: schema });

        localStorage.setItem(STG_URL_SCHEMA_KEY, JSON.stringify(schema));
        localStorage.setItem(STG_OPTIONS_KEY, JSON.stringify(options));

        updateSelect();
    };

    const _onClose = function () {
        connectionStatus.css('color', '#000');
        connectionStatus.text('CLOSED');

        enableUrl();
        disableConnectButton();
        sendButton.attr('disabled', 'disabled');
        showLimit.removeAttr('disabled');
    };

    const close = function () {
        if (wsIsAlive()) {
            ws.close();
        }
        _onClose();
    };

    const clearLog = function () {
        messages.html('');
    };

    const onOpen = function() {
        connectionStatus.css('color', '#009900');
        connectionStatus.text('OPENED');
        sendButton.removeAttr('disabled');
        showLimit.attr('disabled', 'disabled');
    };

    const onClose = function() {
        ws = null;
        _onClose();
    };

    const onMessage = function(event) {
        let data = event.data;
        if (isBinaryTypeArrayBuffer()) {
            const buffer = new Uint8Array(data);
            data = new TextDecoder().decode(buffer).slice(1);
        }
        addMessage(data);
    };

    const onError = function(event) {
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

    const urlKeyDown = function (e) {
        if (e.which === 13) {
            connectButton.click();
            return false;
        }
    };

    const applyUrlData = function (data) {
        Object.keys(data).forEach(function (key) {
            if (data[key] !== undefined ) serverSchema[key].val(data[key]);
        });
    };

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

    const toJson = function (str) {
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

    const beautifyOptions = {
        indent_size: 4,
        indent_char: " ",
        max_preserve_newlines: "-1",
    };

    WebSocketClient = {
        init: function() {
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

            serverSchema.schema = $('#serverSchema');
            serverSchema.host = $('#serverHost');
            serverSchema.port = $('#serverPort');
            serverSchema.path = $('#serverPath');
            serverSchema.params = $('#serverParams');
            serverSchema.binaryType = $('#binaryType');

            const editorOptions = {
                value: 'Press Ctrl-Alt-J to prettify the input',
                mode: { name: 'javascript', json: true },
                indentUnit: 4,
                lineNumbers: true,
                lineWrapping: true,
                extraKeys: {
                    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); },
                    "Ctrl-Enter": function() { sendButton.click(); },
                    "Ctrl-Alt-J": function() { beautify(); },
                },
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                autoCloseBrackets: true
            };

            const editor = CodeMirror.fromTextArea(document.getElementById("editor"), editorOptions);

            parsedMessage = CodeMirror.fromTextArea(document.getElementById("parsedMessage"),
                { ...editorOptions, readOnly: true });

            parsedMessage.setSize(null, '93vh');

            const beautify = function () {
                const content = editor.getValue();
                editor.setValue(js_beautify(content, beautifyOptions));
            };

            const getItem = function(key) {
                return localStorage.getItem(key)
            };

            const stg_url_schema = JSON.parse(getItem(STG_URL_SCHEMA_KEY) || "{}");

            options = Object.assign({}, options, getDataFromStorage());

            Object.keys(stg_url_schema).forEach(function (key) {
                if (stg_url_schema[key] !== null) serverSchema[key].val(stg_url_schema[key])
            });

            if (options.showLimit) showLimit.val(options.showLimit);
            if (options.msToTimestamp === true) msToTimestamp.prop('checked', true);
            if (options.lastRequest) editor.setValue(options.lastRequest);

            updateSelect();
            updateSelect(true, true);

            urlHistory.on('change', function() {
                const url = urlHistory.val();
                const data = getDataFromStorage();
                if (!data || !(url in data.urlHistory)) {
                    console.warn('could not retrieve history item');
                    return;
                }
                applyUrlData(data.urlHistory[url]);
                close();
            });

            sendButton.on('click', function() {
                if(!wsIsAlive()) return;
                let msg = toJson(editor.getValue()).replace(/(\n\s*)/g, '');

                try {
                    msg = JSON.stringify(JSON.parse(msg));
                } catch (e) {
                    console.log('failed to parse a JSON')
                }

                addMessage(msg, 'SENT');
                ws.send(msg);

                options.lastRequest = editor.getValue();
                localStorage.setItem(STG_OPTIONS_KEY, JSON.stringify(options));
            });

            msToTimestamp.on('change', function() {
                options.msToTimestamp = msToTimestamp.is(':checked');
                localStorage.setItem(STG_OPTIONS_KEY, JSON.stringify(options));
            });

            delButton.on('click', function() {
                const url = urlHistory.val();
                const history = getDataFromStorage().urlHistory;
                if (url in history) {
                    delete history[url];
                }
                options.urlHistory = history;
                localStorage.setItem(STG_OPTIONS_KEY, JSON.stringify(options));
                updateSelect();
            });

            favDelButton.on('click', function() {
                const url = favorites.val();
                const fav = getDataFromStorage().favorites;
                if (url in fav) {
                    delete fav[url];
                }
                options.favorites = fav;
                localStorage.setItem(STG_OPTIONS_KEY, JSON.stringify(options));
                updateSelect(true);
            });

            favAddButton.on('click', function() {
                updateDataInStorage('favorites', getUrl());
                updateSelect(true);
            });

            parsedToRequest.on('click', function() {
                const content = parsedMessage.getValue();
                if (content) editor.setValue(js_beautify(content));
            });

            connectButton.on('click', function() {
                return wsIsAlive() ? close() : open();
            });

            disconnectButton.on('click', close);
            favApplyButton.on('click', applyCurrentFavorite);
            clearMsgButton.on('click', clearLog);
            filterMessage.on('input', onFilter);
            favorites.on('change', applyCurrentFavorite);

            Object.keys(serverSchema).forEach( function (key) {
                serverSchema[key].on('keydown', urlKeyDown);
            })
        }
    }
})();

$(function() {
    WebSocketClient.init();
});
