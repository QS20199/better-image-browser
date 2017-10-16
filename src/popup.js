let btn = document.getElementById("ctrl-btn");
const TEXT_CONFIG = {
    on: 'Better Image Viewer 已启用',
    off: 'Better Image Viewer 已停用'
};
//状态初始化
chrome.storage.local.get(function (ret) {
    if (ret.status !== "off") {
        btn.innerHTML = TEXT_CONFIG.on;
        btn.dataset.status = "on";
        btn.classList.add("btn-success");
    }
    else {
        btn.innerHTML = TEXT_CONFIG.off;
        btn.dataset.status = "off";
    }
});
//事件绑定
btn.addEventListener("click", function (event) {
    this.classList.toggle('btn-success');
    if (this.dataset.status !== "off") {
        this.innerHTML = TEXT_CONFIG.off;
        this.dataset.status = "off";
        chrome.storage.local.set({
            status: "off"
        });
        setIconDisable();
    }
    else {
        this.innerHTML = TEXT_CONFIG.on;
        this.dataset.status = "on";
        chrome.storage.local.set({
            status: "on"
        });
        setIconEnable();
    }
}, false);
function setIconDisable() {
    chrome.browserAction.setIcon({
        path: "/asset/img/icon_gray_128.png"
    });
}
function setIconEnable() {
    chrome.browserAction.setIcon({
        path: "/asset/img/icon_128.png"
    });
}
//# sourceMappingURL=popup.js.map