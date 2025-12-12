<template>
  <div class="technical-scheme-container">
    <!-- 主内容区域 -->
    <el-main class="main-content">
      <div class="top-card">
        <div class="text-display-container">
          <textarea type="textarea" class="text-content no-bg-border" v-model="inputText"
            :placeholder="placeholderText">
          </textarea>
        </div>
        <div class="improve-btn" v-if="!showTechnicalScheme">
          <div class="info" @click="fillMessage">
            输入示例：一种XXX的XXX，通过XXX，包括……
          </div>
          <el-button class="search-button scale-08" type="primary" size="normal" @click="handleImproveClick">
            要素提取
          </el-button>
        </div>
      </div>
      <!-- 技术方案完善加载 -->
      <div class="loading-bar" v-if="planImproveLoading">
        <div class="status-content">
          <div class="status-left">
            <span class="status-title">技术方案完善</span>
            <div class="version-badge">
              <span class="version-text">V{{ versionNo }}</span>
            </div>
          </div>
          <el-skeleton :rows="3" animated />
          <!-- <img :src="getImageUrl('Frame-903@2x.png')" alt="加载中" class="arrow-icon" /> -->
        </div>
      </div>
      <!-- 技术方案完善 -->
      <page5-4 class="middle-content" :schemeData.sync="schemeData" :planExpand.sync="planImproveExpand" ref="page54Ref"
        @searchClick="handleSearchClick" :versionNo="versionNo" v-if="
          showTechnicalScheme &&
          !planImproveLoading &&
          Object.keys(schemeData).length > 0
        "></page5-4>

      <div class="loading-bar" v-if="planCheckLoading">
        <div class="status-content">
          <div class="status-left">
            <span class="status-title">技术方案查新</span>
            <div class="version-badge">
              <span class="version-text">V{{ checkVersion }}</span>
            </div>
          </div>
          <el-skeleton :rows="3" animated />
          <!-- <img :src="getImageUrl('Frame-903@2x.png')" alt="加载中" class="arrow-icon" /> -->
        </div>
      </div>

      <!-- 底部内容区域 -->
      <page5-5 class="bottom-content" v-if="!planCheckLoading && ideaCheckData.similarPatents.length > 0"
        :ideaCheckData="ideaCheckData" @manualEditClick="handleManualEditClick" @autoEditClick="handleAutoEditClick"
        :planExpand.sync="planCheckExpand" @getPatentDetailLink="getPatentDetailLink" :versionNo="checkVersion"
        @handleRouter="handleRouterTo"></page5-5>
    </el-main>
  </div>
</template>

