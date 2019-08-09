(function() {
    let ws = null;
    let connected = false;

    let serverSchema = '',
        serverHost = '',
        serverPort = '',
        serverPath = '',
        serverParams = '',
        filterMessage = '',
        lastMsgsNum = '',
        binaryType = '',
        urlHistory = '',
        favorites = '',
        favApplyButton = '',
        favDelButton = '',
        favAddButton = '',
        showMsgTsMilliseconds = '',
        connectionStatus,
        sendMessage,
        messages,
        connectButton,
        disconnectButton,
        sendButton,
        delButton,
        clearMsgButton;

    const MAX_LINES_COUNT = 1000,
        STG_URL_HIST_KEY = 'ext_swc_url_history',
        STG_URL_FAV_KEY = 'ext_swc_favorites',
        STG_URL_SCHEMA_KEY = 'ext_swc_schema',
        STG_URL_HOST_KEY = 'ext_swc_host',
        STG_URL_PORT_KEY = 'ext_swc_port',
        STG_URL_PATH_KEY = 'ext_swc_path',
        STG_URL_PARAMS_KEY = 'ext_swc_params',
        STG_BIN_TYPE_KEY   = 'ext_swc_bintype',
        STG_REQUEST_KEY    = 'ext_swc_request',
        STG_MSG_TS_MS_KEY  = 'ext_swc_msg_ts_ms',
        STG_MSGS_NUM_KEY   = 'ext_swc_msgs_num';

    let lastMsgsNumCur = MAX_LINES_COUNT;

    const isBinaryTypeArrayBuffer = function () {
        return binaryType.val() === 'arraybuffer';
    };

    const enableUrl = function () {
        serverSchema.removeAttr('disabled');
        serverHost.removeAttr('disabled');
        serverPort.removeAttr('disabled');
        serverPath.removeAttr('disabled');
        serverParams.removeAttr('disabled');
        binaryType.removeAttr('disabled');
    };

    const getUrl = function () {
        let url = serverSchema.val() + '://' + serverHost.val();
        if (serverPort.val()) {
            url += ':' + serverPort.val();
        }
        if (serverPath.val()) {
            url += '/' + serverPath.val();
        }
        if (serverParams.val()) {
            url += '?' + serverParams.val();
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
        if (showMsgTsMilliseconds.is(':checked')) {
            res += '.' + String(now.getMilliseconds()).padStart(3, "0");
        }
        return res;
    };

    const getDataFromStorage = function (isFavorites) {
        const stg_data = localStorage.getItem(isFavorites ? STG_URL_FAV_KEY : STG_URL_HIST_KEY);
        let ret = {};
        if (stg_data !== null) {
            try {
                ret = JSON.parse(stg_data);
            } catch (e) {
                console.error('could not parse json from storage: ' + e.message);
            }
        }
        return ret;
    };

    const updateDataInStorage = function (isFavorites) {
        const data = getDataFromStorage(isFavorites);
        const url = getUrl();

        data[url] = {
            schema: serverSchema.val(),
            host: serverHost.val(),
            port: serverPort.val(),
            path: serverPath.val(),
            params: serverParams.val(),
            binaryType: binaryType.val(),
        };
        localStorage.setItem(isFavorites ? STG_URL_FAV_KEY : STG_URL_HIST_KEY, JSON.stringify(data));
    };

    const disableUrl = function () {
        serverSchema.attr('disabled', 'disabled');
        serverHost.attr('disabled', 'disabled');
        serverPort.attr('disabled', 'disabled');
        serverPath.attr('disabled', 'disabled');
        serverParams.attr('disabled', 'disabled');
        binaryType.attr('disabled', 'disabled');
    };

    const enableConnectButton = function () {
        connectButton.hide();
        disconnectButton.show();
    };

    const disableConnectButton = function () {
        connectButton.show();
        disconnectButton.hide();
    };

    const wsIsAlive = function () {
        return (typeof (ws) === 'object'
            && ws !== null
            && 'readyState' in ws
            && ws.readyState === ws.OPEN
        );
    };

    const updateSelect = function (isFavorites, isFirstStart) {
        const hist = JSON.parse(localStorage.getItem(isFavorites ? STG_URL_FAV_KEY : STG_URL_HIST_KEY));
        const selectElement = isFavorites ? favorites : urlHistory;
        selectElement.find('option').remove().end();
        for (let url in hist) {
            selectElement.append($('<option></option>')
                .attr('value', url)
                .text(url));
        }
        if (isFavorites && isFirstStart) {
            selectElement.prop('selectedIndex', -1);
        }
    };

    const open = function () {
        lastMsgsNumCur = MAX_LINES_COUNT;
        const lastMsgsNumParsed = parseInt(lastMsgsNum.val(), 10);
        if (!isNaN(lastMsgsNumParsed)) {
            lastMsgsNumCur = lastMsgsNumParsed;
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

        console.log('OPENING ' + url + ' ...');
        connectionStatus.css('color', '#999900');
        connectionStatus.text('OPENING ...');
        disableUrl();
        enableConnectButton();

        localStorage.setItem(STG_URL_SCHEMA_KEY, serverSchema.val());
        localStorage.setItem(STG_URL_HOST_KEY, serverHost.val());
        localStorage.setItem(STG_URL_PORT_KEY, serverPort.val());
        localStorage.setItem(STG_URL_PATH_KEY, serverPath.val());
        localStorage.setItem(STG_URL_PARAMS_KEY, serverParams.val());
        localStorage.setItem(STG_BIN_TYPE_KEY, binaryType.val());
        localStorage.setItem(STG_MSGS_NUM_KEY, lastMsgsNum.val());

        updateDataInStorage();
        updateSelect();
    };

    const _onClose = function () {
        connected = false;
        connectionStatus.css('color', '#000');
        connectionStatus.text('CLOSED');
        console.log('CLOSED: ' + getUrl());

        enableUrl();
        disableConnectButton();
        sendMessage.attr('disabled', 'disabled');
        sendButton.attr('disabled', 'disabled');
        lastMsgsNum.removeAttr('disabled');
    };

    const close = function () {
        if (wsIsAlive()) {
            console.log('CLOSING ...');
            ws.close();
        }
        _onClose();
    };

    const clearLog = function () {
        messages.html('');
    };

    const onOpen = function() {
        connected = true;
        connectionStatus.css('color', '#009900');
        connectionStatus.text('OPENED');
        sendMessage.removeAttr('disabled');
        sendButton.removeAttr('disabled');
        lastMsgsNum.attr('disabled', 'disabled');
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
                    element.attr('hidden', true);
                } else {
                    element.removeAttr('hidden');
                }
            });
    };

    const addMessage = function(data, type) {
        const parsed = data;
        try {
            // parsed = '\n' + JSON.stringify(JSON.parse(data), null, 4);
        } catch (e) {
            // do nothing;
        }
        const msg = $('<pre>').text('[' + getNowDateStr() + '] ' + parsed);
        const filterValue = filterMessage.val();

        if (filterValue && data.indexOf(filterValue) === -1) {
            msg.attr('hidden', true);
        }

        if (type === 'SENT') {
            msg.addClass('sent');
        }
        const messages = $('#messages');
        messages.append(msg);

        const msgBox = messages.get(0);
        while (msgBox.childNodes.length > lastMsgsNumCur) {
            msgBox.removeChild(msgBox.firstChild);
        }
        msgBox.scrollTop = msgBox.scrollHeight;
    };

    const urlKeyDown = function (e) {
        console.log(e.which);
        if (e.which === 13) {
            connectButton.click();
            return false;
        }
    };

    const applyUrlData = function (data) {
        if (data.schema !== undefined) {
            serverSchema.val(data.schema);
        }
        if (data.host !== undefined) {
            serverHost.val(data.host);
        }
        if (data.port !== undefined) {
            serverPort.val(data.port);
        }
        if (data.path !== undefined) {
            serverPath.val(data.path);
        }
        if (data.params !== undefined) {
            serverParams.val(data.params);
        }
        if (data.binaryType !== undefined) {
            binaryType.val(data.binaryType);
        }
    };

    const applyCurrentFavorite = function () {
        const url = favorites.val(),
            data = getDataFromStorage(true);
        if (!(url in data)) {
            console.warn('could not retrieve favorites item');
            return;
        }
        applyUrlData(data[url]);
        close();
    };

    const toJson = function (str) {
        const res = str
            // wrap keys without quote with valid double quote
            .replace(/([\w]+)\s*:/g, function (_, $1) {
                return '"' + $1 + '":'
            })
            // replacing single quote wrapped ones to double quote
            .replace(/'([^']+)'/g, function (_, $1) {
                return '"' + $1 + '"'
            })
            .replace(/,([\s,\n]*[\],}])/g, function (_, $1) {
                return $1
            });
        console.log(res);
        return res;
    };

    WebSocketClient = {
        init: function() {
            serverSchema  = $('#serverSchema');
            serverHost    = $('#serverHost');
            serverPort    = $('#serverPort');
            serverPath    = $('#serverPath');
            serverParams  = $('#serverParams');
            binaryType    = $('#binaryType');
            filterMessage = $('#filterMessage');
            lastMsgsNum   = $('#lastMsgsNum');
            urlHistory    = $('#urlHistory');
            favorites     = $('#favorites');

            connectionStatus = $('#connectionStatus');
            sendMessage      = $('#sendMessage');

            delButton        = $('#delButton');
            favApplyButton   = $('#favApplyButton');
            favDelButton     = $('#favDelButton');
            favAddButton     = $('#favAddButton');
            connectButton    = $('#connectButton');
            disconnectButton = $('#disconnectButton');
            sendButton       = $('#sendButton');
            clearMsgButton   = $('#clearMessage');
            showMsgTsMilliseconds = $('#showMsgTsMilliseconds');

            messages         = $('#messages');

            updateSelect();
            updateSelect(true, true);

            const stg_url_schema = localStorage.getItem(STG_URL_SCHEMA_KEY);
            if (stg_url_schema !== null) {
                serverSchema.val(stg_url_schema);
            }
            const stg_url_host = localStorage.getItem(STG_URL_HOST_KEY);
            if (stg_url_host !== null) {
                serverHost.val(stg_url_host);
            }
            const stg_url_port = localStorage.getItem(STG_URL_PORT_KEY);
            if (stg_url_port !== null) {
                serverPort.val(stg_url_port);
            }
            const stg_url_path = localStorage.getItem(STG_URL_PATH_KEY);
            if (stg_url_path !== null) {
                serverPath.val(stg_url_path);
            }
            const stg_url_params = localStorage.getItem(STG_URL_PARAMS_KEY);
            if (stg_url_params !== null) {
                serverParams.val(stg_url_params);
            }
            const stg_bin_type = localStorage.getItem(STG_BIN_TYPE_KEY);
            if (stg_bin_type !== null) {
                binaryType.val(stg_bin_type);
            }
            const stg_request = localStorage.getItem(STG_REQUEST_KEY);
            if (stg_request !== null) {
                sendMessage.val(stg_request);
            }
            const stg_msg_ts_ms = localStorage.getItem(STG_MSG_TS_MS_KEY);
            if (stg_msg_ts_ms !== null && stg_msg_ts_ms === 'true') {
                showMsgTsMilliseconds.prop('checked', true);
            }
            const stg_msgs_num = localStorage.getItem(STG_MSGS_NUM_KEY);
            if (stg_msgs_num !== null) {
                lastMsgsNum.val(stg_msgs_num);
            }

            urlHistory.change(function() {
                const url = urlHistory.val(),
                    url_hist = getDataFromStorage();
                if (!(url in url_hist)) {
                    console.warn('could not retrieve history item');
                    return;
                }
                applyUrlData(url_hist[url]);
                close();
            });

            favorites.on('change', applyCurrentFavorite);

            delButton.on('click', function() {
                const url = urlHistory.val(),
                    url_hist = getDataFromStorage();
                if (url in url_hist) {
                    delete url_hist[url];
                }
                localStorage.setItem(STG_URL_HIST_KEY, JSON.stringify(url_hist));
                updateSelect();
            });

            favDelButton.on('click', function() {
                const url = favorites.val(),
                    fav = getDataFromStorage(true);
                if (url in fav) {
                    delete fav[url];
                }
                localStorage.setItem(STG_URL_FAV_KEY, JSON.stringify(fav));
                updateSelect(true);
            });

            favApplyButton.on('click', function() {
                applyCurrentFavorite();
            });

            favAddButton.on('click', function() {
                updateDataInStorage(true);
                updateSelect(true);
            });

            connectButton.on('click', function() {
                if (wsIsAlive()) {
                    close();
                }
                open();
            });

            disconnectButton.on('click', function() {
                close();
            });

            sendButton.on('click', function() {
                let msg = sendMessage.val();

                try {
                    msg = JSON.stringify(JSON.parse(toJson(msg)));
                } catch (e) {
                    console.log('failed to parse a JSON')
                }
                console.log(msg);

                addMessage(msg, 'SENT');
                ws.send(msg);
                localStorage.setItem(STG_REQUEST_KEY, sendMessage.val());
            });

            clearMsgButton.on('click', function() {
                clearLog();
            });

            filterMessage.on('input', onFilter);

            let isCtrl;
            sendMessage.on('keyup', function (e) {
                    if (e.which === 17) {
                        isCtrl = false;
                    }
                });

            sendMessage.on('keydown', function (e) {
                if (e.which === 17) {
                    isCtrl = true;
                }
                if (e.which === 13 && isCtrl === true) {
                    sendButton.click();
                    return false;
                } else if (e.which === 13) {

                }
            });

            showMsgTsMilliseconds.change(function() {
                localStorage.setItem(STG_MSG_TS_MS_KEY, showMsgTsMilliseconds.is(':checked'));
            });

            serverSchema.keydown(urlKeyDown);
            serverHost.keydown(urlKeyDown);
            serverPort.keydown(urlKeyDown);
            serverPath.keydown(urlKeyDown);
            serverParams.keydown(urlKeyDown);
        }
    };
})();

$(function() {
    WebSocketClient.init();
});
