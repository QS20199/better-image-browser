function run() {
    const STEP = 1.2;
    addCss();
    let img = document.querySelector('img');
    img.style.transform = 'translate(0px, 0px)';
    img.style.left = document.body.offsetWidth / 2 - img.width / 2 + 'px';
    img.style.top = document.body.offsetHeight / 2 - img.height / 2 + 'px';
    img.draggable = false;
    img.id = 'img';
    // 先让图片渲染足够大, 让raster主动预先进行image decode, 再经过定时器调整回正常大小.
    // 如果不进行预先的decode, 用户缩放时才会进行decode, 可能会需要数百毫秒, 造成卡顿
    let _width = img.width;
    let _height = img.height;
    img.style.width = '30000px';
    img.style.height = '30000px';
    img.style.display = 'block';
    setTimeout(function () {
        img.style.width = _width + 'px';
        img.style.height = _height + 'px';
    }, 0);
    function getPx(str) {
        return Number(str.split('px')[0]);
    }
    let shouldMove = false, deltaX = 0, deltaY = 0, wheelCount = 0, lastInnerX = 0, lastInnerY = 0;
    let timerClick, timerWheel;
    document.addEventListener('mousewheel', e => {
        let oldVal = {
            width: getPx(img.style.width),
            height: getPx(img.style.height),
            left: getPx(img.style.left),
            top: getPx(img.style.top)
        }, newVal = {};
        let transformStr = img.style.transform;
        [, oldVal.tX, oldVal.tY] = transformStr.match(/translate\((.*?)px, (.*?)px\)/).map(v => Number(v));
        // 求新的缩放值
        if (e.deltaY < 0) {
            newVal.width = oldVal.width * STEP;
            newVal.height = oldVal.height * STEP;
        }
        else {
            newVal.width = oldVal.width / STEP;
            newVal.height = oldVal.height / STEP;
        }
        let marginLeft = img.offsetLeft, marginTop = img.offsetTop;
        // 实际上图片两边到left top的距离
        let offsetX = img.offsetLeft + oldVal.tX, offsetY = img.offsetTop + oldVal.tY;
        // 鼠标所在到图片两边的距离
        let innerX = e.clientX - offsetX, innerY = e.clientY - offsetY;
        // 鼠标不在图片内, 不进行缩放
        if (innerX <= 0 || innerY <= 0 || innerX >= img.width || innerY >= img.height) {
            return;
        }
        else {
            // 鼠标在图片内, 缩放中心通过left和top来改变
            if (e.deltaY < 0) {
                newVal.left = oldVal.left - innerX * (STEP - 1);
                newVal.top = oldVal.top - innerY * (STEP - 1);
            }
            else {
                newVal.left = oldVal.left + innerX * (1 - 1 / STEP);
                newVal.top = oldVal.top + innerY * (1 - 1 / STEP);
            }
        }
        img.style.width = newVal.width;
        img.style.height = newVal.height;
        img.style.left = newVal.left;
        img.style.top = newVal.top;
    });
    document.addEventListener('click', e => {
        e.stopPropagation();
    }, true);
    document.addEventListener('mousedown', e => {
        e.stopPropagation();
        shouldMove = true;
        img.style.transition = '0s';
        timerClick = setInterval(() => {
            let m = img.style.transform.match(/translate\((.*)\)/);
            let x, y;
            if (m && m[1]) {
                [x, y] = m[1].split(',').map(v => Number(v.replace('px', '')));
            }
            else {
                x = y = 0;
            }
            x = x + deltaX;
            y = y + deltaY;
            img.style.transform = img.style.transform.replace(/translate\(.*?\)/, `translate(${x}px, ${y}px)`);
            deltaX = deltaY = 0;
        }, 16);
    }, true);
    document.addEventListener('mouseup', e => {
        e.stopPropagation();
        shouldMove = false;
        img.style.transition = '';
    }, true);
    document.addEventListener('mousemove', e => {
        e.stopPropagation();
        if (!shouldMove)
            return;
        deltaX += e.movementX;
        deltaY += e.movementY;
    }, true);
    // 双击切换全屏
    document.addEventListener('dblclick', e => {
        chrome.runtime.sendMessage({
            action: 'toggleFullScreen'
        });
    });
    console.log('better image browser start');
}
function addCss() {
    let url = chrome.runtime.getURL('/asset/css/main.css');
    let el = document.createElement('link');
    el.href = url;
    el.rel = 'stylesheet';
    el.type = 'text/css';
    document.head.appendChild(el);
}
// 只在mac以外的平台启用, mac有触摸板不开启这个功能
if (navigator.platform.indexOf("Mac") == -1) {
    run();
}
//# sourceMappingURL=index.js.map