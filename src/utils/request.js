
import axios from 'axios';
import router from '@/router';
import { getToken } from './auth';
import { tansParams } from "@/utils/index";
import cache from '@/plugins/cache';
// 创建一个 axios 实例
const service = axios.create({
    baseURL: "",
    timeout: 600000 // 请求超时时间
});

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 请求拦截器
service.interceptors.request.use(
    config => {
        if (getToken()) {
            config.headers["Authorization"] = `Bearer ${getToken()}`; // 让每个请求携带自定义token 请根据实际情况自行修改
        }
        // get请求映射params参数
        if (config.method === "get" && config.params) {
            let url = config.url + "?" + tansParams(config.params);
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }
        return config;
    },
    error => {
        // 发送失败
        console.log(error);
        Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        const dataAxios = response.data;
        return dataAxios;
    },
    error => {
        if (error && error.response) {
            switch (error.response.status) {
                case 400: error.message = '请求错误'; break;
                case 401: error.message = error.response.data.detail;
                    cache.clear(); // 清除缓存
                    router.push('/login');
                    break;
                case 403: error.message = '拒绝访问'; break;
                case 404: error.message = `请求地址出错: ${error.response.config.url}`; break;
                case 408: error.message = '请求超时'; break;
                case 500: error.message = '服务器内部错误'; break;
                case 501: error.message = '服务未实现'; break;
                case 502: error.message = '网关错误'; break;
                case 503: error.message = '服务不可用'; break;
                case 504: error.message = '网关超时'; break;
                case 505: error.message = 'HTTP版本不受支持'; break;
                default: break;
            }
        }
        return Promise.reject(error);
    }
);

export default service;
