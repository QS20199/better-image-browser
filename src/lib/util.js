"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class util {
    /**
 * 根据图片地址, 获取真实大小
 *
 * @param {string} imgUrl
 * @returns [width, height]
 */
    static getImgRealSize(imgUrl) {
        return new Promise(resolve => {
            let _img = new Image();
            _img.src = imgUrl;
            _img.onload = () => {
                resolve([_img.width, _img.height]);
                _img.remove();
                _img = null;
            };
        });
    }
    /**
 * 根据资源地址, 获取contenttype
 *
 * @param {string} url
 * @returns [width, height]
 */
    static getContentType(url) {
        return new Promise(resolve => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    let contentType = xhr.getResponseHeader("Content-Type");
                    resolve(contentType);
                }
            };
            xhr.send();
        });
    }
}
exports.util = util;
//# sourceMappingURL=util.js.map