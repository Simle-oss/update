<template>
  <div class="function-buttons">
    <!-- 使用手册按钮 -->
    <el-button type="text" icon="el-icon-document" @click="openManualPdf" class="manual-btn">
      使用手册
    </el-button>

    <!-- 加入交流群（带二维码悬浮框） -->
    <el-tooltip placement="bottom" effect="light" :enterable="true" :popper-options="{ boundariesElement: 'viewport' }"
      class="no-border">
      <div slot="content" class="qrcode-popup">
        <img src="@/assets/Layout/qrcode.jpg" alt="交流群二维码" class="qrcode-img">
        <p class="qrcode-text">扫码加入交流群</p>
      </div>
      <el-button type="text" icon="el-icon-user" class="group-btn">
        加入交流群
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  methods: {
    // 打开本地PDF文件
    openManualPdf() {
      try {
        const pdfUrl = '/documents/AI+专利助手V1.0使用手册.pdf'
        // 新窗口打开PDF
        const newWindow = window.open(pdfUrl, '_blank')
        if (!newWindow) {
          Message.warning('请允许弹出窗口以查看使用手册')
        }
      } catch (error) {
        Message.error('使用手册打开失败，请联系管理员')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.function-buttons {
  display: flex;
  gap: 10px;
  /* 两个按钮之间的间距 */
  padding-right: 20px;
}

.manual-btn,
.group-btn {
  color: #409EFF;
  /* Element UI主题色 */
  font-size: 14px;
  padding: 5px 10px;
}

/* 二维码弹窗样式 */
.qrcode-popup {
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background: #fff;
}

.qrcode-img {
  width: 160px;
  height: 160px;
  margin-bottom: 10px;
  object-fit: contain;
}

.qrcode-text {
  margin: 0;
  font-size: 14px;
  color: #666;
}
</style>
<style lang="scss">

</style>