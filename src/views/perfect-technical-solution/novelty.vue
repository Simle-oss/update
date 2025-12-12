<template>
  <div class="novelty">
    <div class="left">
      <el-form
        class="novelty-form"
        :model="formData"
        label-width="0px"
        label-position="top"
        :rules="formRules"
        ref="noveltyForm"
      >
        <el-form-item label="受理局" prop="country">
          <country-tree-select v-model="formData.country" />
        </el-form-item>
        <el-form-item label="法律状态" prop="simple_legal_status">
          <el-checkbox-group v-model="formData.simple_legal_status">
            <el-checkbox
              v-for="item in legalStatusList"
              :key="item.value"
              :label="item.value"
              >{{ item.label }}</el-checkbox
            ><!--  -->
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="公告（公开）日" prop="daterange">
          <el-date-picker
            style="width: 100%;"
            v-model="formData.daterange"
            value-format="yyyy-MM-DD"
            type="daterange"
            range-separator="到"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="技术方案" prop="idea">
          <el-input
            type="textarea"
            v-model="formData.idea"
            placeholder="请输入技术方案"
            :rows="5"
            maxlength="2000"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="技术效果" prop="effect">
          <el-input
            type="textarea"
            v-model="formData.effect"
            placeholder="请输入技术效果"
            :rows="5"
            maxlength="2000"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="improve-btn">
        <el-button
          type="primary"
          size="small"
          class="btn-1"
          @click="(formData.effect = infoString), (formData.idea = ideaString)"
        >
          输入示例
        </el-button>
        <el-button
          type="primary"
          size="small"
          class="btn-2"
          @click="initiateNewSearch"
        >
          开始查新
        </el-button>
      </div>
    </div>
    <div class="right">
      <el-scrollbar v-if="resultShow" style="width: 100%;">
        <collapse-card
          :title="resultOptions.novelty"
          :icon="icons[resultOptions.novelty]"
          :borderColor="colors[resultOptions.novelty]"
          :bgColor="bgColors[resultOptions.novelty]"
          :defaultExpanded="true"
          :cardData="{
            reason: resultOptions.reason,
            suggestions: resultOptions.suggestions,
          }"
          @download-report="handleDownloadReport"
        >
        </collapse-card>
        <br />
        <template v-if="resultOptions.similar_patents">
          <!-- 传入自定义数据 -->
          <patent-info-card
            v-for="item in resultOptions.similar_patents"
            :key="item.pn"
            :patent-data="{
              similarity: item.relevancy,
              name: item.title,
              number: item.pn,
              status: formatStatus(item.legal_status),
              techList: item.similar_features,
              publishDate: formatDate(item.apdt),
              effectContent: item.similar_effects,
              company: item.company,
            }"
            @view-detail="handleDetail"
          />
        </template>
      </el-scrollbar>
      <el-skeleton :rows="6" animated v-if="processing" />
    </div>
    <el-drawer
      title="相似专利"
      :modal="false"
      :visible.sync="drawer"
      size="40%"
      custom-class="my-drawer"
    >
      <div class="container">
        <PatentDetailDrawer :patentOption="patentData" />
      </div>
    </el-drawer>
  </div>
</template>
<script>
import tracker from "@/utils/tracker";
import { noveltyCheckStart, ideaCheckResult } from "@/api/novelty";
import { legalStatusData } from "@/utils/dict";
import CountryTreeSelect from "./components/CountryFlagLayer.vue";
import CollapseCard from "./components/CollapseCard.vue";
import PatentInfoCard from "./components/PatentInfoCard.vue";
import { deepClone as _deepClone } from "@/utils/index";
import { countryData as countryList } from "@/utils/dict";
import PatentDetailDrawer from "./components/PatentDetailDrawer.vue";

