/**
 * 埋点统计工具（修复重复请求问题）
 * 核心优化：防重复点击、队列去重、重试逻辑重置、事件防抖
 * 新增参数：request_params和response_result（转义的JSON字符串）
 */
import axios from 'axios';
import router from '../router';
import cache from '@/plugins/cache';
class Tracker {
    constructor() {
        this.apiUrl = '/api3004/action_logs';
        this.queue = [];
        this.isSending = false;
        this.retryCount = 3; // 单次请求的重试次数（默认3次）
        this.batchDelay = 0;
        this.timer = null;
        // 新增：记录是否为HTTPS环境（用于协议校验）
        this.isHttpsEnv = window.location.protocol === 'https:';
        // 防重复点击：记录最近一次track的key，避免1秒内重复添加同一埋点
        this.lastTrackKey = '';
        this.lastTrackTime = 0;

        // 允许的操作类型和路由映射（保持不变）
        this.allowedFunctionNames = [
            '技术方案完善', '技术方案查新', '交底书生成', '交底书修改',
            'PPT大纲生成', 'PPT生成', '附图代码生成', '附图渲染', '用户登录'
        ];
        this.routeMap = [
            { path: '/novelty', name: '技术方案查新' },
            { path: '/disclosure', name: '交底书生成' },
            { path: "/login", name: "登录页" },
            { path: '/ppt', name: 'PPT生成' },
            { path: '/figure', name: '附图生成' }
        ];
    }

    /**
     * 1. 生成埋点唯一key（用于防重复）
     * @param {Object} trackData 埋点数据
     * @returns {string} 唯一key
     */
    getTrackUniqueKey(trackData) {
        // 基于“操作类型+页面名称+时间戳（秒级）”生成key，避免1秒内重复添加
        const timeSecond = Math.floor(trackData.timestamp / 1000);
        return `${trackData.function_name}_${trackData.page_name}_${timeSecond}`;
    }

    /**
     * 辅助方法：将对象转为转义的JSON字符串
     * @param {Object} data 要转换的对象
     * @returns {string} 转义后的JSON字符串，出错时返回空字符串
     */
    stringifyJson(data) {
        try {
            if (!data || typeof data !== 'object') {
                return '';
            }
            // 先转为JSON字符串，再进行转义处理
            return JSON.stringify(data);
        } catch (e) {
            console.error('JSON序列化失败');
            return '';
        }
    }

    /**
     * 2. 验证并添加埋点到队列（核心防重复逻辑）
     */
    track(options) {
        // 新增：开发环境不执行埋点
        // if (process.env.NODE_ENV === 'development') {
        //     return;
        // }
        // 基础参数校验
        if (!options || !options.functionName) {
            console.error('埋点参数错误：必须提供functionName');
            return;
        }
        if (!this.allowedFunctionNames.includes(options.functionName)) {
            console.warn(`不支持的操作类型: ${options.functionName}`);
            return;
        }

        // 处理请求参数和响应结果，转为转义的JSON字符串
        // const requestParamsStr = this.stringifyJson(options.requestParams);
        // const responseResultStr = this.stringifyJson(options.responseResult);
        const requestParamsStr = options.requestParams;
        const responseResultStr = options.responseResult;
        let user = cache.local.getJSON('userInfo') || {}
        // 构建埋点数据，包含新增的两个参数
        const trackData = {
            user_id: user.user_id || 1,
            function_name: options.functionName,
            page_name: options.pageName || this.getPageName(),
            status: options.status,
            timestamp: Date.now(),
            ip_address: window.location.href,
            request_params: requestParamsStr,    // 新增参数：转义的JSON字符串
            response_result: responseResultStr,  // 新增参数：转义的JSON字符串
            ...(options.extra || {})
        };

        // 防重复：1秒内同一操作不重复添加
        const currentKey = this.getTrackUniqueKey(trackData);
        const currentTime = Date.now();
        if (currentKey === this.lastTrackKey && currentTime - this.lastTrackTime < 1000) {
            console.log('1秒内已添加相同埋点，跳过重复添加', currentKey);
            return;
        }
        // 更新最近一次埋点记录
        this.lastTrackKey = currentKey;
        this.lastTrackTime = currentTime;

        // 队列去重：避免队列中已有相同埋点
        const isDuplicate = this.queue.some(item => this.getTrackUniqueKey(item) === currentKey);
        if (isDuplicate) {
            console.log('队列中已存在相同埋点，跳过重复添加', currentKey);
            return;
        }

        // 正常添加到队列
        this.queue.push(trackData);
        console.log('埋点添加到队列', trackData);

        // 触发发送（立即或延迟）
        this.batchDelay > 0 ? this.batchSend() : this.send();
    }

