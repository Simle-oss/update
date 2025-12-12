import "./purify.min";
import DOMPurify from "dompurify";
// 完善配置（替换原配置）
DOMPurify.setConfig({
  // 禁止所有危险标签（即使默认禁止，显式声明更稳妥）
  FORBID_TAGS: ['script', 'style', 'iframe', 'svg', 'canvas'], // 按需移除允许的标签
  FORBID_ATTR: ['on*', 'href', 'src', 'data*'], // 禁止所有事件属性（onclick等）、资源属性
  
  // 严格限制协议（仅允许 http/https/mailto 等安全协议）
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ALLOWED_URI_REGEXP: /^(https?:\/\/|mailto:|tel:)/, // 白名单协议
  
  // 禁止自定义元素（避免潜在的组件漏洞）
  ALLOW_UNKNOWN_SELF_CLOSED_TAGS: false,
  SANITIZE_DOM: true, // 强制净化DOM结构
  
  // 过滤 SVG（如果不需要 SVG，直接禁用）
  SVG: false,
  SVG_FONT_FACE: false,
  
  // 额外过滤文本中的危险字符
  HOOKS: {
    afterSanitizeAttributes: (node) => {
      // 移除所有剩余的事件属性（兜底）
      Array.from(node.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          node.removeAttribute(attr.name);
        }
      });
    }
  }
});

// 导出配置后的净化函数
export const sanitize = DOMPurify.sanitize;

// 导出原始DOMPurify实例（如需在特定场景修改配置）
export default DOMPurify;
