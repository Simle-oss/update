<template>
  <div class="tech-scheme-card">
    <div class="card-lacal">
      <div class="card-content">
        <div class="section-header">
          <div class="title-section">
            <span class="title-text">技术方案</span>
            <img class="edit-icon" src="@/assets/icon_edit.svg" alt="编辑" style="cursor: pointer;" v-if="!editState"
              @click="editState = true" />
            <!-- <div class="save-btn" @click="editState = false" v-else>保存</div> -->
          </div>
          <!-- <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线" /> -->
        </div>

        <div class="info-section">
          <div class="section-label">名称</div>
          <div class="section-content" v-safe-html="lineOne" v-if="!editState" />
          <el-input type="textarea" v-model="lineOne" :autosize="{ minRows: 1, maxRows: 6 }" resize="none"
            v-else></el-input>
        </div>
        <!-- <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线" /> -->

        <div class="info-section">
          <div class="section-label">技术背景</div>
          <div class="section-content multi-line" v-safe-html="lineTwo" v-if="!editState" />
          <el-input type="textarea" v-model="lineTwo" :autosize="{ minRows: 1, maxRows: 6 }" resize="none"
            v-else></el-input>
        </div>
        <!-- <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线" /> -->

        <div class="info-section">
          <div class="section-label">
            <div>
              <span>技术手段</span>
              <span class="required-mark">*</span>
            </div>
          </div>
          <div class="section-content" v-safe-html="lineThree" v-if="!editState" />
          <el-input type="textarea" v-model="lineThree" :autosize="{ minRows: 1, maxRows: 6 }" resize="none"
            v-else></el-input>
        </div>
        <!-- <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线" /> -->

        <div class="info-section">
          <div class="section-label-row">
            <div class="section-label">技术效果
            </div>
          </div>
          <div class="section-content" v-safe-html="lineFour" v-if="!editState" />
          <el-input type="textarea" v-model="lineFour" :autosize="{ minRows: 1, maxRows: 6 }" resize="none"
            v-else></el-input>
        </div>
      </div>
    </div>
    <div class="generate-button-container">
      <el-link :underline="false" type="primary" @click="handleInputExample">输入示例</el-link>
      <el-button class="generate-button" type="primary" @click="generatePaper">
        <span class="button-text">开始生成</span>
      </el-button>
    </div>
  </div>
</template>