<script>
// 引入埋点工具
import tracker from '@/utils/tracker';
import Page54 from "./components/page5-4.vue";
import Page55 from "./components/page5-5.vue";
import {
  runAppWorkFlow,
  queryRunAppProcess,
  getOauthToken,
  getPdfData,
  ideaCheckStart,
  ideaCheckResult,
} from "@/api/perfect-technical-solution";
const infoString = `在反向散射通信系统中，由于主系统和次系统的符号不同步导致频谱拓展现象，影响通信质量。为此，提出一种基于多维KPI数据的系统性能异常检测方法。 该方法包括：获取网元的多种关键性能指标KPI对应的原始KPI数据组，每个原始KPI数据组是包含时间维度、网元维度和KPI维度的三维数据；通过对原始KPI数据组中的多个原始KPI数据进行统计分析，将原始KPI数据组转换为目标KPI数据组，目标KPI数据组是包含网元维度和KPI维度的二维数据；计算网元的统计值，与统计值对应的均值之间的距离值，得到网元的距离值集合；针对每个网元的距离值集合，做四分位数异常检测，得到网元的异常距离值的个数；基于网元的距离值集合，统计得到网元的总距离值；基于每个网元对应的异常距离值个数和总距离值，判断网元是否异常。该方法可以实现对网元性能异常的自动识别，提高系统通信稳定性。`
export default {
  name: "novelty",
  components: {
    Page54,
    Page55,
  },
  data() {
    return {
      placeholderText: "请输入专利构思，包括技术背景、技术手段（必填）及技术效果，建议200字以上\n先提取，后查新（约2min），查新结果更可靠",
      inputText: "",
      showTechnicalScheme: false, // 显示技术方案完善
      schemeData: {},
      isShowCheckResult: false,
      pollingTimer: null, // 轮询定时器引用
      ideaCheckData: {
        similarPatents: [],
        novelty: "",
        reason: "",
        suggestions: [],
      }, //查新数据
      oauthToken: null,
      versionNo: 1, // 查新/完善版本号
      planImproveLoading: false,
      planCheckLoading: false,
      planImproveExpand: true, //技术方案完善默认展开
      planCheckExpand: true,
      checkVersion: 1, //查新版本
    };
  },
  // 组件内部
  activated() {
    console.log('组件从缓存中激活') // 缓存生效时，路由切换回来会触发
  },
  deactivated() {
    console.log('组件被缓存') // 路由离开时触发，说明缓存生效
  },
  created() {
    console.log('组件创建') // 只有首次加载或刷新时触发，切换路由不触发才对
  },
  methods: {
    fillMessage() {
      this.inputText = infoString;
    },
    // 添加获取专利详情链接的方法
    getPatentDetailLink: async function (patentNumber) {
      window.open('https://home.zhihuiya.com/', '_blank');
      // try {
      //   // 检查是否已有token，如果没有则先获取
      //   if (!this.oauthToken) {
      //     await this.getOauthToken();
      //     if (!this.oauthToken) {
      //       console.error("无法获取OAuth Token");
      //       return null;
      //     }
      //   }
      //   // 使用获取到的token调用getPdfData接口
      //   const params = {
      //     patent_number: patentNumber,
      //     replace_by_related: 0,
      //     apikey: process.env.VUE_APP_API_KEY,
      //     token: this.oauthToken,
      //   };

      //   const res = await getPdfData(params);
      //   if (res.status) {
      //     // 保存链接
      //     const link = res.data[0].pdf.path;
      //     if (link) {
      //       // 成功获取到链接后跳转
      //       window.open(link, "_blank");
      //     } else {
      //       this.$message.error("获取专利详情链接失败");
      //     }
      //   }
      // } catch (err) {
      //   console.error("获取专利详情链接失败");
      // }
      // return null;
    },
    async getOauthToken() {
      const params = {
        grant_type: "client_credentials",
      };

      const res = await getOauthToken(params);
      if (res.status) {
        this.oauthToken = res.data.token;
        return res.data.token;
      }
      return res;
    },

    //工作流
    async runAppWorkFlow(workFlowData) {
      const params = {
        AppKey: workFlowData.AppKey,
        AppID: workFlowData.AppID,
        InputData: workFlowData.input,
        UserID: "1",
      };
      await runAppWorkFlow(params)
        .then((res) => {
          if (res.runId) {
            this.queryRunAppProcess(res.runId, params);
          } else {
          }
        })
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
          this.planImproveLoading = true;
          const res = await queryRunAppProcess(params);
          if (res.status === "success") {
            const output = JSON.parse(res.output);
            const parsedData = JSON.parse(output.output);
            this.showTechnicalScheme = true;
            this.schemeData = {
              name: parsedData["专利标题"],
              background: parsedData["技术背景"],
              method: parsedData["技术手段"],
              effect: parsedData["技术效果"],
            };
            tracker.track({ functionName: '技术方案完善', requestParams: InputData, responseResult: res.output })// 埋点操作
            this.pollingTimerHandle();
            this.planImproveLoading = false;
            this.planImproveExpand = true;
          } else if (res.status === "processing") {
            this.planImproveLoading = true;
            console.log("处理中，继续轮询...");
          } else if (res.status === "failed") {
            this.planImproveLoading = true;
            // 失败时停止轮询并抛出错误
            this.$message.error(res.error_message);
            this.pollingTimerHandle();
          }
        } catch (err) {
          this.planImproveLoading = false;
          console.log(`查询工作流进展出错!`);
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

    async ideaCheckStart() {
      const params = {
        idea: JSON.stringify(this.schemeData),
      };

      try {
        const res = await ideaCheckStart(params);
        if (res.runId) {
          this.ideaCheckResult(res.runId);
        }
      } catch (err) {
        console.log(`查新接口调用出错!`);
      }
    },

    // 工作流运行进展接口（获取返回数据）查新接口
    async ideaCheckResult(runId) {
      // 清除之前可能存在的轮询定时器
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }
      const params = { runId: runId };
      // 定义轮询函数
      const poll = async () => {
        try {
          this.planCheckLoading = true;
          // this.planImproveExpand = false; //暂时隐藏技术方案
          const res = await ideaCheckResult(params);
          if (res.status === "success") {
            this.ideaCheckData.novelty = res.novelty;
            this.ideaCheckData.suggestions = res.suggestions || [];
            this.ideaCheckData.reason = res.reason;
            this.ideaCheckData.similarPatents = res.similar_patents;
            this.planCheckLoading = false;
            this.planCheckExpand = true;
            tracker.track({
              functionName: '技术方案查新',
              requestParams: JSON.stringify(this.schemeData),
              responseResult: JSON.stringify({ novelty: res.novelty, reason: res.reason })
            })
            this.pollingTimerHandle();
          } else if (res.status === "processing") {
            // 处理中时继续轮询（不需要额外操作，定时器会继续触发）
            this.planCheckLoading = true;
            console.log("处理中，继续轮询...");
          } else if (res.status === "failed") {
            this.planCheckLoading = true;
            // 失败时停止轮询并抛出错误
            this.$message.error(res.error_message);
            this.pollingTimerHandle();
          }
        } catch (err) {
          this.planCheckLoading = false;
        }
      };
      // 立即执行一次查询
      poll();
      // 设置五秒轮询
      this.pollingTimer = setInterval(poll, 5000);
    },

    getImageUrl(filename) {
      try {
        return require(`@/assets/page5/${filename}`);
      } catch (error) {
        console.warn(`找不到图片：@/assets/page5/${filename}`);
        return null;
      }
    },
    // 添加一键修改事件处理方法
    async handleAutoEditClick() {
      // 版本号加1
      this.planCheckExpand = false;
      this.versionNo += 1;
      const schemeData = this.schemeData;
      const formData = {
        专利标题: schemeData["name"],
        技术背景: schemeData["background"],
        技术手段: schemeData["method"],
        技术效果: schemeData["effect"],
      };
      const InputData = {
        input: JSON.stringify(formData),
        suggestion: JSON.stringify(this.ideaCheckData.suggestions),
      };
      const workFlowData = {
        input: JSON.stringify(InputData),
        AppKey: process.env.VUE_APP_NOVELTY_APIKEY,
        AppID: process.env.VUE_APP_NOVELTY_APIID,
      };
      this.runAppWorkFlow(workFlowData);
    },

    // 添加手动修改事件处理方法
    handleManualEditClick() {
      this.versionNo += 1;
      this.planImproveExpand = true;
      this.planCheckExpand = false;
      this.$nextTick(() => {
        if (this.$refs.page54Ref) {
          this.$refs.page54Ref.isEdit = true;
        }
      });
    },
    //完善操作
    handleImproveClick() {
      if (this.inputText && this.inputText.trim().length > 0) {
        // 有内容，显示技术方案完善
        this.showTechnicalScheme = true;
        //技术方案完善(工作流入参)
        const workFlowData = {
          input: JSON.stringify({
            input: this.inputText,
          }),
          AppKey: "d356uhqhv7jf375q23kg",
          AppID: "d356uf48rsth1vmnim2g",
        };
        this.runAppWorkFlow(workFlowData);
      } else {
        // 没有内容，显示warning提示
        this.$message.warning("请先在输入框中输入内容");
      }
    },
    handleUpdateData(payload) {
      // 在父组件中更新数据
      this.$set(this.schemeData, payload.key, payload.value);
    },
    // 查新操作
    handleSearchClick(val) {
      this.planImproveExpand = false;
      this.checkVersion = val;
      this.ideaCheckStart();
    },
    // 监听page5-5过来的路由事件，需要存储 当前的技术完善方案
    handleRouterTo() {
      sessionStorage.setItem("formData", JSON.stringify(this.schemeData));
      this.$router.push({
        path: '/disclosure',
        query: {
          from5_5: true
        }
      })
    }
  },
};
</script>