const infoString = `实现对网元性能异常的自动识别，提高系统通信稳定性。`;
const ideaString = `一种基于多维KPI数据的系统性能异常检测方法，该方法包括：获取网元的多种关键性能指标KPI对应的原始KPI数据组，每个原始KPI数据组是包含时间维度、网元维度和KPI维度的三维数据；通过对原始KPI数据组中的多个原始KPI数据进行统计分析，将原始KPI数据组转换为目标KPI数据组，目标KPI数据组是包含网元维度和KPI维度的二维数据；计算网元的统计值，与统计值对应的均值之间的距离值，得到网元的距离值集合；针对每个网元的距离值集合，做四分位数异常检测，得到网元的异常距离值的个数；基于网元的距离值集合，统计得到网元的总距离值；基于每个网元对应的异常距离值个数和总距离值，判断网元是否异常。`;

export default {
  components: {
    CountryTreeSelect,
    CollapseCard,
    PatentInfoCard,
    PatentDetailDrawer,
  },
  data() {
    return {
      processing: false, // 是否处于查新处理中
      resultShow: false, // 是否显示查新结果
      icons: {
        具备新颖性: "el-icon-success",
        部分相似: "el-icon-warning",
        缺乏新颖性: "el-icon-error",
      },
      colors: {
        具备新颖性: "rgb(78,181,119)",
        部分相似: "rgb(251,191,36)",
        缺乏新颖性: "rgb(255,72,72)",
      },
      bgColors: {
        具备新颖性: "rgb(229,243,235)",
        部分相似: "rgb(255,244,229)",
        缺乏新颖性: "rgb(249,232,232)",
      },
      infoString,
      ideaString,
      formData: {
        country: countryList.reduce((acc, current) => {
          return acc.concat(current.children.map((child) => child.value));
        }, []), // 检索国家或地区（默认：中国）
        simple_legal_status: [0, 1, 2, 220, 221, 999], // 法律状态  0:失效 1:有效 2:审中 220:PCT指定期满 221:PCT指定期内 999:未确认，可以多选
        idea: "", // 技术方案
        effect: "", //  技术效果
        pbd_from: null, // 公告（公开）日开始日期
        pbd_to: null, // 公告（公开）日结束日期
      },
      daterange: [], // 公告（公开）日范围   需要后面处理成开始日期和结束日期
      legalStatusList: legalStatusData, // 法律状态数据
      formRules: {
        country: [
          { required: false, message: "请选择受理局", trigger: "blur" },
        ],
        simple_legal_status: [
          { required: false, message: "请选择法律状态", trigger: "change" },
        ],
        daterange: [
          {
            required: false,
            message: "请选择公告（公开）日",
            trigger: "change",
          },
        ],
        idea: [{ required: true, message: "请输入技术方案", trigger: "blur" }],
        effect: [
          { required: true, message: "请输入技术效果", trigger: "blur" },
        ],
      },
      timer: null, // 轮询定时器
      resultOptions: {}, // 查新结果参数
      drawer: false,
      patentData: {}, // 抽屉的详情数据
    };
  },
  created() {},
  methods: {
    // 开始查新
    initiateNewSearch() {
      // 表单校验通过
      this.$refs.noveltyForm.validate(async (valid) => {
        if (valid) {
          tracker.track({ functionName: "技术方案查新", status: "processing" }); // 埋点操作
          let [startDate, endDate] = [null, null];
          if (this.formData.daterange) {
            [startDate, endDate] = this.formData.daterange;
          }
          // 需要把日期中的 - 替换成 空字符串
          this.formData.pbd_from = startDate
            ? startDate.replace(/-/g, "")
            : null;
          this.formData.pbd_to = endDate ? endDate.replace(/-/g, "") : null;
          let params = _deepClone(this.formData);
          delete params.daterange; // 删除 daterange 字段，避免传递多余数据
          params.simple_legal_status = params.simple_legal_status.join(","); // 转换为逗号分隔的字符串
          const { runId } = await noveltyCheckStart(params);
          // 拿到runId后，需要调用查询接口，获取查新结果（这里省略）
          this.getNoveltyResult(runId);
        } else {
          // 校验失败
          console.log("表单校验失败");
        }
      });
    },
    // 获取查新结果的逻辑
    async getNoveltyResult(runId) {
      // 清除旧定时器，防止重复轮询
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      try {
        this.processing = true; // 开始查新，显示加载态
        this.resultShow = false; // 隐藏旧结果
        // 递归轮询函数（确保前一次请求完成后再发下一次）
        const poll = async () => {
          try {
            const res = await ideaCheckResult(runId);
            if (res.status === "success") {
              this.timer = null; // 成功后终止轮询
              this.resultOptions = _deepClone(res);
              this.resultShow = true;
              this.processing = false; // 关闭加载态
              tracker.track({
                functionName: "技术方案查新",
                status: "success",
              }); // 埋点操作
              // 处理成功逻辑（如更新UI、关闭加载态）
            } else if (res.status === "failed") {
              this.$message.error(
                `查新失败：${res.error_message || "未知错误"}`
              );
              this.timer = null; // 失败后终止轮询
              tracker.track({ functionName: "技术方案查新", status: "failed" }); // 埋点操作
            } else if (res.status === "processing") {
              console.log("查新处理中...");
              // 继续轮询：前一次请求完成后，间隔5秒再发下一次
              this.timer = setTimeout(poll, 5000);
            }
          } catch (error) {
            // 接口请求失败（网络错误/500等），重试机制保留（避免临时波动）
            // console.warn('轮询请求失败，将重试：', error.message);
            // 失败重试间隔可缩短（如3秒），快速恢复
            this.timer = setTimeout(poll, 3000);
          }
        };
        // 启动第一次轮询（立即执行）
        this.timer = setTimeout(poll, 0);
      } catch (error) {
        // 初始化失败的极端情况
        this.$message.error("轮询启动失败，请重试。");
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
      }
    },
    // 查看详情  打开右侧抽屉
    handleDetail(val) {
      // 根据这个pn  需要获取到完整的数据对象
      let tempPatentData = this.resultOptions.similar_patents.find(
        (item) => item.pn == val
      );
      this.drawer = true;
      this.patentData = _deepClone(tempPatentData);
    },
    // 下载报告
    handleDownloadReport() {
      // 下载this.resultOptions中的report字段为pdf文件，内容是一个base64字符串
      const base64Data = this.resultOptions.report;
      if (base64Data) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${base64Data}`;
        // 查新检索报告_yymmdd_hhmm
        // 文件名需要包含当前日期时间
        const now = new Date();
        const formattedDate = `${now
          .getFullYear()
          .toString()
          .slice(2)}${(now.getMonth() + 1).toString().padStart(2, "0")}${now
          .getDate()
          .toString()
          .padStart(2, "0")}_${now
          .getHours()
          .toString()
          .padStart(2, "0")}${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
        link.download = `查新报告_${formattedDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.$message.success("报告下载成功！");
      } else {
        this.$message.error("报告数据不存在，无法下载。");
      }
    },
    formatStatus(val) {
      return val === null || val === undefined ? "未获取到法律状态" : val;
      // let obj = legalStatusData.find(item => item.value == val)
      // return obj ? obj.label : '未获取到法律状态'
    },
    formatDate(val) {
      return String(val);
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
};
</script>
<style lang="scss" scoped>
.novelty {
  display: flex;
  width: 99%;
  // 头部和padding减去
  // height: calc(100vh - 120px);
  height: 100%;
  justify-content: space-between;

  .left {
    padding: 0 3vw;
    flex: 1;
    box-sizing: border-box;

    .improve-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;

      .btn-1 {
        color: rgb(84, 48, 231);
        background: unset;
        border: rgb(84, 48, 231) 1px solid;
      }

      .btn-2 {
        transform: scale(1.1);
        background: linear-gradient(to bottom, #6872f9, #6c1ed3);
        border: none;
        border-radius: 15px;
      }
    }
  }

  .right {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
  }
}
</style>
<style lang="scss">
.my-drawer {
  header {
    margin-bottom: 0;
  }
}

.novelty-form {
  .el-form-item {
    margin-bottom: 12px;
  }

  .el-form-item__label {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8px;
    // &::before {
    //     content: none !important;
    // }
  }
}

.tree-scroll-container {
  height: 300px;
}
</style>
