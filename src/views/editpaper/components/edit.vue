<template>
  <!-- 专利详情容器 -->
  <div class="patent-detail-container">
    <!-- 内容优化结果对话框 -->
    <el-dialog :visible.sync="dialogVisible" width="30%" :show-close="false">
      <el-scrollbar>
        <!-- 优化完成后显示内容 -->
        <div class="text-container" style="white-space: pre-wrap;" v-safe-html="tempEditObj.content"
          v-if="optimizeState == 'end'" />
        <!-- 优化加载中显示占位符 -->
        <div class="placeholder-container" v-else>
          <el-skeleton :rows="3" animated />
        </div>
      </el-scrollbar>
      <!-- 对话框操作按钮 -->
      <div class="btn-box">
        <div class="change" @click="changeText">替换</div>
        <div class="cancel" @click="closeSectionDialog">取消</div>
      </div>
    </el-dialog>

    <!-- 用户反馈对话框 -->
    <feedbackDialog :visible.sync="feedbackDialogVisible" @submit="handleThumbsDown" />

    <!-- 装饰性星星图片 -->
    <img src="@/assets/Frame 44.svg" alt="" class="star-img">

    <!-- 左侧目录，使用v-for渲染章节标题 -->
    <el-tooltip placement="right" effect="light">
      <div slot="content">
        <ul class="sideCon">
          <li class="sideItem" v-for="section in sidebarTitles" :key="section.key"
            :class="{ completed: getSectionState(section.key) }">
            <a type="primary" :href="`#${section.key}`">{{ section.title }}</a>
          </li>
        </ul>
      </div>
      <span class="sideTitle">章节目录</span>
    </el-tooltip>
    <!-- 专利内容主体 -->
    <div class="patent-content">
      <!-- 遍历渲染各个专利章节 -->
      <div class="patent-section" @mouseenter="handleMouseEnter(item)" @mouseleave="handleMouseLeave(item)"
        v-for="(item) in sections" :key="item.key" :id="item.key">
        <!-- 章节头部 -->
        <div class="section-header">
          <div class="header-left">
            <!-- 章节完成状态图标 -->
            <img class="check-icon" src="@/assets/checkmark.svg" v-if="item.state" />
            <img class="check-icon" src="@/assets/checkmark-circle-02.png" v-else />
            <!-- 章节标题 -->
            <div class="section-title">{{ item.title }}</div>
          </div>

          <!-- 编辑状态下显示保存按钮 -->
          <div class="save-btn" @click="editState = false" v-if="editState && editOrder === item.key">保存</div>

          <!-- 非编辑状态下显示操作按钮 -->
          <div class="content-operate" slot="reference"
            v-if="!(editState && editOrder === item.key) && item.content && item.key != 'figures'">
            <!-- 编辑按钮 -->
            <img src="@/assets/pencil-edit-02.png" v-show="item.menuShow" @click="contentEdit(item.key)">
            <!-- 复制按钮 -->
            <img src="@/assets/copy-01.png" v-show="item.menuShow" @click="contentCopy(item.key)">
            <!-- 优化内容弹出框 -->
            <el-popover placement="bottom-end" width="537" trigger="click" popper-class="popoverStyle"
              v-model="item.popShow" :key="item.key" @after-leave="afterLeave">
              <div class="optimize-container">
                <!-- 优化方向输入框 -->
                <el-input :clearable="false" v-model="optimize" placeholder="请输入优化方向"
                  style="width: 450px;font-size: 16px;" />
                <!-- 发送优化请求按钮 -->
                <div class="send-icon" @click="showSectionDialog(item)">
                  <img src="@/assets/Send.png" alt="">
                </div>
              </div>
              <!-- 触发优化弹出框的按钮 -->
              <img src="@/assets/elements.png" v-show="item.menuShow" @click="contentOptimize(item)" slot="reference">
            </el-popover>
          </div>
        </div>

        <!-- 附图章节特殊处理 -->
        <div class="images-container" :style="{ width: imgList.length > 0 ? 'unset' : '100%' }"
          v-if="item.key == 'figures'">
          <!-- 无图像时显示加载占位符 -->
          <div class="placeholder-container" v-if="!item.state && imgList == 0">
            <el-skeleton :rows="3" animated />
          </div>
          <!-- 有图像时显示图像列表 -->
          <div v-for="(image, index) in imgList" :key="index" class="image-item" v-else>
            <el-tooltip class="item" effect="dark" :content="image.desc" placement="top-start">
              <div class="image-placeholder">
                <el-image :src="image.src" :preview-src-list="watchImgs" alt=""></el-image>
              </div>
            </el-tooltip>
            <div class="image-caption">{{ image.name }}</div>
          </div>
        </div>

        <!-- 其他章节内容 -->
        <div class="section-content bordered line-content" v-else>
          <!-- 无内容时显示加载占位符 -->
          <div class="placeholder-container" v-if="!item.content && !item.state">
            <el-skeleton :rows="3" animated />
          </div>
          <!-- 编辑状态下显示富文本内容 -->
          <div class="patent-name base-text" style="white-space: pre-wrap;" v-safe-html="markedData(item.content)"
            v-if="!editState || editOrder !== item.key" />
          <!-- 编辑状态下显示文本输入框 -->
          <el-input type="textarea" v-model="item.content" :autosize="{ minRows: 1, maxRows: 999 }" resize="none"
            v-else></el-input>
        </div>
      </div>

      <!-- 用户反馈按钮 -->
      <div class="feedback-buttons">
        <!-- 点赞按钮（未点赞状态） -->
        <img class="feedback-icon like-icon" :src="require('@/assets/image/thumbs-up.svg')" @click="handleThumbsUp"
          v-show="!islike" />
        <!-- 点赞按钮（已点赞状态） -->
        <img v-show="islike" class="feedback-icon like-icon" :src="require('@/assets/image/thumbs-up-black.svg')" />
        <div class="divider-line"></div>
        <!-- 点踩按钮（未点踩状态） -->
        <img class="feedback-icon dislike-icon" :src="require('@/assets/image/thumbs-down.svg')"
          @click="feedbackDialogVisible = true" v-show="!isDislike" />
        <!-- 点踩按钮（已点踩状态） -->
        <img class="feedback-icon like-icon" v-show="isDislike"
          :src="require('@/assets/image/thumbs-down-black.svg')" />
      </div>
    </div>
  </div>
