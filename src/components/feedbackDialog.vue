<template>
  <el-dialog
    :visible.sync="dialogVisible"
    custom-class="feedback-dialog"
    width="697px"
    :show-close="false"
    center
  >
    <div class="feedback-container">
      <div class="feedback-header">
        <div class="header-content">
          <span class="title">反馈</span>
          <i
            class="el-icon-close close-icon"
            @click="dialogVisible = false"
          ></i>
        </div>
        <div class="divider"></div>
      </div>

      <div class="feedback-content">
        <div class="selection-section">
          <div class="section-title">请选择您觉得回答有哪些不足之处</div>
          <div class="option-grid">
            <el-checkbox-group v-model="reasonOptions">
              <div
                class="option-row"
                v-for="(row, rowIndex) in optionRows"
                :key="rowIndex"
              >
                <el-checkbox-button
                  v-for="(item, index) in row"
                  :key="index"
                  :label="item.label"
                  class="option-item"
                >
                  {{ item.label }}
                </el-checkbox-button>
              </div>
            </el-checkbox-group>
          </div>
        </div>

        <div class="suggestion-section">
          <div class="section-title">其他改进意见</div>
          <el-input
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
            v-model="suggestion"
            class="suggestion-input"
          ></el-input>
        </div>
      </div>

      <div class="feedback-footer">
        <el-button plain class="cancel-btn" @click="dialogVisible = false"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleSubmit"
          class="submit-btn"
          :disabled="!(reasonOptions.length > 0)"
          >提交</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "FeedbackDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      reasonOptions: [],
      suggestion: "",
      isSubmitting: false,
      optionRows: [
        [
          { value: "1", label: "理解错误" },
          { value: "2", label: "内容不全" },
          { value: "3", label: "表达不清" },
        ],
        [
          { value: "4", label: "偏离需求" },
          { value: "5", label: "不够深入" },
          { value: "6", label: "格式不符" },
        ],
      ],
    };
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal;
    },
    dialogVisible(newVal) {
      this.$emit("update:visible", newVal);
      this.reasonOptions = [];
      this.suggestion = "";
    },
  },
  methods: {
    handleSubmit() {
      console.log(this.reasonOptions);
      this.$emit("submit", {
        reason: this.reasonOptions,
        suggestion: this.suggestion,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.feedback-container {
  .feedback-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title {
        color: rgba(20, 27, 52, 1);
        font-family: "PingFang SC";
        font-size: 18px;
        line-height: 27px;
        font-weight: 600;
      }

      .close-icon {
        font-size: 20px;
        color: #000;
        cursor: pointer;
      }
    }

    .divider {
      height: 1.4px;
      background: #efeff0;
      width: 100%;
    }
  }

  .feedback-content {
    margin-bottom: 24px;

    .selection-section {
      margin-bottom: 32px;

      .section-title {
        color: rgba(20, 27, 52, 1);
        font-family: "PingFang SC";
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .option-grid {
        .option-row {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          padding: 0 40px;

          .option-item {
            flex: 1;
            height: 44px;
            width: 168.33px;
            border-radius: 6px;
            background: rgba(245, 246, 255, 1);
            border: 1px solid transparent;

            ::v-deep .el-checkbox-button__inner {
              width: 100%;
              height: 100%;
              border: none;
              border-radius: 6px;
              background: transparent;
              color: rgba(20, 27, 52, 1);
              font-family: "PingFang SC";
              font-size: 16px;
              line-height: 24px;
              font-weight: 500;
            }

            &.is-checked {
              border-color: rgba(96, 60, 255, 1);

              ::v-deep .el-checkbox-button__inner {
                background: rgba(245, 246, 255, 1);
                color: rgba(20, 27, 52, 1);
                box-shadow: none;
              }
            }
          }
        }
      }
    }

    .suggestion-section {
      .section-title {
        color: rgba(20, 27, 52, 1);
        font-family: "PingFang SC";
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .suggestion-input {
        ::v-deep .el-textarea__inner {
          height: 152px;
          border-radius: 20px;
          border: 1px solid rgba(235, 235, 235, 1);
          padding: 16px 20px;
          color: rgba(148, 163, 184, 1);
          font-family: "PingFang SC";
          font-size: 16px;
          line-height: 24px;
          font-weight: 500;

          &::placeholder {
            color: rgba(148, 163, 184, 1);
          }
        }
      }
    }
  }

  .feedback-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 34px;

    .submit-btn {
      width: 120px;
      height: 42px;
      border-radius: 65px;
      font-family: "PingFang SC";
      font-size: 14px;
      line-height: 21px;
      font-weight: 600;
      background-color: #603cff !important;
      border-color: #603cff !important;

      &:disabled {
        opacity: 0.5;
      }
    }

    .cancel-btn {
      width: 120px;
      height: 42px;
      border-radius: 65px;
      border: 1px solid rgba(113, 128, 150, 1);
      color: rgba(113, 128, 150, 1);
      font-family: "PingFang SC";
      font-size: 14px;
      line-height: 21px;
      font-weight: 600;
    }
  }
}
</style>

<style lang="scss">
.feedback-dialog {
  border-radius: 20px;
  overflow: hidden;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 16px 32px 32px 32px;
    background: #ffffff;
  }
}
</style>