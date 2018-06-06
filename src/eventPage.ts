// 全屏事件监听
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request && request.action === 'toggleFullScreen') {
		chrome.windows.getCurrent(win => {
			chrome.windows.update(win.id, {
				state: win.state == 'fullscreen' ? 'maximized' : 'fullscreen'
			});
		})
	}
});


chrome.storage.local.get(function (ret) {
	// 图标初始化
	if (ret.status !== "off") {
		chrome.browserAction.setIcon({
			path: "/asset/img/icon_128.png"
		});
	} else {
		chrome.browserAction.setIcon({
			path: "/asset/img/icon_gray_128.png"
		});
	}
})

chrome.runtime.onInstalled.addListener(function (details) {
	// 安装后打开demo页面
	if (details.reason == "install") {
		chrome.tabs.create({
			url: './src/demo.html'
		})
	}
});
