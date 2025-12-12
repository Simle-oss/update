<template>
  <keep-alive>
    <Lock v-if="isLock" />

    <el-container v-else>
      <Aside />
      <div v-show="!isCollapse" class="drawer-bg" @click="setCollapse(!isCollapse)"></div>
      <el-container class="right-container">
        <!-- <el-header class="el-header" height="auto">
          <Header />
          <Tabs />
        </el-header> -->
        <!-- <div class="my-header">{{ currentMenuName }}</div> -->
        <section class="header-section">
          <div class="my-header">{{ title }}</div>
          <ManualAndGroupSection />
        </section>
        <el-main class="main">
          <!-- <WaterMark :height="36" :width="100" image="">
           
          </WaterMark> -->
          <keep-alive :include="include">
            <router-view />
          </keep-alive>
        </el-main>

        <!-- <el-backtop target=".main"></el-backtop> -->
      </el-container>
    </el-container>
  </keep-alive>
</template>

<script>
import Aside from "./Aside";
// import Header from "./Header";
// import Tabs from "./Tabs";
import Lock from "./Lock";
// import WaterMark from "@/components/WaterMark";
import ManualAndGroupSection from "./components/ManualAndGroupSection";

export default {
  components: { Aside, Lock, ManualAndGroupSection },
  data() {
    return {
      title: "",
    };
  },
  computed: {
    //控制侧边栏展开收起状态
    isCollapse() {
      return this.$store.state.layout.isCollapse;
    },
    include() {
      return this.$store.getters.include;
    },
    isLock() {
      return this.$store.state.lock.isLock;
    },
    //获取当前选中的菜单名称
    currentMenuName() {
      return this.$store.state.layout.currentMenuName || "";
    },
  },
  methods: {
    // 控制侧边栏导航
    setCollapse(collapse) {
      // 使用带命名空间的调用方式
      this.$store.commit("setCollapse", collapse);
    },
  },
  watch: {
    $route: {
      handler() {
        if (this.$route.meta && this.$route.meta.title) {
          this.title = this.$route.meta.title;
        } else {
          this.title = "";
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  position: relative;

  .el-header {
    padding: 0 !important;
  }

  .el-main {
    padding: 0px;
  }

  .drawer-bg {
    display: none;
  }

  @media screen and (max-width: 1200px) {
    .drawer-bg {
      display: block;
      width: 100%;
      height: 100vh;
      position: absolute;
      top: 0;
      background: #000;
      opacity: 0.3;
      z-index: 1999;
    }
  }
}

.el-main {
  background-color: #f9f9fb;
}

.right-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.my-header {
  border-bottom: 1px solid var(--Color, #efeff0);
  background: #fff;
  color: #141b34;
  font-family: "PingFang SC";
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  padding: 33px 0px 20px 32px;
}

.dark-theme .container .main {
  background-color: $dark-layout-main;
}
</style>
