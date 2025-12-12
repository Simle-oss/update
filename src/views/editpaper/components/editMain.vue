<template>
  <div class="tech-scheme-card">
    <div class="card-lacal" :style="{ paddingBottom: isFold ? '0' : '32px' }">
      <div class="card-content">
        <div class="section-header">
          <div class="title-section">
            <span class="title-text">技术方案</span>
            <img src="@/assets/arrow-up-01-sharp.png" alt="" v-if="isFold" @click="isFold = false">
            <img src="@/assets/arrow-up-01-sharp.png" alt="" style="transform: rotate(180deg);" v-else @click="isFold = true">
            <!-- <img
              class="edit-icon"
              src="@/assets/icon_edit.svg"
              alt="编辑"
              style="cursor: pointer;"
              v-if="!editState" @click="editState = true"
            />
            <div class="save-btn" @click="editState = false" v-else>保存</div> -->
          </div>
          <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线" v-if="!isFold"/>
        </div>

        <div class="info-section" v-if="!isFold">
          <div class="section-label">名称</div>
          <div class="section-content" v-safe-html="lineDataArr.lineOne" v-if="!editState"/>
          <el-input type="textarea" v-model="lineDataArr.lineOne" :autosize="{ minRows: 1, maxRows: 6 }" resize="none" v-else></el-input>
        </div>
        <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线" v-if="!isFold"/>

        <div class="info-section" v-if="!isFold">
          <div class="section-label">技术背景</div>
          <div class="section-content multi-line" v-safe-html="lineDataArr.lineTwo" v-if="!editState"/>
          <el-input type="textarea" v-model="lineDataArr.lineTwo" :autosize="{ minRows: 1, maxRows: 6 }" resize="none" v-else></el-input>
        </div>
        <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线"  v-if="!isFold"/>

        <div class="info-section" v-if="!isFold">
          <div class="section-label">
            <div>
              <span>技术手段</span>
              <!-- <span class="required-mark">*</span> -->
            </div>
          </div>
          <div class="section-content" v-safe-html="lineDataArr.lineThree" v-if="!editState"/>
          <el-input type="textarea" v-model="lineDataArr.lineThree" :autosize="{ minRows: 1, maxRows: 6 }" resize="none" v-else></el-input>
        </div>
        <img class="divider" src="@/assets/spilt_line.svg" alt="分隔线"  v-if="!isFold"/>

        <div class="info-section" v-if="!isFold">
          <div class="section-label-row">
            <div class="section-label">技术效果</div>
          </div>
          <div class="section-content" v-safe-html="lineDataArr.lineFour" v-if="!editState"/>
          <el-input type="textarea" v-model="lineDataArr.lineFour" :autosize="{ minRows: 1, maxRows: 6 }" resize="none" v-else></el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    lineDataArr: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      $sanitize: this.$sanitize,
      editState: false,
      isFold: true
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.tech-scheme-card {
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
        img {
          cursor: pointer;
          width: 20px;
          height: 20px;
        }

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
          > div {
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
</style>
