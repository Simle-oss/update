// 递归组件，用于渲染导航菜单
<template>
  <fragment v-if="!item.hidden">
    <template v-if="item.type === '2' && item.children">
      <el-submenu v-if="item.children.length > 1" :index="item.id">
        <template slot="title">
          <i :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </template>
        <keep-alive>
          <MenuItem
            v-for="route in item.children"
            :key="route.path"
            :item="route"
          ></MenuItem>
        </keep-alive>
      </el-submenu>

      <!-- <MenuItem
        v-else
        :key="item.children[0].path"
        :item="item.children[0]"
      ></MenuItem> -->
    </template>

    <template v-else>
      <el-menu-item :index="item.path" @click="goRouter(item.path)">
        <!-- <i :class="item.icon"></i> -->
        <img
          class="menu-icon"
          :src="require(`@/assets/menuIcon/${item.icon}.svg`)"
        />
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </fragment>
</template>

<script>
export default {
  name: "MenuItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    goRouter(path) {
      this.$router.push(path);
      // 点击菜单时，更新当前菜单名称到store
    },
  },
};
</script>

<style scoped>
.router-link {
  display: inline-block;
  width: 100%;
  overflow: hidden;
}

.router-link-active {
  text-decoration: none;
}
.collapseItem .el-menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapseItem .menu-icon {
  margin-right: 0;
}
.menu-icon {
  margin-right: 10px;
}
</style>
