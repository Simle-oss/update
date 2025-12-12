<template>
  <div class="tech-scheme-card">
    <div class="card-content">
      <div class="content-wrapper">
        <div class="header-section">
          <div class="title-section">
            <div class="main-title">
              <div>技术方案完善</div>
              <div class="version-tag" style="margin-left: 12px">
                <span class="version-text">V{{ versionNo }}</span>
              </div>
            </div>
            <div
              @click="handleEditClick"
              v-if="!isEdit"
              style="display: flex; align-items: center"
            >
              <img
                class="edit-icon"
                v-if="isExpand"
                :src="require('@/assets/page5/pencil-edit-02.svg')"
              />
              <i
                v-if="isExpand"
                class="el-icon-arrow-up expand-icon"
                @click="expandHandle($event)"
              ></i>

              <i
                v-if="!isExpand"
                class="el-icon-arrow-down expand-icon"
                @click="expandHandle($event)"
              ></i>
            </div>
            <el-button
              type="primary"
              class="save-btn"
              @click="handleSaveClick()"
              v-else
              >保存</el-button
            >
          </div>
        </div>
        <!-- 收起内容 -->
        <div v-if="isExpand" style="width: 100%">
          <el-divider class="divider"></el-divider>
          <div class="info-section">
            <div class="section-title">名称</div>
            <div class="section-content name-content" v-if="!isEdit">
              {{ outputData.name }}
            </div>

            <el-input
              type="textarea"
              v-model="outputData.name"
              :autosize="{ minRows: 1, maxRows: 6 }"
              resize="none"
              v-else
            ></el-input>
          </div>
          <el-divider class="divider"></el-divider>

          <div class="info-section">
            <div class="section-title">技术背景</div>
            <div class="section-content background-content" v-if="!isEdit">
              <div>
                <span>
                  {{ outputData.background }}
                </span>
              </div>
            </div>
            <el-input
              type="textarea"
              v-model="outputData.background"
              :autosize="{ minRows: 1, maxRows: 6 }"
              resize="none"
              v-else
            ></el-input>
          </div>
          <el-divider class="divider"></el-divider>

          <div class="info-section">
            <div class="section-title">技术手段</div>
            <div class="section-content method-content" v-if="!isEdit">
              {{ outputData.method }}
            </div>
            <el-input
              type="textarea"
              v-model="outputData.method"
              :autosize="{ minRows: 1, maxRows: 6 }"
              resize="none"
              v-else
            ></el-input>
          </div>
          <el-divider class="divider"></el-divider>

          <div class="info-section">
            <div class="section-header">
              <div class="section-title">技术效果</div>
            </div>
            <div class="section-content effect-content" v-if="!isEdit">
              {{ outputData.effect }}
            </div>
            <el-input
              type="textarea"
              v-model="outputData.effect"
              :autosize="{ minRows: 1, maxRows: 6 }"
              resize="none"
              v-else
            ></el-input>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar" v-if="isExpand">
      <div class="feedback-buttons">
        <img
          class="feedback-icon"
          crossorigin="use-credentials"
          :src="require('@/assets/page5/thumbs-up.svg')"
          @click="handleThumbsUp"
          v-show="!islike"
        />
        <img
          v-show="islike"
          class="feedback-icon"
          :src="require('@/assets/image/thumbs-up-black.svg')"
        />
        <div class="divider-line"></div>
        <img
          class="feedback-icon"
          crossorigin="use-credentials"
          :src="require('@/assets/page5/thumbs-down.svg')"
          @click="feedbackDialogVisible = true"
          v-show="!isDislike"
        />
        <img
          class="feedback-icon"
          v-show="isDislike"
          :src="require('@/assets/image/thumbs-down-black.svg')"
        />
      </div>
      <el-button
        class="search-button"
        type="primary"
        @click="handleSearchClick"
      >
        查新
      </el-button>
    </div>
    <feedbackDialog
      :visible.sync="feedbackDialogVisible"
      @submit="handleThumbsDown"
    />
  </div>
</template>

<script>
import feedbackDialog from "@/components/feedbackDialog.vue";
import { feedbacks } from "@/api/perfect-technical-solution";
import cache from "@/plugins/cache";
export default {
  name: "TechSchemeCard",
  components: { feedbackDialog },
  props: {
    schemeData: {
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
  data() {
    return {
      dialogVisible: false,
      feedbackDialogVisible: false,
      isEdit: false,
      outputData: {},
      isExpand: true,
      isDislike: false,
      islike: false,
    };
  },
  watch: {
    // 监听schemeData的变化
    schemeData: {
      handler(newVal) {
        this.outputData = { ...newVal };
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
  methods: {
    expandHandle(e) {
      // 阻止事件冒泡到父元素
      e.stopPropagation();
      this.isExpand = !this.isExpand;
      // 添加这行代码，通知父组件更新planCheckExpand
      this.$emit("update:planExpand", this.isExpand);
      console.log(this.isEdit);
    },
    handleArrowClick() {},
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
        feature: "技术方案完善",
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
            this.$message.error("反馈提交失败，请稍后重试！");
          }
        })
    },
    handleEditClick() {
      this.isEdit = true;
      // this.$emit("editClick");
    },
    handleSearchClick() {
      this.$emit("searchClick", this.versionNo);
    },
    handleSaveClick() {
      this.$emit("update:schemeData", this.outputData);
      this.isEdit = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/styles/page5-4.scss';
</style>