</template>

<script>
import { runAppWorkFlow } from '@/api/public'
import {
  generateFigure,
  queryRunAppProcess,
  feedbacks
} from '@/api/paper'
import feedbackDialog from "@/components/feedbackDialog.vue";
import { marked } from 'marked'
import tracker from '@/utils/tracker';
import cache from '@/plugins/cache';

const sidebarTitles = [
  { key: 'title', title: '初拟的发明名称' },
  { key: 'definitions', title: '名词解释' },
  { key: 'field', title: '所属技术领域' },
  { key: 'bg', title: '背景技术' },
  { key: 'purpose', title: '发明创造的目的' },
  { key: 'solution', title: '技术方案' },
  { key: 'embodiments', title: '具体实施例' },
  { key: 'claims', title: '技术要点及有益效果' },
  { key: 'figures', title: '附图' },
  { key: 'references', title: '其他' },
]
export default {
  name: "PaperEdit",
  props: {
    // 专利数据节点对象
    nodes: {
      type: Object,
    }
  },
  components: { feedbackDialog },
  data() {
    return {
      $sanitize: this.$sanitize,
      sidebarTitles,
      sideOpen: false,
      // 各个专利章节的配置信息
      sections: [
        {
          key: 'title',                 // 章节标识符
          title: '初拟的发明名称',       // 章节标题
          content: '',                  // 章节内容
          menuShow: false,             // 是否显示操作菜单
          popShow: false,              // 优化弹窗是否显示
          state: false                 // 章节内容是否已加载完成
        }, {
          key: 'definitions',
          title: '名词解释',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'field',
          title: '所属技术领域',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'bg',
          title: '背景技术',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'purpose',
          title: '发明创造的目的',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'solution',
          title: '发明创造的技术方案',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'embodiments',
          title: '发明创造的具体实施例',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'claims',
          title: '发明人认为要保护的发明内容的技术要点以及相应的有益效果',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'figures',
          title: '附图',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }, {
          key: 'references',
          title: '其他',
          content: '',
          menuShow: false,
          popShow: false,
          state: false
        }],
      inputValue: '',               // 输入值（未使用）
      tempEditObj: {},              // 临时编辑对象，用于存储正在优化的内容
      activeSectionIndex: null,     // 当前激活的section索引
      dialogVisible: false,         // 优化结果对话框显示状态
      placeholderBars: [            // 加载占位条配置
        { width: "122px", opacity: 1 },
        { width: "194px", opacity: 0.7 },
        { width: "100%", opacity: 0.4 }
      ],
      imgList: [],                  // 已生成的图像列表
      watchImgs: [],                // 图像预览列表
      editState: false,             // 是否处于编辑状态
      editOrder: null,              // 正在编辑的章节标识
      optimizeState: 'loading',     // 优化状态 ('loading'加载中, 'end'完成)
      optimize: '',                 // 优化方向输入内容
      tempInput: '',                // 临时输入内容（未使用）
      pollingTimer: null,           // 轮询定时器
      imgCreatedNum: 1,             // 图像创建次数计数器（未使用）
      feedbackDialogVisible: false, // 反馈对话框显示状态
      isDislike: false,             // 是否已点踩
      islike: false                 // 是否已点赞
    }
  },
  watch: {
    // 监听对话框显示状态变化
    // 合并之前的两个重复监听，统一处理关闭时的操作
    dialogVisible(newVal) {
      // 对话框关闭时执行清理操作
      if (!newVal) {
        // 清空优化输入
        this.optimize = '';
        // 清除轮询定时器（如果存在）
        if (this.pollingTimer) {
          clearInterval(this.pollingTimer);
          // 建议清除后将定时器变量置空，避免内存泄漏
          this.pollingTimer = null;
        }
      }
    },
    //监听节点中图像数据的变化
    //保留注释说明原始意图，增加空状态处理
    'nodes.figures'(newVal) {
      // 仅在有新值且imgCreatedNum为真时执行
      if (newVal && this.imgCreatedNum) {
        newVal.forEach(item => {
          this.generateFigure(item);
        });
        this.imgCreatedNum = 0;
      }
    },
    //监听节点数据变化，更新各章节内容
    // 优化逻辑结构，提取重复操作
    nodes: {
      handler(newVal) {
        this.sections.forEach(section => {
          const sectionKey = section.key;
          // 检查新数据中是否存在该章节且状态为真，同时章节未加载
          // Vue2不支持可选链，使用传统方式判断
          if (!section.state && newVal[sectionKey] && newVal[sectionKey].state) {
            // console.log(newVal[sectionKey].content, 'newVal[sectionKey].content')
            // 更新章节内容
            // 先安全获取content值
            const targetContent = newVal && newVal[sectionKey] && newVal[sectionKey].content;
            // 再处理替换逻辑
            section.content = typeof targetContent === 'string'
              ? targetContent.replace(/\n\n/g, '\n')
              : targetContent;

            // 特殊处理图像章节
            if (sectionKey === 'figures') {
              section.content.forEach(img => {
                this.generateFigure(img);
              });
            }
            // 标记章节已加载
            section.state = true;
          }
        });
      },
      deep: true,      // 深度监听对象内部变化
      immediate: true  // 初始化时立即执行一次
    }
  },
  methods: {
    // 根据key查询对应的state状态
    getSectionState(key) {
      // 找到sections中key匹配的项
      const matchedSection = this.sections.find(item => item.key === key);
      // 存在则返回state，否则默认false
      return matchedSection ? matchedSection.state : false;
    },
    // 将Markdown文本转换为HTML
    // text: 需要转换的Markdown文本，字符串类型
    // 返回值: 转换后的HTML字符串
    markedData(text) {
      if (!text) {
        return ''
      }
      return marked(text)
    },
    // 生成图表图像
    // item: 图表信息对象，包含code（图表代码）和name（图表名称）等属性
    // 返回值: Promise对象，无实际返回数据
    async generateFigure(item) {
      // 调用API生成图表，指定图表代码和类型为mermaid
      const res = await generateFigure({
        code: item.code,
        diagram_type: 'mermaid'
      })
      // 将生成的图表添加到图像列表，包含名称、base64格式图片地址、描述
      this.imgList.push({
        name: item.name,
        src: 'data:image/png;base64,' + res.figure,
        desc: item.description
      })
      // 将图表添加到预览列表，仅存base64格式图片地址
      this.watchImgs.push('data:image/png;base64,' + res.figure)
    },

    // 进入编辑状态
    // key: 要编辑的章节唯一标识（章节key），字符串类型
    contentEdit(key) {
      this.editState = true // 开启编辑状态
      this.editOrder = key  // 记录当前编辑的章节key
    },
    // 复制指定章节的内容到剪贴板
    // key: 要复制内容的章节唯一标识（章节key），字符串类型
    // 返回值: Promise对象，无实际返回数据
    async contentCopy(key) {
      let copyText = ''
      // 遍历章节列表，找到目标章节并获取内容
      this.sections.forEach(item => {
        if (item.key === key) {
          copyText = item.content
        }
      })
      // 使用浏览器剪贴板API写入内容
      await navigator.clipboard.writeText(copyText)
      // 提示复制成功
      this.$message.success('内容复制完成')
    },
    // 准备优化内容，保存当前章节对象到临时变量
    // item: 要优化的章节完整对象，包含key、content、state等属性
    contentOptimize(item) {
      // 深拷贝章节对象，避免直接修改原数据
      this.tempEditObj = JSON.parse(JSON.stringify(item))
    },
    // 鼠标进入章节区域时显示操作菜单
    // item: 当前鼠标悬浮的章节对象，包含menuShow属性（控制菜单显示/隐藏）
    handleMouseEnter(item) {
      item.menuShow = true // 显示章节操作菜单
    },
    // 鼠标离开章节区域时隐藏操作菜单
    // item: 当前鼠标离开的章节对象，包含menuShow属性（控制菜单显示/隐藏）
    handleMouseLeave(item) {
      item.menuShow = false // 隐藏章节操作菜单
    },
    // 对话框关闭后的清理操作
    afterLeave() {
      this.optimize = null // 清空优化方向输入框
    },

    // 处理内容生成请求（调用工作流API）
    // optimize: 用户输入的优化方向，字符串类型
    // 返回值: Promise对象，无实际返回数据
    async handleGenerate(optimize) {
      const params = {
        AppKey: process.env.VUE_APP_APPKEY, // 应用标识Key
        AppID: process.env.VUE_APP_APPID,  // 应用ID
        userId: '1',                     // 用户ID（固定为1）
        InputData: JSON.stringify({      // 输入数据，转为JSON字符串
          input: this.tempEditObj.content, // 原章节内容
          suggestion: optimize             // 优化方向
        })
      }
      try {
        tracker.track({ functionName: '交底书修改', status: "processing" })
        // 调用运行工作流API，传递必要参数
        const res = await runAppWorkFlow(params)
        // 根据返回的runId，开始轮询查询处理进度
        this.queryRunAppProcess(res.runId, params)
      } catch (error) {
        console.log('请求错误:')
      }
    },
    // 查询应用处理过程（轮询机制）
    // runId: 工作流运行唯一标识，用于查询对应任务进度
    // 返回值: Promise对象，无实际返回数据
    async queryRunAppProcess(runId, { InputData }) {
      // 如果已有轮询定时器，先清除避免重复轮询
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }

      // 定义轮询查询函数
      const poll = async () => {
        // 构造查询参数
        const params = {
          RunID: runId,                    // 任务运行ID
          AppKey: process.env.VUE_APP_APPKEY,  // 应用标识Key
          UserID: '1'                      // 用户ID（固定为1）
        };

        // 调用查询API获取任务状态
        const res = await queryRunAppProcess(params)
        if (res.status === "success") {
          tracker.track({ functionName: '交底书修改', requestParams: InputData, responseResult: res.output, status: "success" })
          // 处理成功：更新状态、停止轮询、更新优化后内容
          this.optimizeState = 'end'
          this.pollingTimerHandle()
          // 解析返回的output，更新临时编辑对象的内容
          this.tempEditObj.content = JSON.parse(res.output).output
        } else if (res.status === "processing") {
          // 处理中：不做操作，继续下一次轮询
        } else {
          tracker.track({ functionName: '交底书修改', status: "failed" })
          // 处理失败：提示错误信息
          this.$message.error('生成错误，请重新尝试')
        }
      }

      // 立即执行一次查询（避免等待第一个轮询间隔）
      poll()
      // 设置轮询定时器，每2秒查询一次
      this.pollingTimer = setInterval(poll, 2000);
    },

    // 处理轮询定时器（停止轮询并清理）
    pollingTimerHandle() {
      clearInterval(this.pollingTimer); // 清除轮询定时器
      this.pollingTimer = null;         // 置空定时器变量，避免内存泄漏
    },

    // 显示章节对话框并开始内容优化流程
    // item: 当前操作的章节对象，包含popShow（弹窗显示状态）等属性
    // 返回值: Promise对象，无实际返回数据
    async showSectionDialog(item) {
      // 校验：若未输入优化方向，提示错误
      if (!this.optimize) {
        this.$message.error('请输入优化方向')
      } else {
        this.optimizeState = 'loading' // 设置优化状态为"加载中"
        this.dialogVisible = true      // 显示优化结果对话框
        this.handleGenerate(this.optimize) // 调用生成函数，传入优化方向
        item.popShow = false           // 关闭章节操作弹窗
      }
    },

    // 替换原章节内容并关闭对话框
    changeText() {
      // 查找临时编辑对象对应的原章节，更新内容
      this.sections.find(item => {
        if (item.key === this.tempEditObj.key) {
          item.content = this.tempEditObj.content // 更新章节内容
          this.dialogVisible = false              // 关闭优化结果对话框
          return item // find方法：找到后返回该章节对象，终止遍历
        }
      })
    },

    // 关闭章节优化结果对话框
    closeSectionDialog() {
      this.dialogVisible = false // 隐藏对话框
    },

    // 处理章节菜单点击事件（待完善具体逻辑）
    // action: 菜单操作类型，字符串（如'edit'编辑、'delete'删除、'copy'复制）
    handleMenuClick(action) {
      // 若未选中任何章节，直接返回
      if (this.activeSectionIndex === null) return
      // 根据操作类型处理逻辑（当前仅打印日志，待完善）
      switch (action) {
        case 'edit':
          // 编辑逻辑：待实现
          break;
        case 'delete':
          // 删除逻辑：待实现
          break;
        case 'copy':
          // 复制逻辑：待实现
          break;
      }
      this.closeSectionDialog() // 关闭对话框
    },

    // 处理用户点赞操作
    handleThumbsUp() {
      // 构造点赞反馈数据
      const data = {
        type: "like",       // 反馈类型：点赞
        reason: "",         // 反馈原因：点赞无需原因
        suggestion: "",     // 建议：点赞无需建议
      };
      // 提交反馈
      this.feedbacks(data);
    },

    // 处理用户点踩操作
    // data: 点踩反馈基础数据，需补充type为"dislike"
    handleThumbsDown(data) {
      data.type = "dislike"; // 补充反馈类型：点踩
      this.feedbacks(data);  // 提交反馈
    },

    // 提交用户反馈到后端
    // data: 完整反馈数据，包含type（反馈类型）、reason（反馈原因数组）、suggestion（建议）
    // 返回值: Promise对象，无实际返回数据
    async feedbacks(data) {
      // 构造反馈请求参数
      const params = {
        user_id: cache.local.getJSON('userInfo').user_id || 1,                  // 用户ID（固定为1）
        feature: "交底书生成",        // 反馈对应的功能模块
        type: data.type,             // 反馈类型（like/dislike）
        reason: data.reason || [],   // 反馈原因，默认空数组
        suggestion: data.suggestion, // 用户建议
      };

      // 调用反馈API并处理结果
      await feedbacks(params)
        .then((res) => {
          if (res.status === "success") {
            // 反馈成功：提示、更新界面状态、关闭反馈对话框
            this.$message.success("感谢您的反馈！");
            if (data.type === "like") {
              this.islike = true;    // 标记已点赞
            } else {
              this.isDislike = true; // 标记已点踩
            }
            this.feedbackDialogVisible = false; // 关闭反馈对话框
          } else {
            // 反馈失败：提示错误信息
            this.$message.error("反馈提交失败，请稍后重试！");
          }
        })
    },
  }
}

