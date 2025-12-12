<template>
  <div class="main-content">
    <!-- 输入区域 -->
    <div class="input-section">
      <!-- 上传提示 -->
      <div class="input-right">
        <div class="section-header">请输入专利交底书</div>
        <div class="input-container">
          <el-input v-model="textInput" style="width: 100%; height: 100%" type="textarea"
            placeholder="请输入完整的交底书内容，也可从文件中读取" rows="5" resize="none"></el-input>
          <div class="bottom-operate">
            <el-tooltip class="item" effect="dark" content="读取文件内容，支持 .docx .pdf .txt 格式" placement="top-start">
              <div class="upload-btn" @click="handleUploadClick">
                <img src="@/assets/Frame.png" alt="" />
              </div>
            </el-tooltip>
            <!-- <div class="upload-btn" @click="handleUploadClick">
              <img src="@/assets/Frame.png" alt="">
            </div> -->
            <div class="send-btn" @click="tempMove(1)">
              <img src="@/assets/Send.png" />
            </div>
            <!-- <div class="upload-tip">上传附件，支持Word、PDF、txt格式</div> -->
          </div>
        </div>
        <!-- 隐藏的文件输入框 -->
        <input ref="fileInput" type="file" style="display: none" @change="handleFileChange"
          accept=".doc,.docx,.pdf,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain" />
      </div>
      <!-- <el-tooltip class="item" effect="dark" content="上传附件，支持Word、PDF、txt格式" placement="top-start">
        <div class="upload-icon">
          <img src="@/assets/Frame.png" alt="">
        </div>
      </el-tooltip> -->
    </div>

    <!-- 模板选择 -->
    <div class="template-section">
      <div class="template-container">
        <div class="section-header">PPT模版选择</div>
        <div class="template-preview-area">
          <div class="template-selection">
            <div v-for="(template, index) in templates" :key="index" class="template-item">
              <!-- <div
                class="template-preview"
                :style="{ backgroundColor: template.color }"
              ></div> -->
              <img class="feedback-icon" :src="require('@/assets/ppt-model1.png')" style="width: 186px" />
              <div class="template-name">
                <!-- <el-radio v-model="radio" label="1"></el-radio>
                  -->
                <span>{{ template.name }}</span>
              </div>
            </div>
            <!-- <div class="more-templates">
              <div class="img-box">
                <img src="@/assets/group.png" alt="" />
              </div>
              <div class="more-text">更多</div>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- PPT大纲 -->
    <div class="outline-section" v-if="stepState >= 1">
      <img src="@/assets/Frame 44.svg" alt="" class="star-img" />
      <div class="outline-container">
        <div class="outline-header">
          <div class="outline-title">PPT大纲</div>
          <div class="img-box" v-if="!pptOutlineLoading">
            <img src="@/assets/pencil-edit-02.png" class="edit-icon" @click="editState = true" v-if="!editState" />
            <img src="@/assets/copy-01.png" @click="copyFn" v-if="!editState" />
            <div class="save-btn" @click="editState = false" v-else>保存</div>
          </div>
        </div>
        <!-- 加载中的骨架屏动态效果 -->
        <div class="outline-content" v-if="pptOutlineLoading">
          <div>
            <el-skeleton :rows="3" animated />
            <!-- <img :src="require(`@/assets/loading1.png`)" alt="加载中" /> -->
          </div>
        </div>
        <div class="outline-content" v-if="!pptOutlineLoading">
          <!-- 动态生成outline-item -->
          <div v-for="(item, index) in outlineItems" :key="index" class="outline-item">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-content" v-safe-html="item.content" v-if="!editState" />
            <el-input type="textarea" v-model="outlineItems[index].content" :autosize="{ minRows: 1, maxRows: 6 }"
              resize="none" v-else></el-input>
          </div>
        </div>
      </div>

      <div class="action-buttons" v-if="!pptOutlineLoading">
        <div class="feedback-buttons">
          <img src="@/assets/thumbs-up.svg" class="feedback-icon" @click="handleThumbsUp" v-show="!islike" />
          <img v-show="islike" class="feedback-icon" :src="require('@/assets/image/thumbs-up-black.svg')" />
          <div class="divider-line"></div>
          <img src="@/assets/thumbs-down.svg" class="feedback-icon" @click="feedbackDialogVisible = true"
            v-show="!isDislike" />
          <img v-show="isDislike" class="feedback-icon" :src="require('@/assets/image/thumbs-down-black.svg')" />
        </div>
        <div class="generate-button" @click="tempMove(2)">
          <span class="button-text">生成PPT并下载</span>
        </div>
      </div>
    </div>

    <!-- PPT预览 -->
    <!-- <div class="preview-section" v-if="stepState >= 2">
      <div class="preview-container" v-if="!pptLoading">
        <div
          class="preview-header"
          @click="downloadPPT()"
          style="cursor: pointer"
        >
          <img src="@/assets/download.png" class="preview-action" />
        </div>
        <div class="preview-content">
          <div class="preview-background"></div>
          <div class="vertical-divider"></div>
          <div class="slide-thumbnails">
            <div class="thumbnail" v-for="n in 4" :key="n"></div>
          </div>
          <div class="main-slide"></div>
        </div>
      </div>
      <div class="preview-container" v-if="pptLoading">
        <img :src="require(`@/assets/loading1.png`)" alt="加载中" />
      </div>
    </div> -->
    <feedbackDialog :visible.sync="feedbackDialogVisible" @submit="handleThumbsDown" />
  </div>
