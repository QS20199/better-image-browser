import * as $ from 'jquery';

// 入口
(async function main() {
	// 检测是否启用
	chrome.storage.local.get(async storage => {
		if (storage.status !== 'off') {
			// 部分图床(如V2)自身的URL是.png结尾, 但实际上并不是image类型, 这里判断一下
			let contentType = await getContentType(location.href);
			if (/^image/.test(contentType)) {
				await run();
			} else if (/^chrome\-extension\:.*\/demo\.html/.test(location.href)) { // 插件本身的demo页面, 也启用
				await run();
			} else {
				// console.log('contentType为非图片类型, better image viewer已禁用')
			}
		}
	})
})();


async function run() {
	const STEP = 1.2;

	addCss();
	initToastr();
	initContext();
	macTips();

	// 新建一个img元素, 替换旧的chrome自己生成的img元素, 因为chrome会在某些情况下操作自己生成的img的style属性, 具体规则不清楚.
	let oldImg = document.querySelector('img');
	let oldWidth = oldImg.width;
	let oldHeight = oldImg.height;
	let img = new Image();
	img.src = oldImg.src;
	oldImg.remove();

	let container = document.createElement('div');
	document.body.appendChild(container);
	container.appendChild(img);
	let [realWidth, realHeight] = await getImgRealSize(img.src);

	// 先让图片渲染足够大, 让raster主动预先进行image decode, 再经过定时器调整回正常大小.
	// 如果不进行预先的decode, 用户缩放时才会进行decode, 可能会需要数百毫秒, 造成卡顿
	img.style.width = '30000px';
	img.style.height = '30000px';
	img.style.display = 'block';

	img.style.width = oldWidth + 'px';
	img.style.height = oldHeight + 'px';
	img.style.transform = 'translate(0px, 0px)';
	img.style.left = document.body.offsetWidth / 2 - oldWidth / 2 + 'px';
	img.style.top = document.body.offsetHeight / 2 - oldHeight / 2 + 'px';
	img.draggable = false;
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
	let timerClick, timerWheel;

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

		// 如果缩放值离原图大小很接近, 则恢复到原图大小
		if (Math.abs((newVal.width - realWidth) / realWidth) <= 0.1) {
			newVal.width = realWidth;
			newVal.height = realHeight;
		}

		let marginLeft = img.offsetLeft,
			marginTop = img.offsetTop;

		// 实际上图片两边到left top的距离
		let offsetX = img.offsetLeft + oldVal.tX,
			offsetY = img.offsetTop + oldVal.tY;

		// 鼠标所在到图片两边的距离
		let innerX = e.clientX - offsetX,
			innerY = e.clientY - offsetY;

		// 如果鼠标不在图片范围内, 则不进行缩放
		if (innerX < 0 || innerY < 0 || innerX > oldVal.width || innerY > oldVal.height) return;

		// 显示百分比
		showToastr(`${Math.round(newVal.width / realWidth * 100)}%`);

		// 缩放中心通过left和top来改变
		if (e.deltaY < 0) { // 放大
			newVal.left = oldVal.left - innerX * (STEP - 1);
			newVal.top = oldVal.top - innerY * (STEP - 1);
		} else { // 缩小
			newVal.left = oldVal.left + innerX * (1 - 1 / STEP);
			newVal.top = oldVal.top + innerY * (1 - 1 / STEP);
		}

		img.style.width = newVal.width + 'px';
		img.style.height = newVal.height + 'px';
		img.style.left = newVal.left + 'px';
		img.style.top = newVal.top + 'px';
	});



	document.addEventListener('click', e => {
		// e.stopPropagation();
	}, true);



	document.addEventListener('mousedown', e => {
		e.stopPropagation();
		shouldMove = true;

		timerClick = setInterval(() => {
			let m = img.style.transform.match(/translate\((.*?)\)/);
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
	}, true);



	document.addEventListener('mousemove', e => {
		e.stopPropagation();
		if (!shouldMove) return;
		deltaX += e.movementX;
		deltaY += e.movementY;
	}, true)



	// 双击切换全屏
	document.addEventListener('dblclick', e => {
		// 不知道为什么, 切换全屏时, chrome会重置img的cssText, 这里设置一个定时器重置一下
		let cssText = img.style.cssText;
		let _timer = setInterval(() => {
			if (img.style.cssText != cssText) {
				img.style.cssText = cssText;
				clearInterval(_timer);
			}
		}, 16);

		chrome.runtime.sendMessage({
			action: 'toggleFullScreen'
		});
	});

	console.log('better image browser start')

	function addCss() {
		require('../asset/css/main.css');
		// let url = chrome.runtime.getURL('/asset/css/main.css');
		// let el = document.createElement('link');
		// el.href = url;
		// el.rel = 'stylesheet';
		// el.type = 'text/css';
		// document.head.appendChild(el);
	}



	function initToastr() {
		require('../asset/css/toastr.css');
		let htm = `
		<div style='display:none' id="toast-container" class="toast-top-right" aria-live="polite" role="alert">
			<div class="toast" style="padding: 10px;">
				<div class="toast-message" id="toast-message"></div>
			</div>
		</div>`;
		$('body').append($(htm));
	}

	function initContext() {
		let context = require('./lib/context.js').context;
		console.log(context);
		require('../asset/css/context.standalone.css')
		context.init({
			fadeSpeed: 100,
			above: 'auto',
			preventDoubleContext: true,
			compress: false
		});

		context.attach({ selector: 'img' }, [{
			text: 'rotate left', 
			action: function () {
				rotate('left')
			}
		}, {
			text: 'rotate right',
			action: function () {
				rotate('right')
			}
		}])

		function rotate(dir) {
			let text = img.style.transform;
			let m = text.match(/rotate\((-?\d+)deg\)/);
			let oldVal = m && m[1] && Number(m[1]) || 0;
			img.style.transition = `0.1s all linear`;
			img.style.transform = text.replace(/\srotate\(-?\d+deg\)/, '') + ` rotate(${dir == 'left' ? oldVal - 90 : oldVal + 90}deg)`;
			setTimeout(function () {
				img.style.transition = '';
			}, 100);
		}
	}
}


let showToastrTimer;
function showToastr(str) {
	$("#toast-message").html(str);
	$("#toast-container").fadeIn();
	clearTimeout(showToastrTimer);
	showToastrTimer = setTimeout(function () {
		$("#toast-container").fadeOut();
	}, 750);
}



/**
 * 根据图片地址, 获取真实大小
 * 
 * @param {string} imgUrl 
 * @returns [width, height]
 */
function getImgRealSize(imgUrl: string): Promise<[number, number]> {
	return new Promise(resolve => {
		let _img = new Image();
		_img.src = imgUrl;
		_img.onload = () => {
			resolve([_img.width, _img.height]);
			_img.remove();
			_img = null;
		}
	})
}



/**
 * 根据资源地址, 获取contenttype
 * 
 * @param {string} url 
 * @returns [width, height]
 */
function getContentType(url: string): Promise<string> {
	return new Promise(resolve => {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				let contentType = xhr.getResponseHeader("Content-Type");
				resolve(contentType);
			}
		}
		xhr.send();
	})
}



/**
 * 如果检测到mac系统, 则弹出一次性提示
 */
function macTips() {
	if (navigator.platform.indexOf("Mac") == -1) return;

	chrome.storage.local.get(sto => {
		if (!sto.isShowMacTips) {
			alert('Tips from Better Image Viewer:\n\n' +
				'Dececting you are using MacOS.\n' +
				'If you are using touchpad, it will be conflicted with this extension.\n' +
				'If so, you can disabled this extension by clicking the extension icon.');
			chrome.storage.local.set({
				isShowMacTips: true
			})
		}
	});
}