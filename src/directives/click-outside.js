// src/directives/click-outside.js

import { onMounted, onUnmounted, ref } from 'vue';

export default {
    beforeMount(el, binding) {
        const documentHandler = (event) => {
            if (!el.contains(event.target)) {
                binding.value(event);
            }
        };

        // 添加全局点击事件监听器
        document.addEventListener('click', documentHandler);

        // 将事件处理器保存到元素的 _clickOutside_ 属性上，便于解绑时使用
        el._clickOutside_ = documentHandler;
    },

    beforeUnmount(el) {
        // 移除全局点击事件监听器
        document.removeEventListener('click', el._clickOutside_);
        delete el._clickOutside_;
    },
};