</template>

<script>
import { feedbacks } from "@/api/perfect-technical-solution";
import feedbackDialog from "@/components/feedbackDialog.vue";
import {
  runAppWorkFlow,
  queryRunAppProcess,
  extractText,
  generatePPT,
} from "@/api/ppt";
import tracker from "@/utils/tracker";
import cache from "@/plugins/cache";
export default {
  name: 'ppt',
  components: { feedbackDialog },
  data() {
    return {
      $sanitize: this.$sanitize,
      templates: [
        { name: "电信研究院-专利交底书", color: "#d8d8ff" },
        // { name: "模版二", color: "#d8d8ff" },
        // { name: "模版三", color: "#d8d8ff" },
        // { name: "模版四", color: "#d8d8ff" },
      ],
      fileList: [],
      stepState: 0,
      textInput: "",
      editState: false,
      feedbackDialogVisible: false,
      pollingTimer: null,
      blobData: null,
      outlineItems: [], // 添加一个新数组来存储parseData的键值对列表
      pptOutlineLoading: false,
      pptLoading: false,
      radio: "1",
      isDislike: false,
      islike: false,
    };
  },
  activated() {
    if (this.$route.query.getState) {
      this.textInput = this.$store.state.paperToPPTData;
      // 清除路由查询参数中的 getState 标志
      this.$router.replace({
        query: {
          ...this.$route.query,
          getState: undefined,
        },
      });
      this.tempMove(1);
    }
  },
  methods: {
    downloadPPT() {
      this.downloadBlob(this.blobData, "专利ppt.pptx");
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
        feature: "PPT大纲生成",
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
            this.$message.error("反馈提交失败，请稍后重试");
          }
        })
    },
    handleUploadClick() {
      // 触发文件选择
      this.$refs.fileInput.click();
    },
    async handleFileChange(event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        // 验证文件类型
        const allowedTypes = [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/pdf",
          "text/plain",
        ];
        const file = files[0];

        if (allowedTypes.includes(file.type)) {
          // 文件类型有效，添加到文件列表
          this.fileList.push(file);
          const formData = new FormData();
          formData.append("file", file);
          await extractText(formData)
            .then((res) => {
              if (res.status === "success") {
                this.textInput = res.text;
              } else {
                const isProduction = process.env.NODE_ENV === 'production';
                if (isProduction) {
                  console.error("失败"); // 捕获并打印请求错误
                } else {
                  console.error('请求错误详情：');
                }
              }
            })
        } else {
          this.$message.error("不支持的文件类型，请上传Word、PDF或txt格式文件");
        }

        // 清空input值以便下次选择相同文件时仍能触发change事件
        event.target.value = "";
      }
    },
    tempMove(state) {
      if (this.stepState < state) {
        if (state == 1 && !this.textInput) {
          this.$message.warning("请先请输入专利交底书");
        } else {
          this.stepState = state;
        }
        if (state === 1) {
          const inputData = {
            input: this.textInput,
          };
          const workFlowData = {
            input: JSON.stringify(inputData),
            AppKey: process.env.VUE_APP_PPT_APIKEY,
            AppID: process.env.VUE_APP_PPT_APIID,
          };
          this.runAppWorkFlow(workFlowData);
        }
        if (state === 2) {
          this.generatePPT();
        }
      }
    },
    async generatePPT() {
      tracker.track({ functionName: 'PPT生成', status: 'processing' })
      // 准备PPT数据
      const pptData = {};
      if (this.outlineItems.length > 0) {
        // 如果有动态生成的内容，则使用这些内容
        this.outlineItems.forEach((item) => {
          pptData[item.title] = item.content;
        });
      }
      const params = { data: JSON.stringify(pptData) };
      this.pptLoading = true;
      await generatePPT(JSON.stringify(params))
        .then((res) => {
          tracker.track({ functionName: 'PPT生成', status: 'success' })
          if (res.ppt_base64) {
            // 3. 将Base64转换为Blob对象
            const blob = this.base64ToBlob(
              res.ppt_base64,
              "application/vnd.ms-powerpoint"
            );
            // this.blobData = blob;
            // 创建日期格式化函数
            const formatDate = (date) => {
              const year = date.getFullYear().toString().slice(-2); // 取年份后两位
              const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份补零
              const day = date.getDate().toString().padStart(2, "0"); // 日期补零
              const hours = date.getHours().toString().padStart(2, "0"); // 小时补零
              const minutes = date.getMinutes().toString().padStart(2, "0"); // 分钟补零
              return `${year}${month}${day}_${hours}${minutes}`;
            };
            const pptName = `${this.outlineItems[0].content}_${formatDate(
              new Date()
            )}.pptx`;
            this.downloadBlob(blob, pptName);
            this.pptLoading = false;
          } else {
            tracker.track({ functionName: 'PPT生成', status: 'failed' })
            this.$message.error(res.message);
          }
        })
    },

    // 将Base64字符串转换为Blob对象
    base64ToBlob(base64String, mimeType) {
      const byteCharacters = atob(base64String);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: mimeType });
    },

    // 下载Blob对象
    downloadBlob(blob, fileName) {
      // 创建URL对象
      const url = URL.createObjectURL(blob);

      // 创建a标签
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // 设置文件名

      // 触发点击事件
      document.body.appendChild(a);
      a.click();

      // 清理
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // 释放URL对象
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
          this.pptOutlineLoading = true;
          const res = await queryRunAppProcess(params);
          if (res.status === "success") {
            tracker.track({ functionName: 'PPT大纲生成', requestParams: InputData, responseResult: res.output })
            this.pptOutlineLoading = false;
            const output = JSON.parse(res.output);
            const parseData = JSON.parse(output.output);
            // 将parseData转换为键值对列表并保存
            this.outlineItems = Object.entries(parseData).map(
              ([key, value]) => ({
                title: key,
                content: value,
              })
            );
            console.log(this.outlineItems, "outlineItems");
            this.pollingTimerHandle();
          } else if (res.status === "processing") {
            // 处理中时继续轮询（不需要额外操作，定时器会继续触发）
            console.log("处理中，继续轮询...");
            this.pptOutlineLoading = true;
          } else if (res.status === "failed") {
            // 失败时停止轮询并抛出错误
            this.pptOutlineLoading = true;
            this.pollingTimerHandle();
          }
        } catch (err) {
          this.pptOutlineLoading = false;
          this.pollingTimerHandle();
          console.log('请求错误!');
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
        return require(`@/assets/${filename}`);
      } catch (e) {
        console.warn(`找不到图片：${filename}`);
        return null;
      }
    },
    async copyFn() {
      if (this.outlineItems.length > 0) {
        // 如果有动态生成的内容，则复制这些内容
        const content = this.outlineItems
          .map((item) => {
            return `${item.title}\n${item.content}`;
          })
          .join("\n\n");
        await navigator.clipboard.writeText(content);
      }
      this.$message.success("复制成功");
    },
  },
};
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
}

