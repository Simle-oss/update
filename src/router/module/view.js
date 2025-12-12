// 系统内置页面，正式使用时也不应该被删除
export default [
    {
    path: "/novelty",
    name: "novelty",
    component: () => import(/* webpackChunkName: "icon" */ "@/views/perfect-technical-solution/novelty.vue"),
    meta:  { keepAlive: true } ,
  },

  {
      path: "/disclosure",
      name: "disclosure",
      component: () => import(/* webpackChunkName: "icon" */ "@/views/editpaper/disclosure.vue"),
      meta:  { keepAlive: true } ,
  },

  {
   path: "/ppt",
   name: "ppt",
   component: () => import(/* webpackChunkName: "icon" */ "@/views/ppt/ppt.vue"),
   meta:  { keepAlive: true } ,
 },
  {
    path: "/figure",
    name: "figure",
    component: () => import(/* webpackChunkName: "icon" */ "@/views/figure/figure.vue"),
    meta:  { keepAlive: true } ,
  },


];