</script>

<style lang="scss">
.popoverStyle {
  padding: 20px;
  border-radius: 20px;
}

.el-tooltip__popper.is-light {
  border: none !important;
  /* 完全移除边框 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
  /* 可选：调整阴影效果 */
}

.sideTitle {
  position: fixed;
  top: 27vh;
  writing-mode: vertical-rl;
  text-orientation: upright;
  -webkit-writing-mode: vertical-rl;
  -ms-writing-mode: vertical-rl;
  cursor: pointer;
  padding: 14px 15px;
  box-shadow: 0px 6px 30px 4px rgba(112, 144, 176, 0.18);
  border-radius: 30px;
  height: 105px;
  transform: translateX(80px);
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 4px;
}

.sideCon {
  list-style: none;

  .sideItem {
    counter-increment: cjk-list;
    margin-left: 1vw;
    position: relative;
    line-height: 3vh;

    &::before {
      content: "•";
      font-weight: bold;
      display: inline-block;
      width: 1em;
      margin-left: -1em;
      color: #333;
      font-size: 1.25rem;
    }

    &.completed::before {
      color: #28a745;
      /* 绿色 */
    }

    &:hover {
      &::before {
        color: #40a0ff9f;
      }

      a {
        color: #40a0ff9f;
      }
    }

    a {
      margin-left: 8px;
      text-decoration: none;
      white-space: normal;
      word-wrap: break-word;
      position: relative;
      color: #409EFF;

      &:hover {
        color: #40a0ff9f;
      }
    }
  }
}

/* 当屏幕分辨率小于1536px时应用的样式 */
@media (max-width: 1920px) {
  .sideTitle {
    top: 29vh;
  }
}

/* 当屏幕分辨率小于1536px时应用的样式 */
@media (max-width: 1536px) {
  .sideTitle {
    top: 32vh;
    font-size: 14px;
    padding: 12px 14px;
  }
}
</style>
<style lang="scss" scoped>
@import '~@/styles/editpaper/edit.scss';
</style>
