chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({ url: 'chrome-extension://'+location.host+'/index.html' });
});
