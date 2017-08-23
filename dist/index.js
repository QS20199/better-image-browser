const STEP = 1.25;
// const MIN_SCALE = 1 / Math.pow(STEP, 5);
let img = document.querySelector('img');
img.style.transform = 'translate(0px, 0px)';
img.draggable = false;
img.style.width = img.width + 'px';
img.style.height = img.height + 'px';
function getPx(str) {
    return str.split('px')[0];
}
let shouldMove = false, deltaX = 0, deltaY = 0;
let timer;
// todo: 重新设计方案
// 关键步骤
// 1.确定缩放重心
// 2.确定4个关键值
document.addEventListener('mousewheel', e => {
    let oldVal = {
        width: getPx(img.style.width),
        height: getPx(img.style.height),
    }, newVal = {};
    let transformStr = img.style.transform;
    [, oldVal.tX, oldVal.tY] = transformStr.match(/translate\((.*?)px, (.*?)px\)/).map(v => Number(v));
    // 求新的缩放值
    if (e.deltaY < 0) {
        // newVal.scale = oldVal.scale * STEP;
        newVal.width = oldVal.width * STEP;
        newVal.height = oldVal.height * STEP;
    }
    else {
        // newVal.scale = oldVal.scale / STEP;
        newVal.width = oldVal.width / STEP;
        newVal.height = oldVal.height / STEP;
        // if (newVal.scale < MIN_SCALE) newVal.scale = MIN_SCALE;
    }
    let marginLeft = img.offsetLeft, marginTop = img.offsetTop;
    // 实际上图片两边到left top的距离
    let offsetX = img.offsetLeft + oldVal.tX, offsetY = img.offsetTop + oldVal.tY;
    // 鼠标所在到图片两边的距离
    let innerX = e.clientX - offsetX, innerY = e.clientY - offsetY;
    console.log(innerX, innerY);
    // 鼠标不在图片内, 位移量不变
    if (innerX <= 0 || innerY <= 0 || innerX >= img.width || innerY >= img.height) {
        newVal.tX = oldVal.tX;
        newVal.tY = oldVal.tY;
    }
    else {
        let sign = e.deltaY < 0 ? 1 : -1;
        newVal.tX = oldVal.tX + sign * ((img.width / 2) - innerX) * (STEP - 1);
        newVal.tY = oldVal.tY + sign * ((img.height / 2) - innerY) * (STEP - 1);
    }
    img.style.transform = `translate(${newVal.tX}px, ${newVal.tY}px)`;
    img.style.width = newVal.width;
    img.style.height = newVal.height;
});
document.addEventListener('click', e => {
    e.stopPropagation();
}, true);
document.addEventListener('mousedown', e => {
    e.stopPropagation();
    shouldMove = true;
    img.style.transition = '0s';
    timer = setInterval(() => {
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
console.log('better image browser start');
//# sourceMappingURL=index.js.map