    /**
     * 3. 发送逻辑（修复重试重置和队列清空）
     */
    send() {
        // 避免并发发送或队列为空
        if (this.isSending || this.queue.length === 0) {
            return;
        }

        this.isSending = true;
        // 取出队列第一个埋点（FIFO 顺序）
        const sendData = this.queue[0];
        // 重置当前请求的重试次数（关键：每次新请求都从3次开始）
        const currentRetryCount = this.retryCount;

        const sendRequest = (retryLeft) => {
            axios({
                url: this.apiUrl,
                method: 'post',
                data: sendData,
                headers: { 'Content-Type': 'application/json'},
                timeout: 5000,
                // 新增3：强制要求 HTTPS（Axios 层面拦截 HTTP）
                transformRequest: [(data, headers) => {
                    if (!this.isHttpsEnv && process.env.NODE_ENV !== 'development') {
                        throw new Error('禁止 HTTP 传输埋点凭证');
                    }
                    return JSON.stringify(data);
                }]
            })
                .then(response => {
                    this.isSending = false;
                    // 后端返回success，说明请求成功
                    if (response && response.data && response.data.status === 'success') {
                        console.log('埋点发送成功', sendData);
                        // 从队列中移除已成功的埋点
                        this.queue.shift();
                        // 继续发送下一个（若有）
                        this.send();
                    } else {
                        // 后端返回非success，视为失败，重试
                        if (retryLeft > 0) {
                            const delay = 1000 * (currentRetryCount - retryLeft + 1); // 指数退避
                            console.log(`埋点发送失败，剩余重试次数${retryLeft}，${delay}ms后重试`, sendData);
                            setTimeout(() => sendRequest(retryLeft - 1), delay);
                        } else {
                            // 重试耗尽，保存到本地，移除队列
                            console.error('埋点多次发送失败，保存到本地', sendData);
                            this.saveFailedLog(sendData);
                            this.queue.shift();
                            this.send();
                        }
                    }
                })
                .catch(error => {
                    this.isSending = false;
                    // 网络错误，重试
                    if (retryLeft > 0) {
                        const delay = 1000 * (currentRetryCount - retryLeft + 1);
                        setTimeout(() => sendRequest(retryLeft - 1), delay);
                    } else {
                        this.saveFailedLog(sendData);
                        this.queue.shift();
                        this.send();
                    }
                });
        };

        // 发起第一次请求（重试次数从currentRetryCount开始）
        sendRequest(currentRetryCount);
    }

    /**
     * 4. 辅助方法（保持不变，优化细节）
     */
    getPageName() {
        const currentPath = router.currentRoute.path || '';
        const matchedRoute = this.routeMap.find(item => currentPath.startsWith(item.path));
        return matchedRoute ? matchedRoute.name : currentPath;
    }

    batchSend() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.send(), this.batchDelay);
    }

    saveFailedLog(log) {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('failedTrackLogs') || '[]');
            // 本地存储也去重
            const isDuplicate = storedLogs.some(item => this.getTrackUniqueKey(item) === this.getTrackUniqueKey(log));
            if (!isDuplicate) {
                storedLogs.push(log);
                // 限制存储数量（最多50条，避免占用过多空间）
                localStorage.setItem('failedTrackLogs', JSON.stringify(storedLogs.slice(-50)));
            }
        } catch (e) {
            console.error('保存失败埋点到本地失败');
        }
    }

    sendFailedLogs() {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('failedTrackLogs') || '[]');
            if (storedLogs.length === 0) return;

            // 本地埋点去重后加入队列
            const uniqueLogs = storedLogs.filter((log, index) => {
                const key = this.getTrackUniqueKey(log);
                return storedLogs.findIndex(item => this.getTrackUniqueKey(item) === key) === index;
            });

            this.queue = [...uniqueLogs, ...this.queue];
            localStorage.removeItem('failedTrackLogs');
            console.log('加载本地失败埋点，开始重发', uniqueLogs.length);
            this.send();
        } catch (e) {
            console.error('读取本地失败埋点失败');
        }
    }
}

// 单例实例
const tracker = new Tracker();

// 页面加载时重发本地失败埋点（优化：只在首次加载时执行）
if (window.trackerInited !== true) {
    window.trackerInited = true;
    window.addEventListener('load', () => tracker.sendFailedLogs());
}

// 页面卸载时发送最后一个埋点（同步请求，确保成功率）
window.addEventListener('beforeunload', () => {
    if (tracker.queue.length === 0) return;

    try {
        const lastLog = tracker.queue[0];
        const xhr = new XMLHttpRequest();
        xhr.open('POST', tracker.apiUrl, false); // 同步请求
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(lastLog));
        console.log('页面卸载时同步发送埋点成功', lastLog);
    } catch (e) {
        console.error('页面卸载时发送埋点失败');
    }
});

export default tracker;