<style lang="scss" scoped>
.technical-scheme-container {
  //   min-height: 100vh;
  background: #f9f9fb;
  display: flex;
  flex-direction: column;

  .header-nav {
    height: 80px !important;
    background: #ffffff;
    border-bottom: 1px solid #efeff0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    flex-shrink: 0;

    .nav-content {
      width: 100%;
      max-width: 1920px;
      margin: 0 auto;

      .nav-title {
        color: #141b34;
        font-family: "PingFang SC";
        font-size: 18px;
        font-weight: 600;
        line-height: 27px;
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    max-width: 1920px;
    margin: 0 auto;
    width: 100%;

    .top-card {
      width: 100%;
      max-width: 914px;
      margin: 0 auto;
      // box-shadow: 0px 8px 20px 4px rgba(112, 144, 176, 0.08);
      border-radius: 20px;
      // border: 1px solid #efeff0;
      //   background: #f8fafc;
    }

    .divider-icon {
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 39px;
        height: 39px;
      }
    }

    .middle-content,
    .bottom-content {
      width: 100%;
      max-width: 914px;
      margin: 0 auto;
    }

    .page-content {
      width: 100%;
      max-width: 914px;
      //   min-height: 751px;
      margin: 0 auto;
      border-radius: 20px;
      padding: 16px 32px 28px;
      background: #ffffff;
      box-sizing: border-box;
    }

    .status-bar {
      width: 100%;
      max-width: 854px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      padding: 16px 32px;

      .status-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .status-left {
          display: flex;
          align-items: center;
          gap: 12px;

          .status-title {
            color: #141b34;
            font-family: "PingFang SC";
            font-size: 18px;
            font-weight: 600;
            line-height: 27px;
            white-space: nowrap;
          }

          .version-badge {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid #603cff;
            display: flex;
            justify-content: center;
            align-items: center;

            .version-text {
              color: #603cff;
              font-family: "PingFang SC";
              font-size: 16px;
              font-weight: 600;
              line-height: 24px;
            }
          }
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
        }
      }
    }

    .loading-bar {
      width: 100%;
      max-width: 854px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      padding: 16px 32px;

      .status-content {
        width: 100%;

        .status-left {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f1f1;

          .status-title {
            color: #141b34;
            font-family: "PingFang SC";
            font-size: 18px;
            font-weight: 600;
            line-height: 27px;
            white-space: nowrap;
          }

          .version-badge {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid #603cff;
            display: flex;
            justify-content: center;
            align-items: center;

            .version-text {
              color: #603cff;
              font-family: "PingFang SC";
              font-size: 16px;
              font-weight: 600;
              line-height: 24px;
            }
          }
        }

        .arrow-icon {
          width: 247px;
          margin-top: 16px;
        }
      }
    }
  }

  .sidebar-left {
    position: fixed;
    top: 80px;
    left: 0;
    width: 320px;
    height: calc(100vh - 80px);
  }

  .sidebar-right {
    position: fixed;
    top: 80px;
    right: 0;
    width: 454px;
    height: calc(100vh - 80px);
  }
}

