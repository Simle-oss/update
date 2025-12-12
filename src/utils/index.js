// 对象深拷贝
export function objDeepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
/**
 * 转换参数为 URL 编码的查询字符串
 * @param {Object} params - 需要转换的参数对象
 * @returns {string} 编码后的查询字符串（末尾无多余 &）
 */
export function tansParams(params) {
  const parts = []; // 用数组收集所有键值对，最后统一拼接
  // 遍历顶层参数
  Object.entries(params).forEach(([propName, value]) => {
    // 跳过空值（null/空字符串/undefined）
    if (value == null || value === '' || typeof value === 'undefined') {
      return;
    }
    // 处理对象类型的参数（嵌套结构）
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, subValue]) => {
        // 跳过嵌套对象中的空值
        if (subValue == null || subValue === '' || typeof subValue === 'undefined') {
          return;
        }
        // 拼接嵌套参数格式：propName[key]=value
        const paramKey = `${propName}[${key}]`;
        parts.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(subValue)}`);
      });
    } else {
      // 处理基础类型参数
      parts.push(`${encodeURIComponent(propName)}=${encodeURIComponent(value)}`);
    }
  });
  // 拼接所有部分，用 & 连接
  return parts.join('&');
}

// 我需要一个会改变原数组的过滤
function arrayFilert(list, fn) {
  for (let i = 0; i < list.length;) {
    if (!fn(list[i], i)) {
      list.splice(i, 1);
    } else {
      i++;
    }
  }
  return list;
}

/**
 * 用来过滤数组开始的树结构数据，采用的剔除不相干枝干的逻辑，所以会改变原数组，使用时请传入数组的副本
 * @param {Array} treeList 要过滤的树
 * @param {Funtction} fn 过滤规则
 */
function deepFilter(treeList, fn) {
  return arrayFilert(treeList, (item) => {
    if (item.children && item.children.length) {
      deepFilter(item.children, fn);
      if (item.children.length) {
        return true;
      } else {
        // 之前的逻辑是它只有在属于目录的时候才会有children，所以不需要考虑本身匹配的情况
        // 此系统中菜单下还可能会有菜单，所以要处理他自己就能匹配的情况
        return fn(item);
      }
    } else {
      return fn(item);
    }
  });
}

/** deepFilter的包装，使方法不改变传入的数据  */
export function treeFilter(treeList, fn) {
  return deepFilter(objDeepCopy(treeList), fn);
}
// 深拷贝
export function deepClone(source) {
  // 非对象类型直接返回（null 也属于 object 类型，需单独处理）
  if (source === null || typeof source !== "object") {
    return source;
  }
  // 处理数组
  if (Array.isArray(source)) {
    return source.map(item => deepClone(item));
  }
  // 处理对象（排除特殊属性）
  const targetObj = {};
  const keys = Object.keys(source);
  for (const key of keys) {
    // 过滤 __proto__ 和 constructor 等特殊属性，避免原型污染
    if (key === '__proto__' || key === 'constructor') {
      continue;
    }
    // 递归克隆子对象
    if (typeof source[key] === 'object' && source[key] !== null) {
      targetObj[key] = deepClone(source[key]);
    } else {
      targetObj[key] = source[key];
    }
  }
  return targetObj;
}
// 获取url参数
export function getParamsFromUrl(url) {
  const params = {};
  const hashIndex = url.indexOf("#");
  const queryString =
    hashIndex !== -1
      ? url.substring(hashIndex + 1).split("?")[1]
      : url.split("?")[1];
  if (queryString) {
    const pairs = queryString.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      params[key] = decodeURIComponent(value);
    }
  }
  return params;
}

import crypto from 'crypto-js'; // 依赖 crypto-js，需安装：npm install crypto-js
/**
 * 密码加密工具类（SHA-256 + 随机盐值，无固定秘钥）
 * 相同明文+相同盐值 → 加密结果一致，满足复用需求
 * 依赖：crypto-js（需先安装：npm install crypto-js）
 */
export const PasswordEncryptor = {
  /**
   * 生成随机盐值（16位16进制字符串，增强安全性）
   * @returns {string} 随机盐值
   */
  generateSalt() {
    // 生成 8 字节随机数，转为 16 位 16 进制字符串（盐值长度可调整）
    return crypto.lib.WordArray.random(8).toString(crypto.enc.Hex);
  },

  /**
   * 加密明文密码（无固定秘钥，仅用盐值）
   * @param {string} plainPassword - 明文密码
   * @param {string} [salt] - 盐值（不传则自动生成，需存储盐值用于验证）
   * @returns {Promise<{hash: string, salt: string}>} 哈希值 + 盐值
   * @throws {Error} 输入无效或加密失败时抛出错误
   */
  async encrypt(plainPassword, salt) {
    // 验证输入合法性
    if (typeof plainPassword !== 'string' || plainPassword.trim() === '') {
      throw new Error('请输入有效的明文密码');
    }

    try {
      // 若未传盐值，自动生成
      const usedSalt = salt || this.generateSalt();
      // 密码 + 盐值 组合（避免相同密码哈希值一致，防止彩虹表破解）
      const passwordWithSalt = plainPassword.trim() + usedSalt;
      // SHA-256 哈希（输出 64 位 16 进制字符串）
      const hash = crypto.SHA256(passwordWithSalt).toString(crypto.enc.Hex);
      return { hash, salt: usedSalt };
    } catch (error) {
      throw new Error(`密码加密失败：${error.message}`);
    }
  },

  /**
   * 验证密码是否匹配（需传入加密时的盐值）
   * @param {string} plainPassword - 明文密码
   * @param {string} storedHash - 存储的哈希值
   * @param {string} storedSalt - 存储的盐值
   * @returns {Promise<boolean>} 是否匹配
   * @throws {Error} 输入无效或验证失败时抛出错误
   */
  async verify(plainPassword, storedHash, storedSalt) {
    // 验证输入合法性
    if (
      typeof plainPassword !== 'string' ||
      typeof storedHash !== 'string' ||
      typeof storedSalt !== 'string'
    ) {
      throw new Error('请输入有效的密码、哈希值和盐值');
    }

    try {
      // 使用相同盐值重新加密，对比哈希结果
      const { hash: newHash } = await this.encrypt(plainPassword, storedSalt);
      return newHash === storedHash;
    } catch (error) {
      throw new Error(`密码验证失败：${error.message}`);
    }
  }
};

/**
* 防抖函数
* @param {Function} func - 需要防抖的函数
* @param {number} wait - 等待时间（毫秒）
* @param {boolean} immediate - 是否立即执行（true：先执行后等待，false：先等待后执行）
* @returns {Function} 防抖处理后的函数
*/
export function debounce(func, wait, immediate) {
  let timeout = null; // 用于存储定时器ID

  return function (...args) {
    // 保存当前上下文和参数，确保函数执行时的this和参数正确
    const context = this;

    // 如果已有定时器，清除它
    if (timeout) clearTimeout(timeout);

    // 立即执行模式
    if (immediate) {
      // 如果没有定时器（说明是第一次触发或已超过等待时间），立即执行函数
      const callNow = !timeout;
      // 设置定时器，等待时间后清空定时器（允许下次触发）
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      // 立即执行函数
      if (callNow) func.apply(context, args);
    } else {
      // 非立即执行模式：等待wait毫秒后执行函数
      timeout = setTimeout(() => {
        func.apply(context, args);
        timeout = null; // 执行后清空定时器
      }, wait);
    }
  };
}
export function mapToNodeStructure(input = {}, nodeKeys = {}, options = {}) {
  // 为兼容旧环境（如未配置可选链/??），不要使用可选链或 nullish coalescing
  var defaultState = false;
  var defaultContent = '';
  if (options && typeof options.defaultState !== 'undefined') {
    defaultState = options.defaultState;
  }
  if (options && typeof options.defaultContent !== 'undefined') {
    defaultContent = options.defaultContent;
  }

  // build title -> key map from nodeKeys
  var titleMap = {};
  var nodeKeyNames = Object.keys(nodeKeys);
  for (var i = 0; i < nodeKeyNames.length; i++) {
    var key = nodeKeyNames[i];
    var title = (nodeKeys[key] && nodeKeys[key].title) ? nodeKeys[key].title : key;
    titleMap[title] = key;
  }

  // initialize result with all keys present
  var result = {};
  for (var j = 0; j < nodeKeyNames.length; j++) {
    var k = nodeKeyNames[j];
    result[k] = { state: defaultState, content: defaultContent };
  }

  // helper normalizer for fuzzy matching
  var normalize = function (s) {
    s = s == null ? '' : String(s);
    return s
      .replace(/\s+/g, '')
      .replace(/[^\w\u4e00-\u9fa5]/g, '')
      .toLowerCase();
  };

  // try to match each input key to a node key
  var inputKeys = Object.keys(input);
  for (var m = 0; m < inputKeys.length; m++) {
    var inKey = inputKeys[m];
    var value = input[inKey];
    var matchedKey = null;

    // 1) exact match by title
    if (Object.prototype.hasOwnProperty.call(titleMap, inKey)) {
      matchedKey = titleMap[inKey];
    }

    // 2) case-insensitive exact (useful if mixing ascii)
    if (!matchedKey) {
      for (var tIdx = 0; tIdx < Object.keys(titleMap).length; tIdx++) {
        var t = Object.keys(titleMap)[tIdx];
        if (t.toLowerCase() === inKey.toLowerCase()) {
          matchedKey = titleMap[t];
          break;
        }
      }
    }

    // 3) substring contains either way (e.g. '技术领域' vs '所属技术领域')
    if (!matchedKey) {
      var titleKeys = Object.keys(titleMap);
      for (var s = 0; s < titleKeys.length; s++) {
        var tk = titleKeys[s];
        if (tk.indexOf(inKey) !== -1 || inKey.indexOf(tk) !== -1) {
          matchedKey = titleMap[tk];
          break;
        }
      }
    }

    // 4) normalized match (remove spaces/punctuations)
    if (!matchedKey) {
      var titleKeys2 = Object.keys(titleMap);
      for (var n = 0; n < titleKeys2.length; n++) {
        var tk2 = titleKeys2[n];
        if (normalize(tk2) === normalize(inKey)) {
          matchedKey = titleMap[tk2];
          break;
        }
      }
    }

    if (matchedKey) {
      result[matchedKey] = { state: defaultState, content: value };
    } else {
      // optionally collect unmapped keys
      if (options && options.collectUnmapped) {
        if (!result._unmapped) result._unmapped = {};
        result._unmapped[inKey] = value;
      }
    }
  }

  return result;
}