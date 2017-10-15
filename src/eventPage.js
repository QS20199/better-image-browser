chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request && request.action === 'toggleFullScreen') {
        chrome.windows.getCurrent(win => {
            chrome.windows.update(win.id, {
                state: win.state == 'fullscreen' ? 'maximized' : 'fullscreen'
            });
        });
    }
});
//# sourceMappingURL=eventPage.js.map