.main-content {
  width: 100%;
  background-color: #f9f9fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;

  .input-section {
    width: 969px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 14px;
    margin-bottom: 36px;
    position: relative;

    .input-right {
      width: 914px;
    }

    .upload-icon {
      position: absolute;
      bottom: 20px;
      left: 0;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ebebeb;

      img {
        width: 24px;
        height: 24px;
      }
    }

    .section-header {
      color: rgba(20, 27, 52, 1);
      font-family: "PingFang SC";
      font-size: 16px;
      // line-height: 24px;
      font-weight: 600;
      margin-bottom: 14px;
    }

    .input-container {
      width: 100%;
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
  }

  .upload-tip {
    align-self: flex-start;
    margin-left: 287px;
    width: 221px;
    height: 32px;
    box-shadow: 4px 7px 20px 4px rgba(0, 0, 0, 0.18);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 7px 10px;
    margin-bottom: 92px;

    &::before {
      content: "上传附件，支持Word、PDF、txt格式";
      color: #ffffff;
      font-family: "PingFang SC";
      font-size: 12px;
      line-height: 18px;
      font-weight: 500;
    }
  }

  .template-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 969px;
    margin-bottom: 46px;

    .template-container {
      width: 914px;
    }

    .section-header {
      color: rgba(20, 27, 52, 1);
      font-family: "PingFang SC";
      font-size: 16px;
      line-height: 24px;
      font-weight: 600;
      margin-bottom: 14px;
    }

    .template-preview-area {
      width: 25%;
      height: 206px;
      border-radius: 20px;
      background: #ffffff;
      display: flex;
      align-items: center;
      border: 1px solid #603cff;
    }

    .template-selection {
      width: 870px;
      height: 196px;
      display: flex;
      gap: 16px;
      margin-top: 24px;
      margin-left: 24px;

      .template-item {
        width: 186px;
        height: 148px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        .template-preview {
          width: 186px;
          height: 118px;
          border-radius: 10px;
        }

        .template-name {
          width: 100%;
          color: rgba(20, 27, 52, 1);
          font-family: "PingFang SC";
          font-size: 16px;
          line-height: 24px;
          font-weight: 500;
          text-align: center;
        }
      }

      .more-templates {
        width: 62px;
        height: 148px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        .img-box {
          height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #efeff0;
          border-radius: 10px;
          width: 100%;

          img {
            width: 24px;
            height: 24px;
          }
        }

        .more-icon {
          width: 62px;
          height: 118px;
        }

        .more-text {
          width: 100%;
          color: rgba(20, 27, 52, 1);
          font-family: "PingFang SC";
          font-size: 16px;
          line-height: 24px;
          font-weight: 500;
          text-align: center;
        }
      }
    }
  }

  .outline-section {
    width: 969px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 48px;
    position: relative;

    .star-img {
      position: absolute;
      left: 0;
      right: 0;
      width: 39px;
      height: 39px;
    }

    .outline-container {
      width: 914px;
      border-radius: 20px;
      background: #ffffff;
      padding: 16px 32px 32px 32px;

      .outline-header {
        width: 100%;
        // height: 27px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid #efeff0;

        .outline-title {
          color: rgba(20, 27, 52, 1);
          font-family: "PingFang SC";
          font-size: 18px;
          line-height: 27px;
          font-weight: 600;
        }

        .img-box {
          display: flex;
          align-items: center;

          .edit-icon {
            margin-right: 20px;
            cursor: pointer;
          }

          img {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }

          .save-btn {
            background: linear-gradient(32deg,
                #4a25e1 41%,
                #7b5aff 83%,
                #7b5aff 86%);
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
        }

        .outline-action {
          width: 60px;
          height: 20px;
        }
      }

      .divider {
        width: 100%;
        height: 2px;
        margin-bottom: 16px;
      }

      .outline-content {
        margin-top: 16px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .outline-item {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .item-title {
            color: rgba(20, 27, 52, 1);
            font-family: "PingFang SC";
            font-size: 16px;
            line-height: 24px;
            font-weight: 600;
          }

          .item-content {
            color: rgba(20, 27, 52, 1);
            font-family: "PingFang SC";
            font-size: 16px;
            line-height: 24px;
            font-weight: 500;
          }
        }
      }
    }

    .action-buttons {
      width: 914px;
      height: 56px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .feedback-buttons {
        width: 97px;
        height: 36px;
        border-radius: 60px;
        background: #ffffff;
        display: flex;
        align-items: center;
        padding: 6px 14px;
        gap: 14px;

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

      .generate-button {
        width: 160px;
        height: 56px;
        box-shadow: 0px 21px 27px -10px rgba(96, 60, 255, 0.48);
        border-radius: 65px;
        cursor: pointer;
        transform-origin: right;
        transform: scale(0.8);
        background: linear-gradient(15deg,
            rgba(74, 37, 225, 1) 0%,
            rgba(123, 90, 255, 1) 93%,
            rgba(123, 90, 255, 1) 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        // padding: 0 64px;

        .button-text {
          color: #ffffff;
          font-family: "PingFang SC";
          font-size: 18px;
          line-height: 27px;
          font-weight: 600;
        }
      }
    }
  }

  .preview-section {
    width: 969px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 48px;

    .preview-container {
      width: 914px;
      height: 562px;
      border-radius: 20px;
      background: #ffffff;
      padding: 16px 32px 32px 32px;
      margin-bottom: 32px;
    }

    .preview-header {
      width: 100%;
      height: 20px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;

      .preview-action {
        width: 20px;
        height: 20px;
      }
    }

    .preview-content {
      width: 850px;
      height: 432px;
      position: relative;

      .preview-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid #f8fafc;
      }

      .vertical-divider {
        position: absolute;
        top: 0;
        left: 199px;
        width: 2px;
        height: 100%;
        background: rgba(239, 239, 240, 1);
      }

      .slide-thumbnails {
        position: absolute;
        top: 32px;
        left: 32px;
        width: 135px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .thumbnail {
          width: 135px;
          height: 80px;
          border-radius: 6px;
          background: #d8d8ff;
        }
      }

      .main-slide {
        position: absolute;
        top: 32px;
        left: 233px;
        width: 585px;
        height: 368px;
        border-radius: 6px;
        background: #d8d8ff;
      }
    }
  }
}

::v-deep .el-textarea__inner {
  border: 0;
  padding: 0;
  font-weight: 800;
}

.outline-item ::v-deep .el-textarea__inner {
  border: 0;
  padding: 12px 16px;
  color: rgba(20, 27, 52, 1);
  font-family: "PingFang SC";
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  border: 1px solid #603cff;
  border-radius: 14px;
  background-color: #f7f7fa;
}
</style>