.text-display-container {
  position: relative;
  //   height: 136px;
  box-shadow: 0px 8px 20px 4px rgba(112, 144, 176, 0.08);
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  column-gap: 10px;
  row-gap: 0px;
  padding: 20px 27px;
  background: #ffffff;
  border: 1px solid rgba(239, 239, 240, 1);

  .text-content {
    flex-shrink: 0;
    width: 860px;
    height: 96px;
    color: rgba(20, 27, 52, 1);
    font-family: "PingFang SC";
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    overflow: auto;
    white-space: pre-line;
    /* 关键：让 placeholder 识别换行符并换行 */
  }
}

.no-bg-border {
  background-color: transparent;
  border: none;
  outline: none; // 移除点击时的外边框
  resize: none; // 禁止调整大小
}

// 修改improve-btn容器的样式，使其与text-display-container右对齐并移除margin
.improve-btn {
  // width: 914px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 27px;
  padding-top: 10px;

  // transform: scale(1);
  .info {
    cursor: pointer;
    color: #4eb3db;
    font-family: "PingFang SC";
    font-size: 14px;
    line-height: 21px;
    font-weight: 400;
  }
}

// 复制page5-4中的search-button完整样式
.search-button {
  flex-shrink: 0;
  width: 164px;
  height: 56px;
  box-shadow: 0px 16px 27px -10px rgba(96, 60, 255, 0.48);
  //   box-shadow: 0px 12px 15px -5px rgba(96, 60, 255, 0.48);
  border-radius: 65px;
  overflow: hidden;
  background: linear-gradient(15deg,
      rgba(74, 37, 225, 1) 0%,
      rgba(123, 90, 255, 1) 93%,
      rgba(123, 90, 255, 1) 100%) !important;
  border: none !important;

  ::v-deep span {
    color: #ffffff;
    font-family: "PingFang SC";
    font-size: 18px;
    line-height: 27px;
    font-weight: 600;
  }

  &.scale-08 {
    transform: scale(0.8);
  }
}

// 响应式适配
@media (max-width: 1680px) {
  .technical-scheme-container {
    .sidebar-left {
      width: 280px;
    }

    .sidebar-right {
      width: 400px;
    }

    .main-content {
      //   margin-left: 280px;
      //   margin-right: 400px;
    }
  }
}

@media (max-width: 1440px) {
  .technical-scheme-container {
    .sidebar-left {
      width: 240px;
    }

    .sidebar-right {
      width: 350px;
    }

    .main-content {
      margin-left: 240px;
      margin-right: 350px;
    }
  }
}

@media (max-width: 1280px) {
  .technical-scheme-container {

    .sidebar-left,
    .sidebar-right {
      display: none;
    }

    .main-content {
      margin-left: 0;
      margin-right: 0;
    }
  }
}
</style>
