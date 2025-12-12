import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import { sanitize } from '@/utils/safeInput';
import "@/router/permissions.js"; // 路由权限
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "@/styles/theme/index.css"; //换肤样式
import "@/styles/index.scss"; //全局公共样式
import Fragment from "vue-fragment"; // 可产生虚拟根节点
// import ElTableEdit from "el-table-edit";
import "@/filters/index"; // 全局过滤器
import "@/directive/index"; // 注册全局指令
import MyElement from "@/components/my-element"; // ElementUI 组件覆盖
import ImageViewer from "@/components/ImageViewer/index"; // 图片预览组件
import eventBus from "./utils/eventBus.js";
Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(Fragment.Plugin);
// Vue.use(ElTableEdit);
Vue.use(MyElement);
Vue.prototype.$ELEMENT = { size: "medium", zIndex: 3000 };
Vue.prototype.$imageViewer = ImageViewer;
Vue.prototype.$bus = eventBus;
Vue.prototype.$sanitize = sanitize;

ElementUI.Input.props.clearable = { type: Boolean, default: true };
ElementUI.Select.props.clearable = { type: Boolean, default: true };
ElementUI.Pagination.props.background = { type: Boolean, default: true };
ElementUI.Pagination.props.layout = {
  type: String,
  default: "total,prev,pager,next",
};
new Vue({
  router,
  store,
  render: function(h) {
    return h(App);
  },
  // beforeCreate(){
  //   Vue.prototype.$bus=this
  // }
}).$mount("#app");
