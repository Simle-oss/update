<template>
  <div id="app">
    <keep-alive  :include="cachedViews">
    <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cachedViews: [],  // 用来存放需要缓存的路由组件
    }
  },
    watch: {
    $route(to, from) {
      if (to.meta.keepAlive) {
        if (!this.cachedViews.includes(to.name)) {
          this.cachedViews.push(to.name);
        }
      } else {
        const index = this.cachedViews.indexOf(to.name);
        if (index > -1) {
          this.cachedViews.splice(index, 1);
        }
      }
    }
}
}
</script>