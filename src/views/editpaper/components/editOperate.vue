<template>
  <div class="container">
    <div class="btn-box">
      <!-- 使用 v-for 循环生成按钮 -->
      <div v-for="btn in buttons" :key="btn.key" :class="`${btn.key}-btn`">
        <el-tooltip class="item" effect="dark" :content="btn.isReady ? btn.readyText : btn.notReadyText"
          placement="top-start">
          <img :src="btn.isReady ? btn.readyIcon : btn.notReadyIcon" alt="" @click="handleClick(btn.key)">
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isInternet: {
      type: Boolean,
      required: true
    },
    isPPT: {
      type: Boolean,
      required: true
    },
    isDownload: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      isSave: true
    }
  },
  computed: {
    // 使用计算属性来构建按钮的配置数组
    buttons() {
      return [
        {
          key: 'internet',
          readyIcon: require('@/assets/internet.png'), // 或者使用 import
          notReadyIcon: require('@/assets/internet.svg'),
          readyText: '参考网页',
          notReadyText: '参考网页，请等待就绪后查看',
          isReady: this.isInternet
        },
        {
          key: 'ppt',
          readyIcon: require('@/assets/ppt-01.png'),
          notReadyIcon: require('@/assets/ppt-01-not.png'),
          readyText: '生成PPT',
          notReadyText: '生成PPT，请等待全部章节生成完毕后操作',
          isReady: this.isPPT
        },
        {
          key: 'download',
          readyIcon: require('@/assets/download.png'),
          notReadyIcon: require('@/assets/download-not.png'),
          readyText: '下载为Word',
          notReadyText: '下载为Word，请等待全部章节生成完毕后操作',
          isReady: this.isDownload
        },
        {
          key: this.isSave ? 'save' : 'update',
          readyIcon: require('@/assets/save.png'),
          notReadyIcon: require('@/assets/save-not.png'),
          readyText: this.isSave ? '保存到历史记录' : '更新到历史记录',
          notReadyText: this.isSave ? '保存到历史记录，请等待全部章节生成完毕后操作' : '更新到历史记录',
          isReady: this.isDownload
        }
      ];
    }
  },
  methods: {
    // 统一的点击事件处理函数
    handleClick(key) {
      // if (!key.isReady) {
      //   this.$message.warning("当前全部章节内容未加载完成，请稍后再试！")
      //   return
      // }
      const emitMap = {
        save: 'history-save',
        update: 'history-update',
        internet: 'checkWebs',
        ppt: 'translatePPT',
        download: 'downloadFile'
      }
      this.$emit(emitMap[key])
      if (key == 'save') {
        this.isSave = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 样式部分保持不变，因为 scoped 样式对动态生成的类名同样生效 */
.btn-box {
  background-color: #fff;
  padding: 14px 16px;
  box-shadow: 0px 6px 30px 4px rgba(112, 144, 176, 0.18);
  border-radius: 30px;
  width: 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  box-sizing: border-box;
  position: fixed;
  z-index: 1;
  top: 12vh;
  height: 150px;
  transform: translateX(80px);

  >div {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;

    img {
      width: 20px;
      height: 20px;
    }
  }
}

@media (max-width: 1536px) {
  .btn-box {
    width: 48px;
  }
}
</style>