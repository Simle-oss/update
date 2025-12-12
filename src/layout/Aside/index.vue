<template>
  <div class="aside" :class="{ collapse: isCollapse }">
    <!-- <div class="sider-logo">
      <router-link to="/">
        <img src="@/assets/logo.png" alt="logo" />
        <h1 v-if="!isCollapse">专利小助手</h1>
      </router-link>
    </div> -->
    <div class="sider-logo">
      <div style="display: flex; align-items: center">
        <img
          src="@/assets/AI Avatar.png"
          alt="logo"
          @click="setCollapse(!isCollapse)"
        />
        <span v-show="!isCollapse">AI+专利助手</span>
      </div>
      <img
        src="@/assets/sidebar-left.png"
        class="sideber-img"
        @click="setCollapse(!isCollapse)"
        v-if="!isCollapse"
      />
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        class="el-menu-vertical"
        unique-opened
        :default-active="activeMenu"
        style="width: 100%"
        :class="{ collapseItem: isCollapse }"
      >
        <!-- <keep-alive> -->
        <MenuItem v-for="(route, index) in menulist" :key="index" :item="route">
        </MenuItem>
      </el-menu>
    </el-scrollbar>

    <div class="horizontal-line"></div>
    <!-- 暂时隐藏历史记录 -->
    <div class="history" v-if="!isCollapse">历史记录</div>
    <div class="history-content" v-if="!isCollapse">
      <div
        class="history-item"
        v-for="item in histroydata"
        :key="item.id"
        @click="histtoryitem(item)"
      >
        <i :class="item.icon"></i>
        <span style="color: #a1a1a1; font-size: 14px;">{{ item.title }}</span>
      </div>
    </div>

    <div class="user-box" v-if="!isCollapse">
      <section style="width: 100%;height: 100%;">
        <img src="@/assets/user.png" alt="" />
        <div class="base-box">
          <div class="name">{{ userInfo.username }}</div>
          <div class="email">{{ userInfo.email }}</div>
        </div>
      </section>
      <el-tooltip placement="top" effect="light">
        <div slot="content">
          <!-- <el-link @click="downloadPDF" icon="el-icon-document" :underline="false">使用手册</el-link> -->
          <el-link
            @click="showPasswordLayer"
            icon="el-icon-unlock"
            :underline="false"
            >修改密码</el-link
          >
          <br />
          <el-link
            @click="handleLogout"
            icon="el-icon-warning-outline"
            :underline="false"
            >退出登录</el-link
          >
        </div>
        <div style="display: inline-block;" class="-icon">
          <i class="el-icon-more"></i>
        </div>
      </el-tooltip>
    </div>
    <UpdatePasswordLayer
      :passwordLayer.sync="passwordLayer"
      @password-updated="handlePasswordUpdated"
    />
  </div>
</template>

