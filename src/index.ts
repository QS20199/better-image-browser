const STEP = 1.1;
// const MIN_SCALE = 1 / Math.pow(STEP, 5);

let img = document.querySelector('img');
img.style.transform = 'translate(0px, 0px)';
img.style.left = '0px';
img.style.top = '0px';
img.draggable = false;
img.style.width = img.width + 'px';
img.style.height = img.height + 'px';
img.id = 'img';
function getPx(str) {
	return Number(str.split('px')[0]);
}

let shouldMove = false,
	deltaX = 0,
	deltaY = 0,
	wheelCount = 0,
	lastInnerX = 0,
	lastInnerY = 0;
let timer, timerWheel;

document.addEventListener('mousewheel', e => {
	let oldVal: any = {
		width: getPx(img.style.width),
		height: getPx(img.style.height),
		left: getPx(img.style.left),
		top: getPx(img.style.top)
	},
		newVal: any = {};

	let transformStr = img.style.transform;
	[, oldVal.tX, oldVal.tY] = transformStr.match(/translate\((.*?)px, (.*?)px\)/).map(v => Number(v));

	// 求新的缩放值
	if (e.deltaY < 0) {
		newVal.width = oldVal.width * STEP;
		newVal.height = oldVal.height * STEP;
	} else {
		newVal.width = oldVal.width / STEP;
		newVal.height = oldVal.height / STEP;
	}


	let marginLeft = img.offsetLeft,
		marginTop = img.offsetTop;

	// 实际上图片两边到left top的距离
	let offsetX = img.offsetLeft + oldVal.tX,
		offsetY = img.offsetTop + oldVal.tY;

	// 鼠标所在到图片两边的距离
	let innerX = e.clientX - offsetX,
		innerY = e.clientY - offsetY;


	// 鼠标不在图片内, 缩放中心不变
	if (innerX <= 0 || innerY <= 0 || innerX >= img.width || innerY >= img.height) {
		newVal.left = oldVal.left;
		newVal.top = oldVal.top;
	} else {
		// 鼠标在图片内, 缩放中心通过left和top来改变
		if (e.deltaY < 0) { // 放大
			newVal.left = oldVal.left - innerX * (STEP - 1);
			newVal.top = oldVal.top - innerY * (STEP - 1);
		} else { // 缩小
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

	timer = setInterval(() => {
		let m = img.style.transform.match(/translate\((.*)\)/);
		let x, y;
		if (m && m[1]) {
			[x, y] = m[1].split(',').map(v => Number(v.replace('px', '')));
		} else {
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
	if (!shouldMove) return;
	deltaX += e.movementX;
	deltaY += e.movementY;
}, true)

console.log('better image browser start')