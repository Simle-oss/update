import Vue from "vue";

// 水波纹指令
import waves from "./waves/index.js";
Vue.directive("waves", waves); // 全局注册

import DOMPurify from 'dompurify'; // 已引入过，直接复用

// 提取独立的净化渲染函数（无 this 依赖）
function sanitizeAndRender(el, binding) {
  let html = binding.value || '';
  
  // 1. 输入校验：只接受字符串类型
  if (typeof html !== 'string') {
    console.warn('v-safe-html 仅支持字符串类型，已过滤非字符串内容');
    el.innerHTML = '';
    return;
  }

  // 2. 解析修饰符，适配不同渲染上下文（html/svg/mathml）
  const context = binding.modifiers.svg ? 'svg' : 
                 binding.modifiers.math ? 'mathml' : 'html';

  // 3. 强化 DOMPurify 配置，防御 XSS（含变异型）
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: [], // 禁止额外属性
    ALLOW_UNKNOWN_PROTOCOLS: false, // 禁止未知协议
    ALLOW_UNSAFE_HASH: false, // 禁止危险 hash
    USE_PROFILES: { [context]: true }, // 启用对应上下文安全配置
    FORBID_TAGS: ['script', 'iframe', 'embed', 'object', 'base'], // 禁用高危标签
    FORBID_ATTR: ['on*', 'href', 'src', 'action', 'formaction'], // 禁用危险属性
    SANITIZE_NAMED_PROPS: true, // 净化命名属性，抵御变异属性攻击
    context: context // 明确渲染上下文
  });

  // 4. 二次兜底过滤：拦截遗漏的危险模式
  const finalHtml = sanitizedHtml
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '');

  // 5. 保持原有插入逻辑，确保展示正常
  el.innerHTML = finalHtml;
}

// 自定义指令：安全渲染 HTML（无 this 版本）
Vue.directive('safe-html', {
  // 绑定元素插入 DOM 时执行
  inserted(el, binding) {
    sanitizeAndRender(el, binding);
  },
  // 数据更新时重新渲染（兼容响应式变化）
  update(el, binding) {
    sanitizeAndRender(el, binding);
  }
});