<script>
import MenuItem from "./MenuItem";
import { debounce } from "@/utils/index";
import cache from "@/plugins/cache";
// 导入密码修改弹框组件
import UpdatePasswordLayer from "./UpdatePasswordLayer.vue";
// 自适应侧边栏断点，修改时还需要修改对应的css
const minWidth = 1200;
export default {
  components: { MenuItem, UpdatePasswordLayer },
  data() {
    return {
      resizeEnet: debounce(150, false, () => {
        let screenWidth = document.body.clientWidth;
        if (
          this.$store.state.facility.screenWidth >= minWidth &&
          screenWidth < minWidth
        ) {
          // 从大屏切换到小屏
          this.$store.commit("setCollapse", true);
        } else if (
          this.$store.state.facility.screenWidth < minWidth &&
          screenWidth >= minWidth
        ) {
          // 从小屏切换到大屏
          this.$store.commit("setCollapse", false);
        }
        this.$store.commit("setScreenWidth", document.body.clientWidth);
      }),
      userInfo: { name: "User", email: "user@chinatelecom.cn" },
      passwordLayer: false,
    };
  },
  computed: {
    histroydata() {
      return this.$store.state.layout.historyData;
    },
    //控制侧边栏展开收起状态
    isCollapse() {
      return this.$store.state.layout.isCollapse;
    },
    //获取后端路由表
    menulist() {
      return this.$store.state.layout.menuList;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
  },
  created() {
    const user = cache.local.getJSON("userInfo") || {};
    this.$store.dispatch("getHistory", user.user_id || "");
  },
  mounted() {
    if (this.$store.state.facility.screenWidth < minWidth) {
      // 小屏状态下默认收起
      this.$store.commit("setCollapse", true);
    }
    this.userInfo = cache.local.getJSON("userInfo") || {
      username: "User",
      email: "user@chinatelecom.cn",
    };
    window.addEventListener("resize", this.resizeEnet);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeEnet);
  },
  methods: {
    handleLogout() {
      // 添加一个确认对话框，避免误操作
      this.$confirm("确认退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await this.$store.dispatch("logout");
          // 加个延迟，确保状态更新完成
          setTimeout(() => {
            this.$router.push("/login");
          }, 500);
        })
        .catch(() => {
          // 用户取消退出登录
        });
    },
    showPasswordLayer() {
      this.passwordLayer = true;
    },
    handlePasswordUpdated() {
      this.passwordLayer = false;
      setTimeout(() => {
        this.$router.push("/login");
      }, 300);
    },
    // 控制侧边栏导航
    setCollapse(collapse) {
      this.$store.commit("setCollapse", collapse);
    },
    histtoryitem(item) {
      // 跳转到/disclosure 页面并传递historyId参数
      this.$router.push({
        path: "/disclosure",
        query: { historyId: item.id },
      });
      // this.$bus.$emit("historyclick", item);
    },
    // 本地获取使用手册下载
    // downloadPDF() {
    //   try {
    //     // 在Vue2中正确引入静态资源的方式
    //     const pdfUrl = '/documents/AI+专利助手V1.0使用手册.pdf';
    //     const link = document.createElement('a');
    //     link.target = '_blank';
    //     link.href = pdfUrl;
    //     // 设置下载后的文件名
    //     link.download = 'AI+专利助手V1.0使用手册.pdf';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   } catch (error) {
    //     console.error('文件下载失败:', error);
    //     this.$message.warning('下载失败，请检查文件是否存在');
    //   }
    // }
  },
};
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
}

.aside {
  width: 320px;
  min-width: 275px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $menu-bg;
  // transition: width 0.5s;
  border-right: 1px solid #ccc;
  position: sticky;
  left: 0;
  top: 0;
  padding-bottom: 88px;
  box-sizing: border-box;
}

.collapse {
  width: 64px !important;
  min-width: 64px;
}

.retraction {
  width: 64px !important;
  // display: flex;
  // justify-content: center!important;
}

// .retraction a {
//   margin: 0!important;
// }
// .retraction img {
//   margin: 0!important;
// }
.collapseItem ::v-deep .el-menu-item {
  width: auto !important;
  // margin-left: 14px !important;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.collapseItem ::v-deep .el-menu-item span {
  display: none;
}

// 小屏下的样式

.horizontal-line::before {
  content: "";
  /* 插入内容为空 */
  display: block;
  /* 使其成为块级元素 */
  width: 100%;
  /* 横线的宽度 */
  height: 1px;
  /* 横线的高度 */
  background-color: rgba(233, 233, 233, 1);
  /* 横线的颜色 */
  margin: 20px 0;
  /* 上下间距 */
}

.history {
  // margin-left: 26px;
  // margin-bottom: 10px;
  padding: 27.5px 26px;
  padding-bottom: 13.5px;
  color: #718096;
  font-family: PingFang SC;
  font-size: 14px;
  font-weight: 500;
}

.history-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 14px;
}

.history-item {
  width: calc(100% - 28px);
  display: flex;
  align-items: center;
  margin: 0 auto;
  height: 42px;
  cursor: pointer;
  // margin-left: 20px;
  // margin-bottom: 15px;
}

.history-item span {
  flex: 1;
  margin-left: 10px;
  color: #141b34;
  font-family: PingFang SC;
  font-size: 16px;
  font-weight: 500;
}

.aside ::v-deep .el-menu {
  border-right: none;
  background-color: $menu-bg;
}

// .el-menu-vertical {
//   text-align: left;
// }
.el-menu-vertical:not(.el-menu--collapse) {
  width: 210px;
}

.aside ::v-deep .el-scrollbar {
  // flex: 1 1 0%;
  overflow: hidden auto;
}

.aside ::v-deep .scrollbar-wrapper {
  overflow-x: hidden !important;
  margin-bottom: 0 !important;
}

::v-deep .el-scrollbar__bar.is-vertical {
  display: none;
}

