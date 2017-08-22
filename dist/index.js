const STEP = 1.25;
const MIN_SCALE = 1 / Math.pow(STEP, 5);
let img = document.querySelector('img');
img.style.transform = 'scale(1) translate(0px, 0px)';
img.draggable = false;
document.addEventListener('mousewheel', e => {
    let scaleVal = Number(img.style.transform.match(/scale\((.*?)\)/)[1]);
    if (e.deltaY < 0) {
        scaleVal *= STEP;
    }
    else {
        scaleVal /= STEP;
        if (scaleVal < MIN_SCALE)
            scaleVal = MIN_SCALE;
    }
    img.style.transform = img.style.transform.replace(/scale\(.*?\)/, `scale(${scaleVal})`);
});
document.addEventListener('click', e => {
    e.stopPropagation();
}, true);
let shouldMove = false, deltaX = 0, deltaY = 0;
let timer;
document.addEventListener('mousedown', e => {
    e.stopPropagation();
    shouldMove = true;
    img.style.transition = '0s';
    timer = setInterval(() => {
        let m = img.style.transform.match(/translate\((.*)\)/);
        let scaleVal = Number(img.style.transform.match(/scale\((.*?)\)/)[1]);
        let x, y;
        if (m && m[1]) {
            [x, y] = m[1].split(',').map(v => Number(v.replace('px', '')));
        }
        else {
            x = y = 0;
        }
        x = x + deltaX / scaleVal;
        y = y + deltaY / scaleVal;
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