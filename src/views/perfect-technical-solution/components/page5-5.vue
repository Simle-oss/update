<template>
  <div class="patent-check-container">
    <el-card class="main-card">
      <div class="card-content">
        <div class="header-section">
          <div class="title-section">
            <span class="main-title">技术方案完善</span>
            <div class="version-tag">
              <span class="version-text">V{{ versionNo }}</span>
            </div>
            <!-- <img
              v-if="!isExpand"
              :src="require('@/assets/page5/arrow-up-01-sharp.svg')"
              alt="箭头图标"
              class="expand-icon"
              @click="isExpand = true"
            /> -->
            <i v-if="isExpand" class="el-icon-arrow-up expand-icon" @click="expandHandle($event)"></i>

            <i v-if="!isExpand" class="el-icon-arrow-down expand-icon" @click="expandHandle($event)"></i>
          </div>

          <!-- <img
            :src="require('@/assets/page5/vector-45.svg')"
            class="divider-line"
          /> -->
        </div>
        <div v-if="isExpand">
          <!-- <el-divider class="divider"></el-divider> -->
          <div class="conclusion-section">
            <h3 class="section-title">查新结论</h3>
            <div class="conclusion-status" v-if="isPass">
              <img :src="require('@/assets/page5/checkmark-circle-02.svg')" class="status-icon" />
              <span class="status-text">{{ outputData.novelty }}</span>
            </div>
            <div class="conclusion-status" v-if="!isPass">
              <img :src="noveltyStatus.icon" class="status-icon" />
              <span class="status-text" :style="{ color: noveltyStatus.color }">{{
                outputData.novelty
              }}</span>
            </div>
            <!-- <div class="conclusion-status" v-if="!isPass">
              <img :src="require('@/assets/page5/checkmark-circle-orange-02.svg')" class="status-icon" />
              <span class="status-text" style="color: #FF8C00">{{
                outputData.novelty
              }}</span>
            </div> -->
            <p class="conclusion-detail">
              {{ outputData.reason }}
            </p>
          </div>

          <img :src="require('@/assets/page5/vector-48.svg')" class="section-divider" />

          <div class="suggestion-section">
            <h3 class="section-title">修改意见</h3>
            <p class="suggestion-subtitle">针对技术方案的修改建议:</p>
            <div class="suggestion-content" v-for="(item, index) in suggestionContent" :key="index">
              <p>{{ index + 1 }}. {{ item }}</p>
            </div>
            <div class="btn-group" v-if="!isPass">
              <el-button class="custom-button" type="primary" @click="handleClickEdit">
                一键修改
              </el-button>
              <el-button class="custom-button" type="primary" @click="handleClickManual">
                手动修改
              </el-button>
            </div>
          </div>

          <img :src="require('@/assets/page5/vector-49.svg')" class="section-divider" />

          <div class="similar-patents-section">
            <h3 class="section-title">相似专利 Top5</h3>
            <el-table :data="outputData.similarPatents" class="patent-table">
              <el-table-column prop="title" label="专利名称" min-width="250px"></el-table-column>
              <el-table-column prop="pn" label="公开号" min-width="120px"></el-table-column>
              <el-table-column prop="apdt" label="申请日" min-width="80px"></el-table-column>
              <el-table-column prop="similarity" label="相似度" min-width="80">
                <template #default="{ row }">
                  <el-tag :type="getSimilarityTagType(row.relevancy)" size="small" class="similarity-tag">
                    {{ row.relevancy }}%
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="80">
                <template #default="{ row }">
                  <span class="view-details" @click="handleViewDetail(row.pn)" style="cursor: pointer">查看详情</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-card>

    <div class="action-buttons" v-if="isExpand">
      <div class="feedback-buttons">
        <img class="feedback-icon" crossorigin="use-credentials" :src="require('@/assets/page5/thumbs-up.svg')"
          @click="handleThumbsUp" v-show="!islike" />
        <img v-show="islike" class="feedback-icon" :src="require('@/assets/image/thumbs-up-black.svg')" />
        <div class="divider-line"></div>
        <img class="feedback-icon" crossorigin="use-credentials" :src="require('@/assets/page5/thumbs-down.svg')"
          @click="feedbackDialogVisible = true" v-show="!isDislike" />
        <img class="feedback-icon" v-show="isDislike" :src="require('@/assets/image/thumbs-down-black.svg')" />
      </div>
      <!-- v-if="isPass" -->
      <el-button type="primary" class="generate-btn" @click="handleGeneratePaper">生成交底书</el-button>
    </div>
    <feedbackDialog :visible.sync="feedbackDialogVisible" @submit="handleThumbsDown" />

    <!-- 右侧抽屉查看详情面板 -->
    <el-drawer title="相似专利" :modal="false" :visible.sync="drawer">
      <div class="container">
        <h3 class="public_num title">公开号： <span>{{ current_patent.pn }}</span> </h3>
        <h3 class="title">标题：<span>{{ current_patent.title }}</span></h3>
        <h3 class="apply_date title">申请日：<span>{{ current_patent.apdt }}</span></h3>
        <h3 class="similar title">相似度：<span>{{ current_patent.relevancy + '%' }}</span></h3>
        <!-- <h3 class="title">相似特征：</h3>
        <ul class="pl2vw">
          <li v-for="text in current_patent.similar_patent_features">{{ text }}</li>
        </ul> -->
        <h3 class="title">核心对比：</h3>
        <ul class="pl1vw">【相似特征】
          <li class="pl2vw" v-for="(text, idx) in current_patent.comparison.overlap">{{ idx + 1 + '、' + text }}</li>
        </ul>
        <ul class="pl1vw">【区别特征】
          <li class="pl2vw" v-for="(text, idx) in current_patent.comparison.differences">{{ idx + 1 + '、' + text }}</li>
        </ul>
        <h3 class="title">权利要求：</h3>
        <pre class="claims" v-safe-html="current_patent.claims"></pre>
        <br>
        <el-link class="mb15" :underline="false" type="primary" @click="handleSeePDFDetail">查看PDF全文</el-link>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import feedbackDialog from "@/components/feedbackDialog.vue";