.aside ::v-deep .el-menu-item,
.aside ::v-deep .el-submenu__title {
  font-family: PingFang SC;
  font-size: 16px;
  font-weight: 500;
  color: #141b34;
  padding: 14px !important;
  padding-right: 0;
}

.aside ::v-deep .el-menu-item:hover,
.aside ::v-deep .el-menu-item:focus,
.aside ::v-deep .el-submenu__title:hover,
.aside ::v-deep .el-submenu__title:focus {
  font-family: PingFang SC;
  font-size: 16px;
  font-weight: 500;
  color: #141b34;

  background-color: #f5f6ff !important;
}

.aside ::v-deep .el-menu-item.is-active {
  background-color: #f5f6ff !important;
}

/* 底部箭头按钮样式 */
.sider-links {
  text-align: center;
  height: 48px;
  border-top: 1px solid #f0f0f0;
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
}

.sider-links:hover {
  color: $menu-item-active-coloe;

  background-color: #f5f6ff !important;
}

.sider-links i {
  display: inline-block;
  width: 64px;
  line-height: 48px;
  text-align: center;
}

/* logo样式 */
.sider-logo {
  width: 100%;
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  line-height: 32px;
  cursor: pointer;
  transition: all 0s;
  background: $menu-logo-bg;
  margin-top: 28px;
  margin-bottom: 28px;
  padding-left: 14px;
  box-sizing: border-box;
}

.sider-logo span {
  font-family: PingFang SC;
  font-size: 20px;
  color: #141b34;
}

.sider-logo a {
  margin-left: 14px;
  display: flex;
}

.sider-logo img {
  display: block;
  height: 36px;
  // transition: height 0.2s;
  margin-right: 12px;
}

.sideber-img {
  width: 24px;
  height: 24px !important;
  margin-right: 14px;
}

.sider-logo h1 {
  display: block;
  height: 32px;
  margin: 0 0 0 12px;
  color: $menu-font-color;
  font-weight: 600;
  font-size: 18px;
  line-height: 32px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

::v-deep .el-menu-item {
  height: 48px !important;
  padding: 7px 14px;
  color: $dark-menu-font-color;
  display: flex;
  align-items: center;
  width: calc(100% - 14px);
  margin: 0 auto 14px;
  border-radius: 10px;
}

// 黑夜模式
.dark-theme {
  .aside {
    background-color: $dark-menu-bg;
  }

  .aside ::v-deep .el-menu {
    background-color: $dark-menu-bg;
  }

  .aside ::v-deep .el-menu-item,
  .aside ::v-deep .el-submenu__title {
    color: $dark-menu-font-color;
  }

  .aside ::v-deep .el-menu-item:hover,
  .aside ::v-deep .el-menu-item:focus,
  .aside ::v-deep .el-submenu__title:hover,
  .aside ::v-deep .el-submenu__title:focus {
    // background-color: $dark-menu-item-hover;

    font-family: PingFang SC;
    font-size: 16px;
    font-weight: 500;
    color: #141b34;

    background-color: #f5f6ff !important;
  }

  .aside ::v-deep .el-menu-item.is-active {
    // color: $dark-menu-item-active-coloe;
    background-color: #f5f6ff !important;
  }

  .aside ::v-deep .el-menu-item,
  .aside ::v-deep .el-submenu__title {
    font-family: PingFang SC;
    font-size: 16px;
    font-weight: 500;
    color: #141b34;
  }

  .sider-logo {
    background: $dark-menu-logo-bg;
  }

  .sider-logo h1 {
    color: $dark-menu-font-color;
  }
}

.user-box {
  position: absolute;
  height: 48px;
  padding: 0 14px;
  bottom: 40px;
  width: calc(100% - 28px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;

  section {
    display: flex;
    align-items: center;
  }

  .-icon {
    font-size: 21px;
    color: #0000009c;
  }

  img {
    height: 100%;
    border-radius: 100%;
  }

  .base-box {
    margin-left: 16px;

    .name {
      color: #141b34;
      font-family: Arial;
      font-size: 16px;
    }

    .email {
      color: #94a3b8;
      font-family: PlusJakartaSans;
      font-size: 12px;
    }
  }

  .msg-icon {
    font-weight: 500;
    font-size: 25px;
    color: #141b34;
  }
}

/* 当屏幕分辨率小于1536px时应用的样式 */
@media (max-width: 1920px) {
  .aside {
    width: 275px;
  }
}

@media (max-width: 1536px) {
  .aside {
    width: 250px;
  }
}
</style>
