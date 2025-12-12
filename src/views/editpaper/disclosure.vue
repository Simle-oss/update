<template>
  <div class="page-container">
    <!-- 默认的表单 -->
    <paper-main class="main-content" v-show="pageState == 'initial'" @handleGenerate="handleGenerate"></paper-main>
    <!-- 默认的生成交底书按钮 -->
    <!-- <paper-action class="action-bar" v-show="pageState == 'initial'"></paper-action> -->
    <editMain class="main-content" v-show="pageState == 'generate'" style="margin-bottom: 48px;"
      :lineDataArr="lineDataArr"></editMain>
    <!-- 右侧悬浮tools -->
    <editOperate class="main-content" v-show="pageState == 'generate'" @downloadFile="downloadFile"
      @translatePPT="translatePPT" @checkWebs="checkWebs" :isInternet="isInternet" :isPPT="isPPT"
      :isDownload="isDownload" @history-save="handleHistorySave" @history-update="handleHistoryUpdate"></editOperate>
    <!-- 底部交底书内容和右侧悬浮导航 -->
    <PaperEdit ref="paperEdit" class="content-wrapper" v-show="pageState == 'generate'" :nodes="nodes"></PaperEdit>
    <el-drawer title="参考网页" :visible.sync="drawer" direction="rtl" :before-close="handleClose">
      <div class="wbes-container">
        <div class="content-box" v-for="(item, index) in webs" :key="index" @click="goOutside(item)">
          <div class="title">
            {{ item.title }}
          </div>
          <div class="content">
            {{ item.summary }}
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import paperMain from "./components/paperMain.vue";
import paperAction from "./components/paperAction.vue";
import PaperEdit from "./components/edit.vue";
import editMain from './components/editMain.vue';
import editOperate from './components/editOperate.vue'
import { runAppWorkFlow } from '@/api/public'
import { queryRunAppProcess, generateWord } from '@/api/paper'
import { addHistory, updateHistory, getHistoryDetail } from '@/api/layout'
import tracker from "@/utils/tracker";
import { mapToNodeStructure } from "@/utils";
export default {
  name: 'disclosure',
  components: {
    paperMain,
    paperAction,
    PaperEdit,
    editMain,
    editOperate
  },
  comments: {
    PaperEdit,
  },
  data() {
    return {
      isInternet: false,
      isPPT: false,
      isDownload: false,
      pageState: 'initial',
      lineDataArr: {
        lineOne: '',
        lineTwo: '',
        lineThree: '',
        lineFour: ''
      },
      reqState: false,
      pollingTimer: null,
      webs: [],
      drawer: false,
      history_input_data: '',  // 历史记录需要的参数
      history_id: '',
      nodeKeys: {
        title: { title: '初拟的发明名称' },
        definitions: { title: '名词解释' },
        field: { title: '所属技术领域' },
        bg: { title: '背景技术' },
        purpose: { title: '发明创造的目的' },
        solution: { title: '发明创造的技术方案' },
        embodiments: { title: '发明创造的具体实施例' },
        claims: { title: '发明人认为要保护的发明内容的技术要点以及相应的有益效果' },
        figures: { title: '附图' },
        references: { title: '其他' }
      },
      nodes: {
        title: { state: false, content: '' },
        definitions: { state: false, content: '' },
        field: { state: false, content: `` },
        bg: { state: false, content: '' },
        purpose: { state: false, content: '' },
        solution: { state: false, content: '' },
        embodiments: { state: false, content: '' },
        claims: { state: false, content: '' },
        figures: { state: false, content: '' },
        references: { state: false, content: '' }
      }
    }
  },
  created() {
    // 如果有historyId参数，说明是从历史记录跳转过来的，需要加载对应的数据
    if (this.$route.query.historyId) {
      this.pageState = 'generate'
      this.queryHistoryDetail(this.$route.query.historyId);
    }
  },
  beforeDestroy() {
    this.pollingTimerHandle()
  },
  methods: {
    /**
  * 完整的 queryHistoryDetail 实现（带拆分方法）
  *
  * 使用说明：
  * - 请把此函数和其依赖的 helper 方法复制到你的组件 methods 中，替换原来的 queryHistoryDetail 实现。
  * - 该实现会：
  *    1) 解析 historyData.content（支持对象 / 字符串 / 二重 JSON）
  *    2) 基于 this.nodeKeys 动态生成中文标题 -> 英文 key 映射
  *    3) 就地更新 this.nodes（不替换引用），保持子组件响应
  *    4) 对 figures 做额外处理：尝试恢复原始数组并为每个 item 生成 src（data:image/png;base64,...）
  *    5) 支持生成接口缓存与并发限制（避免一次性并发过多）
  *
  * 注意事项（你需要根据项目调整的点）：
  * - 生成图片的 API 调用处：代码里会尝试寻找以下可用函数（优先级顺序）：
  *     this.generateFigureApi, this.$api.generateFigure, window.generateFigure, 全局变量 generateFigure
  *   如果你的项目里用的 API 名称不同，请把 getGenerateFigureFn 中的逻辑改为返回你实际的 API 函数（或直接把 generateFigureApi 作为组件方法）。
  * - 如果你更愿意在前端直接用 mermaid 渲染而不是后台生成图片，请改造 generateFigureSrc 为调用 mermaid 渲染器。
  */

    async queryHistoryDetail(id) {
      if (!id) return;
      try {
        const response = await getHistoryDetail(id);
        if (response.status !== 'success') {
          this.$message.error('加载历史记录失败');
          return;
        }

        const historyData = response.data;
        console.log('getHistoryDetail raw data keys:', Object.keys(historyData || {}).slice(0, 20));

        // 解析 content（支持普通 JSON / 二重 JSON / 已经是对象）
        const rawContent = historyData.content;
        if (!rawContent) {
          console.warn('history content is empty');
          return;
        }
        const parsed = this.safeParseContent(rawContent);
        if (!parsed) {
          this.$message.error('历史数据解析失败');
          return;
        }
        console.log('parsed history content keys:', Object.keys(parsed).slice(0, 50));

        // 动态构建中文标题 -> 英文 key 的映射（根据 this.nodeKeys）
        const zhToEn = this.buildZhToEnMap.call(this);

        // 构造 mapped：优先支持 parsed 使用英文 key 的情况，然后尝试中文 key -> 英文 key 的映射
        const mapped = this.buildMappedFromParsed.call(this, parsed, zhToEn);

        // 回退尝试：从 historyData.input_data 等字段中补 title（兼容旧保存格式）
        this.applyFallbacksForTitle.call(this, mapped, historyData);

        // 先处理 figures（如果存在，且为数组或可解析的字符串），生成图片 src 并更新 this.nodes.figures
        await this.handleFiguresFromHistory.call(this, parsed, mapped);

        // 处理其余字段，就地更新 this.nodes（避免替换引用）
        this.updateOtherNodes.call(this, parsed, mapped);

        // 保存 history_id 供更新使用，或用于 :key 强制重建子组件
        this.history_id = historyData.id || id;

        console.log('final this.nodes after history load:', this.nodes);
      } catch (error) {
        console.error('queryHistoryDetail error:', error);
        this.$message.error('加载历史记录失败');
      }
    },

    /* ----------------------------- Helper functions ----------------------------- */

    // 解析 content（尝试一次或二次 JSON.parse）
    safeParseContent(raw) {
      if (!raw) return null;
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e1) {
        try {
          const once = JSON.parse(raw);
          return (typeof once === 'string') ? JSON.parse(once) : once;
        } catch (e2) {
          console.error('safeParseContent failed:', e1, e2);
          return null;
        }
      }
    },

    // 根据 this.nodeKeys 动态生成中文标题 -> 英文 key 的映射
    buildZhToEnMap() {
      const map = {};
      Object.keys(this.nodeKeys).forEach(k => {
        const zh = this.nodeKeys[k] && this.nodeKeys[k].title;
        if (zh) map[zh] = k;
      });
      // 额外常见中文变体备选（按需扩展）
      Object.assign(map, {
        '标题': 'title',
        '初稿': 'title',
        '发明名称': 'title',
        '技术背景': 'bg',
        '技术手段': 'solution',
        '技术效果': 'purpose'
      });
      return map;
    },

    // 构造 mapped 对象（英文 key -> 值）
    buildMappedFromParsed(parsed, zhToEn) {
      const mapped = {};
      // 先把已是英文 key 的直接拷贝
      Object.keys(this.nodeKeys).forEach(k => {
        if (Object.prototype.hasOwnProperty.call(parsed, k)) mapped[k] = parsed[k];
      });
      // 再尝试用中文标题映射补全
      Object.keys(parsed).forEach(k => {
        if (!mapped[k]) {
          const en = zhToEn[k];
          if (en) mapped[en] = parsed[k];
        }
      });
      return mapped;
    },

    // 回退补 title（尝试 historyData 的 input_data / inputData / 标题 字段）
    applyFallbacksForTitle(mapped, historyData) {
      if (mapped.title) return;
      // 尝试 parsed['标题'] 已在 mapped 中处理过，若仍无则尝试 input_data
      try {
        const inputRaw = historyData.input_data || historyData.inputData || historyData.input;
        if (inputRaw) {
          const ip = (typeof inputRaw === 'string') ? JSON.parse(inputRaw) : inputRaw;
          if (ip) {
            if (ip['标题']) mapped.title = ip['标题'];
            else if (ip.title) mapped.title = ip.title;
            // 你可根据实际结构继续添加识别逻辑
          }
        }
      } catch (e) {
        // 忽略解析错误
      }
    },

    /* ------------------------- Figures 相关辅助 & 缓存 ------------------------- */

    // 生成缓存 key（对 code 进行简短编码）
    cacheKeyForCode(code) {
      try {
        return 'fig_cache_' + btoa(unescape(encodeURIComponent(String(code)))).slice(0, 200);
      } catch (e) {
        return 'fig_cache_' + String(code).slice(0, 200);
      }
    },
    getCachedFigure(code) {
      try { return localStorage.getItem(this.cacheKeyForCode(code)); } catch (e) { return null; }
    },
    setCachedFigure(code, src) {
      try { localStorage.setItem(this.cacheKeyForCode(code), src); } catch (e) { /* ignore */ }
    },

    // 尝试找到项目中可用的生成图片 API 函数（调用者可根据项目适配此逻辑）
    getGenerateFigureFn() {
      // 优先：组件实例中提供的 this.generateFigureApi（推荐在组件 methods 中实现一个小包装）
      if (typeof this.generateFigureApi === 'function') return this.generateFigureApi.bind(this);

      // 常见位置：this.$api.generateFigure
      if (this.$api && typeof this.$api.generateFigure === 'function') {
        return this.$api.generateFigure.bind(this.$api);
      }

      // 浏览器全局（仅在极少数场景适用）
      try {
        if (typeof window !== 'undefined' && typeof window.generateFigure === 'function') {
          return window.generateFigure;
        }
      } catch (_) { }

      // 如果找不到，抛出错误并提示开发者
      throw new Error('generateFigure API not found. 请提供一个生成图像的 API 函数，例如在组件中添加 methods.generateFigureApi 或将 this.$api.generateFigure 对接到后端。');
    },

    // 单个 code -> data:image/png;base64,...（含缓存）
    async generateFigureSrc(code) {
      if (!code) return null;
      const cached = this.getCachedFigure(code);
      if (cached) return cached;

      const genFn = this.getGenerateFigureFn.call(this); // 可能抛错
      try {
        // genFn 返回值期望包含 base64 字符串（和你现有 API 一致：res.figure）
        const res = await genFn({ code, diagram_type: 'mermaid' });
        if (res && (res.figure || res.data || res.src)) {
          // 支持多种返回形态：res.figure、res.data、res.src
          const base64 = res.figure || res.data || res.src;
          const src = String(base64).startsWith('data:') ? String(base64) : ('data:image/png;base64,' + base64);
          this.setCachedFigure(code, src);
          return src;
        }
      } catch (err) {
        console.error('generateFigureSrc error:', err);
      }
      return null;
    },

    // 并发限速批量生成（limit 默认 3）
    async generateFiguresWithLimit(items, limit = 3) {
      const results = [];
      let i = 0;
      while (i < items.length) {
        const batch = items.slice(i, i + limit);
        const promises = batch.map(async (it) => {
          // 支持 item 已包含 src：直接保持；或包含 code：调用生成
          if (it.src) {
            return { name: it.name || '', src: it.src, desc: it.description || it.desc || '' };
          }
          if (it.code) {
            const src = await this.generateFigureSrc.call(this, it.code);
            return { name: it.name || '', src: src || '', desc: it.description || it.desc || '' };
          }
          // 回退：只有 description 可用
          return { name: it.name || '', src: '', desc: it.description || it.desc || '' };
        });
        // 等待这一批完成
        // eslint-disable-next-line no-await-in-loop
        const resolved = await Promise.all(promises);
        results.push(...resolved);
        i += limit;
      }
      return results;
    },

    /* ------------------------ 处理 figures 的主逻辑 ------------------------ */

    async handleFiguresFromHistory(parsed, mapped) {
      const figuresKeyZh = this.nodeKeys['figures'] && this.nodeKeys['figures'].title;
      let rawFigures = mapped['figures'];

      // 保险：从中文标题字段拿一次
      if ((rawFigures === undefined || rawFigures === null) && figuresKeyZh && Object.prototype.hasOwnProperty.call(parsed, figuresKeyZh)) {
        rawFigures = parsed[figuresKeyZh];
      }

      // 可能存在 summary 字段（例如 附图_summary）
      const summaryKey = figuresKeyZh ? `${figuresKeyZh}_summary` : null;
      const summaryVal = (summaryKey && Object.prototype.hasOwnProperty.call(parsed, summaryKey)) ? parsed[summaryKey] : null;

      const tryParse = (v) => {
        if (v == null) return v;
        if (typeof v === 'string') {
          const t = v.trim();
          if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
            try {
              const p = JSON.parse(t);
              if (typeof p === 'string') {
                // 二重序列化
                try { return JSON.parse(p); } catch (_) { return p; }
              }
              return p;
            } catch (_) {
              return v;
            }
          }
        }
        return v;
      };

      rawFigures = tryParse(rawFigures);

      // 如果是数组，优先尝试用 code 生成 src
      if (Array.isArray(rawFigures) && rawFigures.length > 0) {
        // 触发加载前状态
        this.nodes.figures.state = false;
        try {
          const generated = await this.generateFiguresWithLimit.call(this, rawFigures, 3);
          // generated => [{ name, src, desc }]
          this.nodes.figures.content = generated;
          // 标记 state 为 true 当至少有一个 src 存在
          this.nodes.figures.state = generated.some(g => !!g.src);
          return;
        } catch (err) {
          // 退回：把原始 rawFigures 直接赋值（可能包含 code/description）
          this.nodes.figures.content = rawFigures;
          this.nodes.figures.state = rawFigures.length > 0;
          return;
        }
      }

      // 如果只有 summary 文本或字符串，直接把摘要放到 content 供 UI 显示
      if (summaryVal) {
        this.nodes.figures.content = summaryVal;
        this.nodes.figures.state = !!String(summaryVal).trim();
        return;
      }

      // 兜底：没有任何附图数据
      this.nodes.figures.content = [];
      this.nodes.figures.state = false;
    },

    /* ------------------------ 更新其他字段（非 figures） ------------------------ */

    updateOtherNodes(parsed, mapped) {
      // helper: 尝试解析可能字符串化 JSON 的值
      const tryParsePossiblyStringified = (val) => {
        if (val == null) return val;
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              const p = JSON.parse(trimmed);
              if (typeof p === 'string') {
                try { return JSON.parse(p); } catch (_) { return p; }
              }
              return p;
            } catch (e) {
              return val;
            }
          }
        }
        return val;
      };

      Object.keys(this.nodeKeys).forEach((key) => {
        if (key === 'figures') return; // figures 已专门处理
        let val = mapped[key];

        // 若没有映射，尝试用中文标题字段
        if (val === undefined) {
          const zh = this.nodeKeys[key] && this.nodeKeys[key].title;
          if (zh && Object.prototype.hasOwnProperty.call(parsed, zh)) {
            val = parsed[zh];
          }
        }

        if (val !== undefined && val !== null && val !== '') {
          const parsedVal = tryParsePossiblyStringified(val);
          if (typeof parsedVal === 'object') {
            this.nodes[key].content = parsedVal;
          } else {
            this.nodes[key].content = String(parsedVal);
          }
          this.nodes[key].state = !!this.nodes[key].content;
        } else {
          this.nodes[key].content = '';
          this.nodes[key].state = false;
        }
      });
    }
    ,
    // 递归处理对象，替换所有属性值中的换行符
    removeNewlines(obj) {
      // 遍历对象的每个属性
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // 替换所有换行符为空格（如果需要完全去除则替换为''）
          obj[key] = obj[key].replace(/\n/g, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // 如果属性值是对象，递归处理
          this.removeNewlines(obj[key]);
        }
      }
      return obj;
    },
    async handleGenerate(tempData) {
      // 处理数据  需要把data 中的换行符给取消掉
      const data = this.removeNewlines({ ...tempData }); // 使用扩展运算符避免修改原始对象
      this.history_input_data = data
      if (this.reqState) {
        this.$message.warning("当前请求未结束！")
        return
      }
      try {
        this.reqState = true;
        let params = {
          AppKey: process.env.VUE_APP_DISCLOSURE_APIKEY, // 应用标识Key
          AppID: process.env.VUE_APP_DISCLOSURE_APIID,
          userId: '1',
          InputData: `{\"input\": \"标题：${data.lineOne}\\n技术背景：${data.lineTwo}\\n技术手段：${data.lineThree}\\n技术效果：${data.lineFour}\"}`
        }
        tracker.track({ functionName: '交底书生成', status: 'processing' })

        const res = await runAppWorkFlow(params)
        this.lineDataArr = data
        this.pageState = 'generate'
        this.queryRunAppProcess(res.runId, params)
      } catch (error) {
        this.reqState = false
        this.$message.error(error)
      }
    },
    async queryRunAppProcess(runId, { InputData }) {
      // 清除之前可能存在的轮询定时器
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }
      const params = {
        RunID: runId,
        AppKey: 'd35mubahv7jf375q276g',
        UserID: '1'
      }
      const resFn = (res) => {
        const resNodes = Object.values(res.nodes).filter(item => item.nodeType === 'message'); // 只有nodeType=='message'才是章节内容
        Object.keys(resNodes).forEach(key => {
          // key  后台返回的数据动态字段
          if (resNodes[key].status === "success") {
            const nodeObj = JSON.parse(resNodes[key].input)
            let articleKey = Object.keys(nodeObj)[0]   // 文章对应后台的字段key   只会有这一个字段，没必要用forEach

            if (articleKey === 'webs') {
              this.webs = nodeObj[articleKey].map(item => {
                return JSON.parse(item)
              })
              this.isInternet = true
              // this.$bus.emit('operateState', 'webs')
              return
            } else if (articleKey === 'figures') {
              this.nodes[articleKey].content = JSON.parse(nodeObj[articleKey])
              this.nodes[articleKey].state = true
              return
            } else {
              this.nodes[articleKey].content = nodeObj[articleKey]
              this.nodes[articleKey].state = true
            }
            // Object.keys(JSON.parse(resNodes[key].input)).forEach(k => {
            //   if (k === 'webs') {
            //     this.webs = JSON.parse(JSON.parse(resNodes[key].output).content).map(item => {
            //       return JSON.parse(item)
            //     })
            //     this.$bus.emit('operateState', 'webs')
            //     return
            //   }
            //   if (k === 'figures') {
            //     this.nodes[k].content = JSON.parse(JSON.parse(resNodes[key].output).content)
            //     this.nodes[k].state = true
            //     return
            //   }
            //   if (this.nodeKeys[k] && !this.nodes[k].state) {
            //     this.nodes[k].content = JSON.parse(resNodes[key].output).content
            //     this.nodes[k].state = true
            //   }
            // })
          }
        })
      }
      // 定义轮询函数
      const poll = async () => {
        try {
          const res = await queryRunAppProcess(params);
          if (res.status === "success") {
            const responseResult = Object.values(res.nodes).filter(item => item.nodeType === 'message').map(item => item.output).join(',')
            tracker.track({ functionName: '交底书生成', requestParams: InputData, responseResult, status: 'success' })
            // const output = JSON.parse(res.output);
            // const parsedData = JSON.parse(output.output);
            this.pollingTimerHandle();
            this.isPPT = true
            this.isDownload = true
            // this.$bus.emit('operateState', 'ppt')
            // this.$bus.emit('operateState', 'download')
            resFn(res)
          } else if (res.status === "processing") {
            resFn(res)
          } else if (res.status === "failed") {
            this.$message.error('生成错误，请重新尝试')
            tracker.track({ functionName: '交底书生成', status: 'failed' })
            this.pollingTimerHandle();
          }
        } catch (err) {
          console.error("轮询出错...");
          throw err;
        }
      };
      // 立即执行一次查询
      poll();
      // 设置两秒轮询
      this.pollingTimer = setInterval(poll, 5000);
    },
    pollingTimerHandle() {
      //停止轮询
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      this.reqState = false;
    },
    getFormattedDateTime() {
      const now = new Date();

      // 获取各个时间部分
      const year = now.getFullYear().toString().slice(-2); // 后两位年份
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
      const day = now.getDate().toString().padStart(2, '0'); // 日期补零
      const hours = now.getHours().toString().padStart(2, '0'); // 小时补零
      const minutes = now.getMinutes().toString().padStart(2, '0'); // 分钟补零

      return `${year}${month}${day}_${hours}${minutes}`;
    },
    translatePPT() {
      const nodes = this.nodes
      const uploadParams = {}
      Object.keys(this.nodeKeys).forEach(key => {
        uploadParams[this.nodeKeys[key].title] = nodes[key].content
      })
      let result = ''
      for (const [key, value] of Object.entries(uploadParams)) {
        if (key === '附图') {
          result += `${key}\n${JSON.stringify(value)}\n`
        } else {
          result += `${key}\n${value}\n`
        }
      }
      // this.$store.state.paperToPPTData = JSON.stringify(uploadParams)
      this.$store.state.paperToPPTData = result
      this.$router.push({
        path: '/ppt',
        query: {
          getState: true
        }
      })
    },
    async downloadFile() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const nodes = this.nodes
      const uploadParams = {}
      Object.keys(this.nodeKeys).forEach(key => {
        uploadParams[key] = nodes[key].content
      })
      // 定义属性映射关系
      const propertyMap = [
        { from: 'embodiments', to: 'instants' },
        { from: 'claims', to: 'rights' },
        { from: 'definitions', to: 'definition' }
      ];

      // 批量处理属性赋值和删除
      propertyMap.forEach(({ from, to }) => {
        uploadParams[to] = uploadParams[from];
        delete uploadParams[from];
      });

      try {
        const res = await generateWord({
          data: JSON.stringify(uploadParams)
        })
        tracker.track({ functionName: '交底书转Word' })
        this.downloadBase64AsWord(res.draft_word, `${uploadParams.title}_${this.getFormattedDateTime()}.docx`)
        loading.close()
      } catch (error) {
        this.$message.error(error)
        loading.close()
      }
    },
    downloadBase64AsWord(base64String, fileName) {
      // 将 Base64 字符串转换为字节数组
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      // 创建 Blob 对象
      const blob = new Blob([byteArray], {
        type: 'application/msword'
        // 或者对于 .docx 文件使用：
        // type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放内存
      URL.revokeObjectURL(url);
    },
    goOutside(item) {
      window.open(item.link)
    },
    checkWebs() {
      this.drawer = true
    },
    handleClose() {
      this.drawer = false
    },
    //  * 转换发明内容数据格式：将 {key: {state, content}} 转为 {中文标题: content}
    transformInventionData(nodeKeys, contentData) {
      // 初始化结果对象
      const result = {};
      console.log();
      
      // 遍历nodeKeys的所有key（如title、definitions等）
      Object.keys(nodeKeys).forEach((key) => {
        // 从nodeKeys中获取当前key对应的中文标题
        const chineseTitle = nodeKeys[key].title;
        // 从内容数据中获取对应key的配置（包含state和content）
        const itemData = contentData[key];
        // 容错处理：如果contentData中没有该key，或state为false，内容设为空字符串
        const content = itemData.state ? itemData.content : '';
        // 特殊处理figures字段（数组格式，转为字符串描述）
        if (key === 'figures' && Array.isArray(content)) {
          // 将figures数组转为“图1：名称 - 描述；图2：名称 - 描述...”的格式
          result[chineseTitle] = JSON.stringify(content);
        } else {
          // 其他字段直接赋值（保留原始换行和格式）
          result[chineseTitle] = content || '';
        }
      });

      return result;
    },
    // 提取公共逻辑：组装 content 参数（新增/更新都需要）
    getCommonContent() {
      return JSON.stringify(this.transformInventionData(this.nodeKeys, this.nodes));
    },

    // 提取公共逻辑：接口成功后统一处理（刷新历史记录+提示）
    handleSuccess(successMsg) {
      this.$message.success(successMsg);
      this.$store.dispatch('getHistory'); // 统一刷新历史记录
    },

    // 新增历史记录（保持独立，仅处理新增逻辑）
    async handleHistorySave() {
      try {
        // 仅新增需要的参数
        const user_id = this.$store.state.user.userInfo.user_id;
        const { lineOne, lineTwo, lineThree, lineFour } = this.history_input_data;

        const params = {
          user_id: user_id,
          function_name: '交底书生成',
          title: '初稿',
          input_data: JSON.stringify({
            '标题': lineOne,
            '技术背景': lineTwo,
            '技术手段': lineThree,
            '技术效果': lineFour
          }),
          content: this.getCommonContent(), // 复用公共 content 逻辑
        };

        const res = await addHistory(params);
        if (res.status === 'success') {
          this.handleSuccess('保存成功，建议您尽快下载为Word！');
          this.history_id = res.data.id; // 仅新增需要保存 history_id
        } else {
          this.$message.warning(res.message);
        }
      } catch (error) {
        console.error('新增历史记录失败：', error);
        this.$message.error('保存失败，请重试！');
      }
    },

    // 更新历史记录（保持独立，仅处理更新逻辑）
    async handleHistoryUpdate() {
      try {
        // 仅更新需要的参数
        const params = {
          titel: '最终稿',
          content: this.getCommonContent(), // 复用公共 content 逻辑
          function_name: '交底书生成',
        };
        const res = await updateHistory(params, this.history_id);
        if (res.status === 'success') {
          this.handleSuccess('更新成功，建议您尽快下载为Word！');
        } else {
          this.$message.warning(res.message);
        }
      } catch (error) {
        console.error('更新历史记录失败：', error);
        this.$message.error('更新失败，请重试！');
      }
    },
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-drawer__header {
  padding-left: 22px !important;

  >span {
    color: #141B34;
    font-family: 'PingFang SC';
    font-size: 18px;
    line-height: 27px;
    font-weight: 600;
  }
}

.wbes-container {
  padding: 12px 22px 22px;

  .content-box {
    margin-bottom: 32px;
    cursor: pointer;

    .title {
      font-family: PingFang SC;
      font-size: 17px;
      font-weight: normal;
      line-height: 150%;
      letter-spacing: normal;
      color: #141B34;
      margin-bottom: 8px;
    }

    .content {
      font-family: PingFang SC;
      font-size: 16px;
      font-weight: normal;
      line-height: 150%;
      letter-spacing: normal;
      color: #718096;
    }
  }
}

.page-container {
  box-sizing: border-box;
  width: 100%;
  // min-height: 100vh;
  min-width: 1010px;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  padding: 16px;
  overflow: hidden;
  // background-color: #f5f7fa;
}

.content-wrapper,
.main-content,
.action-bar {
  box-sizing: border-box;
  width: 100%;
  max-width: 978px;
  height: auto;
  // min-height: 852px;
  display: flex;
  justify-content: flex-end;
}
</style>