import { feedbacks } from "@/api/perfect-technical-solution";
import cache from "@/plugins/cache";
export default {
  name: "PatentCheckReport",
  components: { feedbackDialog },
  props: {
    ideaCheckData: {
      type: Object,
      required: true,
    },
    versionNo: {
      type: Number,
      default: 1,
    },
    planExpand: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    ideaCheckData: {
      handler(newVal) {
        const data = newVal;
        this.outputData = { ...newVal };
        this.suggestionContent = data.suggestions || [];
        if (data.novelty === "具备新颖性") {
          this.isPass = true;
        }
        if (data.novelty === "缺乏新颖性" || data.novelty === "部分相似") {
          this.isPass = false;
        }
      },
      immediate: true,
      deep: true,
    },
    planExpand: {
      handler(newVal) {
        this.isExpand = newVal;
      },
      immediate: true,
      deep: true,
    },
  },

  data() {
    return {
      drawer: false, // 查新之后 -> 详情的抽屉框
      current_patent: { comparison: { overlap: [], differences: [] }, }, // 抽屉详情的数据对象
      patentNumber: null, // 专利公开号
      patentData: [
        {
          name: "系统采用分层架构，由五大模块协同实现毫秒级响应...",
          number: "CN386805798227",
          date: "2021-10-27",
          similarity: "90%",
          similarityValue: 90,
        },
        {
          name: "系统采用分层架构，由五大模块协同实现毫秒级响应...",
          number: "CN386805798227",
          date: "2021-10-27",
          similarity: "90%",
          similarityValue: 90,
        },
        {
          name: "系统采用分层架构，由五大模块协同实现毫秒级响应...",
          number: "CN386805798227",
          date: "2021-10-27",
          similarity: "34%",
          similarityValue: 34,
        },
      ],
      outputData: {},
      feedbackDialogVisible: false,
      suggestionContent: [],
      isPass: false,
      isExpand: true,
      isDislike: false,
      islike: false,
    };
  },
  computed: {
    noveltyStatus() {
      const novelty = this.outputData.novelty;
      return {
        isPartial: novelty === '部分相似',
        icon: novelty === '部分相似'
          ? require('@/assets/page5/similar.png')
          : require('@/assets/page5/checkmark-circle-orange-02.svg'),
        color: novelty === '部分相似' ? '#603CFF' : '#FF8C00'
      };
    }
  },
  methods: {
    expandHandle(e) {
      // 阻止事件冒泡到父元素
      e.stopPropagation();
      this.isExpand = !this.isExpand;
      // 通知父组件更新planCheckExpand
      this.$emit("update:planExpand", this.isExpand);
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
        feature: "技术方案查新",
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
    // 点击查新之后 结果的获取详情
    async handleViewDetail(patentNumber) {
      this.patentNumber = patentNumber
      this.current_patent = this.ideaCheckData.similarPatents.find(item => item.pn === patentNumber);
      // 需要查询详情的接口
      // 获取到内容之后再把抽屉打开展示内容
      this.drawer = true;
    },
    // 查看pdf详情，可能会下载
    handleSeePDFDetail() {
      try {
        this.$emit("getPatentDetailLink", this.patentNumber);
      } catch (error) {
        this.$message.error("获取专利详情链接失败");
      }
    },
    // 生成交底书按钮点击事件
    handleGeneratePaper() {
      // 此处传递不了特别大的对象，可以添加一个标识，新页面获取标识读取sessionStorage 没有标识就置空
      // this.$router.push({
      //   path: "/disclosure",
      //   query: {}
      // });
      this.$emit("handleRouter")
    },
    getSimilarityTagType(value) {
      if (parseInt(value) >= 75) return "danger";
      if (parseInt(value) >= 50) return "primary";
      return "success";
    },
    // 手动修改
    handleClickManual() {
      this.$emit("manualEditClick");
    },
    // 一键修改
    handleClickEdit() {
      this.$emit("autoEditClick");
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/styles/page5-5.scss';
</style>
