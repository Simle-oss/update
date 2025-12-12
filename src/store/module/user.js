import { setToken, removeToken } from "@/utils/auth";
import cache from '@/plugins/cache';
import { login, getUserInfo } from '@/api/login';
import { Message } from "element-ui";
import VueRouter from "vue-router";

const userStore = {
    state: {
        userInfo: {},         // 用户信息
        isAuthenticated: false, // 是否已认证
        token: null,           // 认证令牌
    },
    mutations: {
        SET_USER_INFO(state, userInfo) {
            state.userInfo = userInfo;
            cache.local.setJSON('userInfo', userInfo); // 将用户信息存储到 localStorage
        }
    },
    actions: {
        async userLogin({ commit }, formData) {
            try {
                let res = await login(formData);
                if (res && res.status === 'success') {
                    commit('SET_USER_INFO', res);
                    setToken(res.token); // 保存 token 到 Cookie
                } else {
                    Message.error(res.message || '登录失败');
                }
            } catch (error) {
                return Promise.reject(error.message)
            }

        },
        // 加载用户信息
        async loadUserInfo({ commit }) {
            try {
                // 刷新之后用本地的token去获取用户信息
                let res = await getUserInfo();
                if (res && res.status === 'success') {
                    commit('SET_USER_INFO', res.user);
                    return res.user;
                } else {
                    Message.error(res.message || '获取用户信息失败');
                }
            }
            catch (error) {
                Message.error(error.message || '获取用户信息异常');
                removeToken();
                cache.clear();
                VueRouter.push('/login');
            }
        },
        async logout({ commit }) {
            removeToken();
            cache.clear();
            commit('SET_USER_INFO', {});
        }
    }
}
export default userStore;