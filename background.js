chrome.action.onClicked.addListener(async (tab) => {
    const extensionURL = chrome.runtime.getURL("index.html");

    await chrome.tabs.create({ url: extensionURL });
});