<script>
const lineThreeString = `首先，基于用户输入的法律问题及场景标签（如合同审查、纠纷调解等），结合用户历史交互数据和身份信息（普通用户 / 法律从业者），通过动态场景适配模块分层解析法律要素（主体、行为、后果），生成场景专属的问题特征向量；其次，调用多源法律知识融合模块，将问题特征向量与法条库（权威法律文本）、案例库（司法判决）、实务指南库（律师经验）进行关联检索，通过知识图谱建立法条 - 案例 - 实务的三元关联关系，生成包含基础法条依据、相似案例参照及实务操作要点的候选答案集；最后，利用可解释的答案验证模块对候选答案进行逻辑一致性检查、法律时效性校验及用户场景适配性评估，输出最终答案并同步展示引用的法条条款、案例编号及实务依据，形成 “问题理解 - 知识融合 - 验证输出” 的完整闭环。`
export default {
  data() {
    return {
      $sanitize: this.$sanitize,
      editState: true,
      lineOne: ``,
      lineTwo: ``,
      lineThree: ``,
      lineFour: ``
    }
  },
  activated() {
    // 从page5-5组件生成交底书跳转过来
    const { from5_5 } = this.$route.query
    if (from5_5) {
      // 跳转回显之后 如果点击生成 应该给这条缓存的数据清空掉,避免再次回显 
      let cacheData = sessionStorage.getItem('formData') ? JSON.parse(sessionStorage.getItem('formData')) : {}
      this.lineOne = cacheData.name || ''
      this.lineTwo = cacheData.background || ''
      this.lineThree = cacheData.method || ''
      this.lineFour = cacheData.effect || ''
      this.generatePaper()
    }
  },
  methods: {
    generatePaper() {
      // !this.lineOne || !this.lineTwo || !this.lineThree ||
      if (!this.lineThree) {
        this.$message.error("技术手段不能为空")
      } else {
        this.$emit('handleGenerate', {
          lineOne: this.lineOne,
          lineTwo: this.lineTwo,
          lineThree: this.lineThree,
          lineFour: this.lineFour
        })
      };
    },
    // 点击输入示例
    handleInputExample() {
      // 专利名称：空
      // 背景技术：空
      // 技术手段：“首先，基于用户输入的法律问题及场景标签（如合同审查、纠纷调解等），结合用户历史交互数据和身份信息（普通用户 / 法律从业者），通过动态场景适配模块分层解析法律要素（主体、行为、后果），生成场景专属的问题特征向量；其次，调用多源法律知识融合模块，将问题特征向量与法条库（权威法律文本）、案例库（司法判决）、实务指南库（律师经验）进行关联检索，通过知识图谱建立法条 - 案例 - 实务的三元关联关系，生成包含基础法条依据、相似案例参照及实务操作要点的候选答案集；最后，利用可解释的答案验证模块对候选答案进行逻辑一致性检查、法律时效性校验及用户场景适配性评估，输出最终答案并同步展示引用的法条条款、案例编号及实务依据，形成 “问题理解 - 知识融合 - 验证输出” 的完整闭环。”
      // 技术效果：空
      this.lineThree = lineThreeString
    }
  },
};
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.tech-scheme-card {
  display: flex;
  flex-direction: column;

  .card-lacal {
    position: relative;
    flex-shrink: 0;
    // align-self: stretch;
    width: 914px;
    // height: 659px;
    border-radius: 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    column-gap: 14px;
    row-gap: 0px;
    padding: 16px 32px 32px 32px;
    background: #ffffff;
    box-sizing: border-box;
  }

  .card-content {
    flex-grow: 1;
    width: 850px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    row-gap: 16px;
    column-gap: 16px;

    .section-header {
      flex-shrink: 0;
      align-self: stretch;
      width: 850px;
      height: 43px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      row-gap: 16px;
      column-gap: 16px;

      .title-section {
        flex-shrink: 0;
        align-self: stretch;
        width: 850px;
        height: 27px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        row-gap: 0px;

        .title-text {
          flex-shrink: 0;
          width: 72px;
          height: 27px;
          color: rgba(20, 27, 52, 1);
          white-space: nowrap;
          font-size: 18px;
          line-height: 27px;
          font-weight: 600;
        }

        .edit-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }
      }

      .divider {
        flex-shrink: 0;
        align-self: stretch;
        width: 850px;
        height: 2px;
      }
    }

    .info-section {
      flex-shrink: 0;
      align-self: stretch;
      width: 850px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      row-gap: 12px;
      column-gap: 12px;

      .section-label {
        flex-shrink: 0;
        align-self: stretch;
        width: 850px;
        height: 24px;
        color: rgba(20, 27, 52, 1);
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;

        .required-mark {
          color: rgba(255, 72, 72, 1);
        }
      }

      .section-label-row {
        flex-shrink: 0;
        align-self: stretch;
        width: 850px;
        height: 24px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        column-gap: 12px;
        row-gap: 0px;
      }

      .section-content {
        flex-shrink: 0;
        align-self: stretch;
        width: 850px;
        color: rgba(59, 65, 89, 1);
        font-size: 16px;
        line-height: 24px;
        font-weight: 500;

        &.multi-line {
          >div {
            width: 100%;
          }

          :deep(.transparent-text) {
            color: transparent;
          }
        }
      }
    }

    .divider {
      flex-shrink: 0;
      align-self: stretch;
      width: 850px;
      height: 2px;
    }
  }
}

.paragraph-spacer {
  height: 12px;
}

::v-deep .el-textarea__inner {
  border: 0;
  padding: 12px 16px;
  color: rgba(20, 27, 52, 1);
  font-family: "PingFang SC";
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  border: 1px solid #603CFF;
  border-radius: 14px;
  background-color: #f7f7fa;
}

.save-btn {
  background: linear-gradient(32deg, #4A25E1 41%, #7B5AFF 83%, #7B5AFF 86%);
  box-shadow: 0px 21px 27px -10px rgba(96, 60, 255, 0.48);
  width: 60px;
  height: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 27px;
  color: #FFFFFF;
  font-family: PingFang SC;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.generate-button-container {
  width: 914px;
  flex-shrink: 0;
  // align-self: stretch;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  column-gap: 657px;
  row-gap: 0px;
  position: relative;
  margin: 16px 0px;

  .generate-button {
    flex-shrink: 0;
    transform-origin: right;
    transform: scale(.8);
    width: 160px;
    height: 56px;
    box-shadow: 0px 21px 27px -10px rgba(96, 60, 255, 0.48);
    border-radius: 65px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    row-gap: 0px;
    padding: 0px 64px;
    overflow: hidden;
    background: linear-gradient(15deg,
        rgba(74, 37, 225, 1) 0%,
        rgba(123, 90, 255, 1) 93%,
        rgba(123, 90, 255, 1) 100%);
    border: none;
    cursor: pointer;

    &:hover,
    &:focus {
      background: linear-gradient(15deg,
          rgba(74, 37, 225, 0.9) 0%,
          rgba(123, 90, 255, 0.9) 93%,
          rgba(123, 90, 255, 0.9) 100%);
    }

    .button-text {
      flex-shrink: 0;
      white-space: nowrap;
      color: #ffffff;
      font-size: 18px;
      line-height: 27px;
      font-weight: 600;
    }
  }
}
</style>
