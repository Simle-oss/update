<template>
  <div class="container-box">
    <div class="content">
      <div class="title">请输入文字描述</div>
      <div class="input-container">
        <el-input v-model="imageDesc" type="textarea" maxlength="500" :placeholder="`请输入图片的文字描述
例如：一个在线学习系统：学生可以选课、观看课程视频、提交作业；教师可以上传课程、批改作业；管理员可以管理用户和课程`" rows="5" resize="none"></el-input>
        <div class="bottom-operate">
          <div class="character-count">{{ `${imageDesc.length}/500` }}</div>
          <!-- <div class="upload-btn" @click="handleUploadClick">
            <img src="@/assets/Frame.png" alt="">
          </div> -->
          <div class="send-btn" @click="generateImage">
            <img src="@/assets/Send.png" />
          </div>
          <!-- <div class="upload-tip">上传附件，支持Word、PDF、txt格式</div> -->
        </div>
      </div>
      <!-- 图表类型选择器 -->
      <div class="chart-type-selector">
        <div class="selector-tabs" ref="selectorTabs">
          <div v-for="tab in chartTabs" :key="tab.id" :class="['tab-item', { active: tab.active }]"
            @click="selectTab(tab)">
            <el-tooltip class="item" effect="dark" :content="tab.tip" placement="top-start">
              <img :src="getImageUrl(tab.icon)" class="tab-icon" />
              <span class="tab-text">{{ tab.text }}</span>
            </el-tooltip>
          </div>
        </div>
        <div class="scroll-button left" @click="scrollLeft" v-show="showLeftButton">
          <i class="el-icon-arrow-left arrow-icon"></i>
        </div>
        <div class="scroll-button right" @click="scrollRight" v-show="showRightButton">
          <i class="el-icon-arrow-right arrow-icon"></i>
        </div>
      </div>
      <el-row :gutter="4">
        <el-col :span="12">
          <el-card class="code-editor-section">
            <div class="section-header">
              <div class="title-group">
                <span class="main-title">代码编辑区</span>
                <el-tooltip class="item" effect="dark" :content="reason || '暂无描述信息'" placement="top-start"
                  v-if="diagramType">
                  <span class="sub-title">（{{ diagramType }}）</span>
                </el-tooltip>
              </div>
              <div class="btn-group" v-if="!codeLoading && codeValue">
                <div v-if="!isEdit">
                  <img class="header-icon" :src="require('@/assets/image/frame-941.svg')" @click="isEdit = true"
                    style="margin-right: 20px" />
                  <img class="header-icon" :src="require('@/assets/image/frame-942.svg')" @click="copyText" />
                </div>
                <div class="save-btn" @click="saveCode()" v-else>保存</div>
              </div>
            </div>
            <el-divider></el-divider>
            <div class="code-content" v-if="!codeLoading">
              <div v-if="!isEdit" class="code-text">
                {{ codeValue }}
              </div>
              <el-input v-else type="textarea" :rows="13" placeholder="请输入" v-model="codeValue" @blur="handleBlur">
              </el-input>
            </div>
            <div v-if="codeLoading" class="loading-state">
              <div class="circle-loading"></div>
              <span class="loading-text">生成中</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="code-editor-section">
            <div class="section-header">
              <div class="title-group">
                <span class="main-title">图片渲染区</span>
              </div>
              <img class="header-icon" :src="require('@/assets/image/download.svg')" @click="downloadImage()"
                v-if="!imageLoading && figureUrl" />
            </div>
            <el-divider></el-divider>
            <div class="code-content">
              <div v-if="imageLoading" class="loading-state">
                <div class="circle-loading"></div>
                <span class="loading-text">生成中</span>
              </div>
              <div v-if="!imageLoading && figureUrl" class="loading-state">
                <el-image class="header-icon" :src="figureUrl" :preview-src-list="[figureUrl]">
                </el-image>
                <!-- <img :src="figureUrl" /> -->
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div class="feedback-section" v-if="!codeLoading && codeValue">
        <el-card class="feedback-buttons">
          <img class="feedback-icon like-icon" :src="require('@/assets/image/thumbs-up.svg')" @click="handleThumbsUp"
            v-show="!islike" />
          <img v-show="islike" class="feedback-icon like-icon" :src="require('@/assets/image/thumbs-up-black.svg')" />
          <div class="divider-line"></div>
          <img class="feedback-icon dislike-icon" :src="require('@/assets/image/thumbs-down.svg')"
            @click="feedbackDialogVisible = true" v-show="!isDislike" />
          <img class="feedback-icon like-icon" v-show="isDislike"
            :src="require('@/assets/image/thumbs-down-black.svg')" />
        </el-card>
      </div>
    </div>
    <feedbackDialog :visible.sync="feedbackDialogVisible" @submit="handleThumbsDown" />
  </div>
</template>

<script>
import {
  runAppWorkFlow,
  queryRunAppProcess,
  generateFigure,
} from "@/api/image";
import feedbackDialog from "@/components/feedbackDialog.vue";
import { feedbacks } from "@/api/perfect-technical-solution";
import tracker from "@/utils/tracker";
import cache from '@/plugins/cache';
export default {
  name: "figure",
  components: { feedbackDialog },
  data() {
    return {
      imageDesc: "",
      chartTabs: [
        {
          id: 1,
          text: "AI识别",
          icon: "ai-innovation-02.svg",
          active: true,
          tip: "自动选取最合适的图片类型",
        },
        {
          id: 2,
          text: "流程图",
          icon: "workflow-square-02.svg",
          active: false,
          tip: "适合表示步骤、流程、条件分支",
        },
        {
          id: 3,
          text: "用例图",
          icon: "hierarchy-square-04.svg",
          active: false,
          tip: "适合表示参与者和系统功能的关系",
        },
        {
          id: 4,
          text: "类图",
          icon: "arrange.svg",
          active: false,
          tip: "适合表示类、接口及其关系",
        },
        {
          id: 5,
          text: "状态图",
          icon: "anchor-point.svg",
          active: false,
          tip: "适合表示状态转移",
        },
        {
          id: 6,
          text: "实体关系图",
          icon: "structure-02.svg",
          active: false,
          tip: "适合表示数据库实体及关系",
        },
        {
          id: 7,
          text: "甘特图",
          icon: "filter-mail-square.svg",
          active: false,
          tip: "适合表示任务、排期、进度",
        },
        {
          id: 8,
          text: "旅程图",
          icon: "orthogonal-edge.svg",
          active: false,
          tip: "适合表示用户体验或流程感受",
        },
        {
          id: 9,
          text: "饼图",
          icon: "pie-chart.svg",
          active: false,
          tip: "适合表示比例和占比",
        },
        {
          id: 10,
          text: "Graphviz DOT 图",
          icon: "share-07.svg",
          active: false,
          tip: "适合复杂的关系图和网络拓扑",
        },
        {
          id: 11,
          text: "思维导图",
          icon: "frame.svg",
          active: false,
          tip: "适合表示分层的发散关系",
        },
      ],
      selectedTab: null,
      codeValue: "",
      diagramType: null,
      reason: null,
      oldCodeValue: "",
      isEdit: false,
      imageLoading: false,
      feedbackDialogVisible: false,
      pollingTimer: null, // 轮询定时器引用
      figureUrl: null,
      codeLoading: false,
      imageBase64: null,
      showLeftButton: false,
      showRightButton: false,
      scrollEndTimer: null,
      isDislike: false,
      islike: false,
    };
  },
  computed: {},
  mounted() {
    this.selectedTab = this.chartTabs[0];
    this.$nextTick(() => {
      this.checkScrollButtons();
    });

    // 监听窗口大小变化
    window.addEventListener("resize", this.checkScrollButtons);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkScrollButtons);
  },
  methods: {
    saveCode() {
      this.isEdit = false;
      tracker.track({ functionName: '附图渲染', status: 'processing' })
      this.generateFigure(this.codeValue);
    },
    //点赞
    handleThumbsUp() {
      const data = {
        type: "like",
        reason: "",
        suggestion: "",
      };
      this.feedbacks(data);
    },
    //点踩
    handleThumbsDown(data) {
      data.type = "dislike";
      this.feedbacks(data);
    },

    async feedbacks(data) {
      const params = {
        user_id: cache.local.getJSON('userInfo').user_id || 1,                  // 用户ID（固定为1）
        feature: "附图生成",
        type: data.type,
        reason: data.reason || [],
        suggestion: data.suggestion,
      };
      await feedbacks(params)
        .then((res) => {
          if (res.status === "success") {
            this.$message.success("感谢您的反馈！");
            if (data.type === "like") {
              this.islike = true;
            } else {
              this.isDislike = true;
            }
            this.feedbackDialogVisible = false;
          } else {
            this.$message.error(res.message);
          }
        })
    },
    //工作流
    async runAppWorkFlow(workFlowData) {
      const params = {
        AppKey: workFlowData.AppKey,
        AppID: workFlowData.AppID,
        InputData: workFlowData.input,
        UserID: "1",
      };
      tracker.track({ functionName: '附图代码生成', status: 'processing' })
      let res = await runAppWorkFlow(params)
      if (res.runId) {
        this.queryRunAppProcess(res.runId, params);
      } else {
      }
    },
    // 工作流运行进展接口（获取返回数据）
    async queryRunAppProcess(runId, { AppKey, InputData }) {
      // 清除之前可能存在的轮询定时器
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }
      const params = {
        RunID: runId,
        UserID: "1",
        AppKey: AppKey,
      };
      // 定义轮询函数
      const poll = async () => {
        try {
          this.codeLoading = true;
          this.imageLoading = true;
          const res = await queryRunAppProcess(params);
          if (res.status === "success") {
            tracker.track({ functionName: '附图代码生成', requestParams: InputData, responseResult: res.output, status: 'success' })
            const output = JSON.parse(res.output);
            const parsedData = JSON.parse(output.output);
            this.codeValue = parsedData.code;
            this.diagramType = parsedData.diagram_type;
            this.reason = parsedData.reason;
            this.oldCodeValue = this.codeValue;
            this.generateFigure(parsedData.code, InputData, res.output);
            this.codeLoading = false;
            this.pollingTimerHandle();
          } else if (res.status === "processing") {
            // 处理中时继续轮询（不需要额外操作，定时器会继续触发）
            this.codeLoading = true;
            console.log("处理中，继续轮询...");
          } else if (res.status === "failed") {
            tracker.track({ functionName: '附图代码生成', status: 'failed' })
            // 失败时停止轮询并抛出错误
            this.codeLoading = true;
            this.pollingTimerHandle();
          }
        } catch (err) {
          this.codeLoading = false;
          console.log("查询出错，停止轮询。");
        }
      };
      // 立即执行一次查询
      poll();
      // 设置五秒轮询
      this.pollingTimer = setInterval(poll, 5000);
    },
    pollingTimerHandle() {
      //停止轮询
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    },
    getImageUrl(filename) {
      try {
        return require(`@/assets/image/${filename}`);
      } catch (e) {
        console.warn(`找不到图片：${filename}`);
        return null;
      }
    },
    selectTab(tab) {
      this.chartTabs.forEach((item) => {
        item.active = false;
      });
      tab.active = true;
      this.selectedTab = tab;
    },
    copyText() {
      const textArea = document.createElement("textarea");
      textArea.value = this.codeValue;
      textArea.style.position = "fixed";
      textArea.style.top = 0;
      textArea.style.left = 0;

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          this.$message.success("已复制");
        }
      } catch (err) {
        console.error("复制失败");
      }

      document.body.removeChild(textArea);
    },
    generateImage() {
      if (!this.imageDesc.trim()) {
        return this.$message.warning("请输入图片描述");
      }
      const inputData = {
        input: this.imageDesc,
        type: this.selectedTab.text,
      };
      const workFlowData = {
        input: JSON.stringify(inputData),
        AppKey: process.env.VUE_APP_FIGURE_APIKEY,
        AppID: process.env.VUE_APP_FIGURE_APIID,
      };
      this.runAppWorkFlow(workFlowData);
    },
    async generateFigure(code, requestParams, responseResult) {
      const params = { code };
      try {
        this.imageLoading = true;
        const res = await generateFigure(params);
        tracker.track({ functionName: '附图渲染', requestParams, responseResult, status: 'success' })
        if (res.figure) {
          this.imageBase64 = res.figure;
          this.figureUrl = "data:image/png;base64," + res.figure;
        }
        this.imageLoading = false;
      } catch (err) {
        tracker.track({ functionName: '附图渲染', status: 'failed' })
        this.imageLoading = false;
        console.log(`图片生成失败`);
      }
    },
    handleBlur() {
      if (this.codeValue === "" || this.codeValue === this.oldCodeValue) return;
      this.oldCodeValue = this.codeValue;
    },
    downloadImage() {
      if (!this.imageBase64) return;
      try {
        // 转换为Blob对象
        const blob = this.base64ToBlob(this.imageBase64, `image/png`);
        // 下载图片
        this.saveBlobAsFile(blob, `附图下载.png`);
        this.$message.success("下载成功");
      } catch (error) {
        console.error("图片下载失败");
      } finally {
      }
    },
    // Base64转Blob
    base64ToBlob(base64String, mimeType) {
      const byteCharacters = atob(base64String);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);

        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: mimeType });
    },

    // 保存Blob为文件
    saveBlobAsFile(blob, fileName) {
      // 创建临时URL
      const url = URL.createObjectURL(blob);

      // 创建a标签并触发下载
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // 文件名及扩展名
      document.body.appendChild(link);
      link.click();

      // 清理资源
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // 释放URL对象
    },
    scrollLeft() {
      const container = this.$refs.selectorTabs;
      const { scrollLeft, clientWidth } = container;

      const scrollDistance = clientWidth * 0.8;
      let targetScroll = scrollLeft - scrollDistance;

      // 如果目标位置接近起始位置，则直接滚动到起始位置
      if (targetScroll < 10) {
        targetScroll = 0;
      }

      this.scrollToPosition(container, targetScroll);
    },

    scrollRight() {
      const container = this.$refs.selectorTabs;
      const { scrollLeft, scrollWidth, clientWidth } = container;

      const scrollDistance = clientWidth * 0.8;
      let targetScroll = scrollLeft + scrollDistance;
      const maxScroll = scrollWidth - clientWidth;

      // 如果目标位置接近末尾，则直接滚动到末尾
      if (targetScroll > maxScroll - 10) {
        targetScroll = maxScroll;
      }

      this.scrollToPosition(container, targetScroll);
    },

    scrollToPosition(container, targetScroll) {
      // 清除之前的定时器
      if (this.scrollEndTimer) {
        clearTimeout(this.scrollEndTimer);
      }

      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });

      // 监听滚动结束
      let scrollTimer;
      const onScroll = () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          this.checkScrollButtons();
          container.removeEventListener("scroll", onScroll);
        }, 50);
      };

      container.addEventListener("scroll", onScroll);

      // 最多等待1秒确保检测执行
      this.scrollEndTimer = setTimeout(() => {
        container.removeEventListener("scroll", onScroll);
        this.checkScrollButtons();
      }, 1000);
    },

    checkScrollButtons() {
      const container = this.$refs.selectorTabs;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;

      // 更宽松的边界判断
      this.showLeftButton = scrollLeft > 1;
      this.showRightButton = scrollLeft + clientWidth + 1 < scrollWidth;
    },
  },
};
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  display: none;
  /* 隐藏滚动条 */
}

.content {
  width: 969px;
  height: 100%;
  margin: 0 auto;
  position: relative;
}

.title {
  color: rgba(20, 27, 52, 1);
  font-family: "PingFang SC";
  font-size: 16px;
  font-weight: 600;
}

// .textarea-box {
//   position: relative;
//   margin: 14px 0 16px;
//   ::v-deep .el-textarea {
//     .el-input__count {
//       background-color: rgba(255, 255, 255, 0);
//       left: 25px;
//       right: 0;
//       bottom: 30px;
//     }
//   }
//   ::v-deep .el-textarea__inner {
//     padding: 20px 24px;
//     border-radius: 20px;
//     border-color: rgba(235, 235, 235, 1);
//     font-size: 16px;
//     &::-webkit-scrollbar {
//       display: none; /* 隐藏滚动条 */
//     }
//   }
//   ::v-deep .el-textarea__inner::placeholder {
//     color: rgba(148, 163, 184, 1);
//     font-size: 16px;
//     font-weight: 500;
//   }
//   .submit-button {
//     position: absolute;
//     right: 24px;
//     bottom: 21px;
//     cursor: pointer;
//   }
// }
.chart-type-selector {
  padding: 0px 24px;
  margin-bottom: 24px;
  position: relative;

  .selector-tabs {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 8px;

    .tab-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid #ebebeb;
      background: #ffffff;
      white-space: nowrap;
      cursor: pointer;

      &.active {
        background: #f5f6ff;
        border-color: #603cff;
      }

      .tab-icon {
        width: 20px;
        height: 20px;
      }

      .tab-text {
        color: #141b34;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.scroll-button {
  width: 30px;
  height: 30px;
  background: #ffffff;
  border: 1px solid #ebebeb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: absolute;
  top: 35%;
  transform: translateY(-50%);

  &.left {
    left: -15px;
  }

  &.right {
    right: -15px;
  }

  .arrow-icon {
    font-size: 16px;
    color: #141b34;
  }
}

.code-editor-section,
.image-render-section {
  flex: 1;
  box-shadow: 4px 7px 30px 4px rgba(112, 144, 176, 0.08);
  border-radius: 20px;
  padding: 0;
  background: #ffffff;
  height: 445px;

  ::v-deep .el-card__body {
    display: flex;
    flex-direction: column;
    height: calc(100% - 48px);
    padding: 16px 32px 32px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title-group {
      display: flex;
      align-items: center;
      gap: 16px;

      .main-title {
        color: rgba(96, 60, 255, 1);
        white-space: nowrap;
        font-family: "PingFang SC";
        font-size: 18px;
        line-height: 27px;
        font-weight: 600;
      }

      .sub-title {
        color: rgba(20, 27, 52, 1);
        white-space: nowrap;
        font-family: "PingFang SC";
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;
      }
    }

    .header-icon {
      height: 20px;
      cursor: pointer;
    }

    .download-icon {
      width: 20px;
      height: 20px;
    }
  }

  ::v-deep .el-divider--horizontal {
    margin: 0 0 16px 0;
    background-color: rgba(239, 239, 240, 1);
  }

  .save-btn {
    background: linear-gradient(32deg, #4a25e1 41%, #7b5aff 83%, #7b5aff 86%);
    box-shadow: 0px 21px 27px -10px rgba(96, 60, 255, 0.48);
    width: 60px;
    height: 27px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 27px;
    color: #ffffff;
    font-family: PingFang SC;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .code-content {
    flex: 1;
    overflow: auto;
    height: 100%;

    .code-text {
      color: rgba(20, 27, 52, 1);
      font-family: "PingFang SC";
      font-size: 16px;
      line-height: 24px;
      font-weight: 400;
      margin: 0;
      white-space: pre-wrap;
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: center;
    justify-content: center;

    .loading-icon {
      width: 64px;
      height: 64px;
    }

    /* 圆形旋转loading动画 */
    .circle-loading {
      width: 24px;
      height: 24px;
      /* 边框设置：透明边框+有色边框，形成圆环 */
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: #409eff;
      /* 主题色，可替换成你的项目主色 */
      border-radius: 50%;
      /* 让方形div变成圆形 */
      /* 旋转动画：匀速、无限循环 */
      animation: circleRotate 1s linear infinite;
      /* 给文字留间距 */
      margin-bottom: 8px;
    }

    /* 旋转动画关键帧 */
    @keyframes circleRotate {
      from {
        transform: rotate(0deg);
        /* 初始角度 */
      }

      to {
        transform: rotate(360deg);
        /* 结束角度（一圈） */
      }
    }

    .loading-text {
      color: rgba(148, 163, 184, 1);
      font-family: "PingFang SC";
      font-size: 16px;
      line-height: 24px;
      font-weight: 500;
      text-align: center;
    }

    /* 省略号容器 */
    .loading-text::after {
      content: '';
      animation: dots 6s steps(6, end) infinite;
    }

    /* 动画关键帧：每500ms增加一个点，共6个点 */
    @keyframes dots {
      0% {
        content: '';
      }

      16.67% {
        content: '.';
      }

      /* 1个点 (500ms) */
      33.33% {
        content: '..';
      }

      /* 2个点 (1000ms) */
      50% {
        content: '...';
      }

      /* 3个点 (1500ms) */
      66.67% {
        content: '....';
      }

      /* 4个点 (2000ms) */
      83.33% {
        content: '.....';
      }

      /* 5个点 (2500ms) */
      100% {
        content: '......';
      }

      /* 6个点 (3000ms) */
    }
  }
}

.input-container {
  margin: 16px 0 16px;
  // height: 188px;
  box-shadow: 4px 7px 30px 4px rgba(112, 144, 176, 0.08);
  border-radius: 20px;
  border: 1px solid rgba(235, 235, 235, 1);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  padding: 20px 24px;

  .input-placeholder {
    flex-grow: 1;
    // height: 148px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    div {
      color: rgba(148, 163, 184, 1);
      font-family: "PingFang SC";
      font-size: 16px;
      line-height: 24px;
      font-weight: 500;
    }
  }

  .input-decoration {
    width: 866px;
    height: 40px;
  }

  .bottom-operate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 10px;

    .upload-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #ebebeb;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      cursor: pointer;

      img {
        width: 24px;
        height: 24px;
      }
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: #603cff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        width: 24px;
        height: 24px;
        transform: translateX(-1px);
      }
    }
  }
}

::v-deep .el-textarea__inner {
  border: 0;
  padding: 0;
  font-weight: 800;

  &::-webkit-scrollbar {
    display: none;
    /* 隐藏滚动条 */
  }
}

.character-count {
  color: rgba(148, 163, 184, 1);
  font-family: "PingFang SC";
  font-size: 16px;
  font-weight: 500;
}

.feedback-section {
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: flex-start;

  .feedback-buttons {
    border-radius: 60px;
    padding: 6px 14px;
    background: #ffffff;
    display: flex;
    align-items: center;
    gap: 14px;

    ::v-deep .el-card__body {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 0;
    }

    .feedback-icon {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .divider-line {
      width: 1px;
      height: 16px;
      background: rgba(239, 239, 240, 1);
    }
  }
}

.code-content ::v-deep .el-textarea__inner {
  padding: 12px 16px;
  color: rgba(20, 27, 52, 1);
  font-family: "PingFang SC";
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  border: 1px solid #603cff;
  border-radius: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;


  .loading-icon {
    width: 64px;
    height: 64px;
  }

  .loading-text {
    color: rgba(148, 163, 184, 1);
    font-family: "PingFang SC";
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    text-align: center;
  }
}
</style>
