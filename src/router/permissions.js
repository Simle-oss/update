import Vue from "vue";
import router from "@/router";
import store from "@/store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken, removeToken } from "@/utils/auth"; // 验权
import cache from "@/plugins/cache";

const WhiteList = ["/login", "/bind", "/register", '/oauth']; // no redirect 白名单


const setMenulist = async () => {
  try {
    const data = {
      code: 200,
      message: "成功",
      data: [
        {
          id: "1",
          type: "1",
          path: "/novelty",
          name: 'novelty',
          title: "技术方案查新",
          icon: "task-edit",
          index: 1,
          meta: { keepAlive: true } // 需要缓存
        },
        {
          id: "2",
          type: "1",
          path: "/disclosure",
          name: 'disclosure',
          title: "交底书生成",
          icon: "brochure",
          index: 2,
          meta: { keepAlive: true } // 需要缓存
        },
        {
          id: "3",
          type: "1",
          path: "/ppt",
          name: 'ppt',
          title: "PPT生成",
          icon: "ppt-add",
          index: 3,
          meta: { keepAlive: true } // 需要缓存
        },
        {
          id: "4",
          type: "1",
          path: "/figure",
          name: 'figure',
          title: "附图生成",
          icon: "image-add",
          index: 4,
          meta: { keepAlive: true } // 需要缓存
        },
      ],
    };

    store.commit("setMenuList", data.data || []);
    console.debug("menu list set:", data);
  } catch (error) {
    store.commit("setMenuList", []);
    console.error("菜单设置失败：");
  }
};
// 路由前置守卫：权限验证 + tab缓存刷新 + 侧边栏响应处理
router.beforeEach(async (to, from, next) => {
  const token = getToken();
  if (!token) {
    // 白名单直接放行
    if (WhiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      Message.warning("请先登录！");
      setTimeout(() => {
        next(`/login`);
        removeToken();
        NProgress.done();
        cache.clear();
      }, 500);
    }
  } else {
    NProgress.start();
    // 检查并初始化用户信息
    let user = store.state.user.userInfo;
    if (!user.id) {
      if (cache.local.getJSON('userInfo')) {
        store.commit('SET_USER_INFO', cache.local.getJSON('userInfo'))
      } else {
        await store.dispatch("loadUserInfo");
      }
    }
    // 权限控制逻辑
    if (typeof to.meta.permission === "boolean") {
      if (store.state.layout.menuList.length <= 0) {
        await setMenulist();
      }
      if (!to.meta.permission) {
        // next("/401"); // 可替换为错误页
        NProgress.done();
        return;
      }
    }

    // 小屏时收起侧边栏
    if (store.state.facility.screenWidth < 1200) {
      store.commit("setCollapse", true);
    }

    // query参数变动时刷新页面缓存
    const found = store.state.layout.tabs.find(item => item.path === to.path);
    if (found && found.to !== to.fullPath) {
      store.commit("setRedirectName", to.name);
      Vue.nextTick(() => {
        next();
        store.commit("setRedirectName", "");
        NProgress.done();
      });
    } else {
      next();
      NProgress.done();
    }
  }
});
// 路由后置处理：关闭进度条
router.afterEach(to => {
  if (!to.path.startsWith("/redirect")) {
    NProgress.done();
  }
});
