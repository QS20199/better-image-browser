const STEP = 1.25;
const MIN_SCALE = 1 / Math.pow(STEP, 5);

let img = document.querySelector('img');
img.style.transform = 'scale(1)';

document.addEventListener('mousewheel', e => {
	let scaleVal = Number(img.style.transform.match(/\d+(\.\d+)?/)[0]);
	if (e.deltaY < 0) {
		scaleVal *= STEP;
	} else {
		scaleVal /= STEP;
		if (scaleVal < MIN_SCALE) scaleVal = MIN_SCALE;
	}
	img.style.transform = `scale(${scaleVal})`;
});

document.addEventListener('click', e => {
	e.stopPropagation();
}, true);

console.log('better image browser start')