// 通用工具占位，后续可扩展
export const Utils = {
    ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }
};

console.log('utils.js loaded');

