let btn = document.getElementById("ctrl-btn");
//状态初始化
chrome.storage.local.get(function (ret) {
    if (ret.status !== "off") {
        btn.innerHTML = "已启用";
        btn.dataset.status = "on";
        btn.classList.add("btn-success");
    }
    else {
        btn.innerHTML = "已启用";
    }
});
//事件绑定
btn.addEventListener("click", function (event) {
    this.classList.toggle('btn-success');
    if (this.dataset.status !== "off") {
        this.innerHTML = '已停用';
        this.dataset.status = "off";
        chrome.storage.local.set({
            status: "off"
        });
    }
    else {
        this.innerHTML = "已启用";
        this.dataset.status = "on";
        chrome.storage.local.set({
            status: "on"
        });
    }
}, false);
//# sourceMappingURL=popup.js.map