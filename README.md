<h1 align="center">Welcome to vue-clean-admin 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> 一个简单干净的后台管理框架

### 🏠 [Homepage](https://gitee.com/caihai123/vue-clean-admin)

> 本项目技术栈基于 [vue2](https://cn.vuejs.org/)、[vuex](https://vuex.vuejs.org/zh/)、[vue-router](https://router.vuejs.org/zh/) 、[vue-cli](https://cli.vuejs.org/zh/guide/) 、[axios](http://www.axios-js.com/) 和 [element-ui](https://element.eleme.cn/#/zh-CN)

### 目录结构

```bash
├── public                     # 静态资源
│   │── favicon.ico            # favicon图标
│   └── index.html             # html模板
├── src                        # 源代码
│   ├── assets                 # 图片，文件等静态资源
│   ├── components             # 全局公用组件
│   ├── directive              # 全局指令
│   ├── filters                # 全局 filter
│   ├── layout                 # 全局 layout
│   ├── mixin                  # 全局 mixin
│   ├── pages                  # 业务相关页面
│   ├── router                 # 路由
│   ├── store                  # 全局 store管理
│   ├── styles                 # 全局样式
│   ├── utils                  # 全局公用方法
│   ├── variables              # 全局css变量
│   ├── views                  # 所有框架自带的页面
│   ├── App.vue                # 入口页面
│   ├── main.js                # 入口文件 加载组件 初始化等
│   └── permission.js          # 权限管理
├── .browserslistrc            # 配置兼容浏览器
├── .eslintrc.js               # ESLint规则
├── .gitignore                 # git忽略文件配置
├── .prettierrc.js             # prettier配置
├── package-lock.json          # 依赖版本描述文件
├── package.json               # package.json
├── README.md                  # 项目描述文件
└── vue.config.js              # vue-cli 配置
```
## 预览链接



## 安装

```sh
# 克隆项目
git clone https://github.com/caihai123/vue-clean-admin.git

# 进入项目目录
cd vue-element-admin

# 安装依赖，不要用 cnpm或者yarn 安装
npm install 
# or 
npm i --registry=https://registry.npm.taobao.org

# 本地开发 启动项目
npm run dev

# 构建打包
npm run build

# 代码修复
npm run lint
```

## 权限配置
+ 菜单权限
> 本项目对菜单控制的思路和统一授权平台存在差异，我做了一点简单的处理，可以参考`src/permissions.js`，所以你需要注意以下几点：
> 1. 为了能在本项目中能区分页面和目录，在配置菜单时你需要将目录的 `routePath` 字段设置为`'/'`。
> 2. 所有的子页面我都认为不应该出现在侧边栏菜单中，但是它依然需要在菜单中配置权限及嵌套关系。
> 3. 必须存在一个永远不能删除的导航，目前我将他定为首页（`routePath` = `'/index'`）。
> 4. 应该给所有的用户都开通首页的访问权限。

+ 按钮权限
> 我在 `el-button` 上添加了一个 `authButKey` 属性，只需要传入当前按钮的权限标识即可。

## 开发规范及注意事项
+ 所有页面都应该是一级页面，否则会没有路由缓存
+ 所有页面都必须同时在页面和路由配置中添加 `name` 属性，否则也不会有路由缓存
+ `@/utils/axios.js` 中存在两个 `axios `实例，分别用来发起统一权限的请求和业务相关请求，必须严格区分
+ 所有字典都在 `@/utils/dict.js` 中维护，需要时可配合 `@/components/DictSelect.vue` 或全局过滤器 `dictParse` 使用
+ 只可以使用`vue-router`中的`query`传参方式，其他方式可能会破坏掉导航和路由缓存的某些特性
+ 在统一授权和路由表中配置菜单时必须以`/`开头
 
## git commit 代码提交规范
> 格式：【type】description

可选`type`:
- 【新增】添加登录页面
- 【修复】修改登录时不传入密码的bug
- 【优化】调整登录逻辑
- 【样式】调整登录页样式（格式化代码）
- 【文档】update README.md
- 【重构】重构登录页
- 【合并】代码合并
- 【删除】删除登录页
- 【更新】修改eslint规则

## 前端开发规范
- 所有的Component文件都是以大写开头 (PascalCase)，所有的.js文件都遵循横线连接 (kebab-case)，在pages文件下，代表路由的.vue文件都使用横线连接 (kebab-case)，代表路由的文件夹也是使用同样的规则。
- 单组件代码不能超过1000行。
- 尽量使用适应能力较强的布局方式，页面不能出现横向滚动条，必须保证1200px以上页面能正常显示
- `el-table`除特殊情况必须添加`border`(带有纵向边框)
- 不要过渡修改组件默认样式，必须保证所有页面保持一致的风格
- 所有从接口返回的数据容易出错的地方都必须做容错处理（考虑特殊情况）
- 组件中添加定时器或者通过`addEventListener`添加事件时，必须跟着组件一起销毁或卸载。
- 错误颜色使用和`ElementUi`一致的`#f56c6c`
- vue中，`data`中的属性应和`template`的结构保持对应关系，合理空行分隔或使用对象包裹，不要存在不使用的变量
- 熟读`vue`和`ElementUi`文档，用最合理的组件或api做对应的事
- 写代码的流程应该是先思考（规划，设计），然后才开始写（而不是一边写一边调）
- 不要使用图片做图标，使用字体图标
- 不要安装不流行的插件，周下载量最少应该过万
- 分页数据新增后跳转到第一页，编辑或删除后刷新当前页
- 所有弹窗都固定宽度，不要设置百分比宽度，最大宽度为1000px，内容过多时尽量使用弹窗内滚动。
- 所有数据字典统一前端`@/utils/dict.js`中维护，配合`@/components/DictSelect.vue`或`@/filters/index.js`中的'dictParse'使用
- 在'v-for'中不要使用'index'(索引)作为'key'值
- 'mixin'中的所有可访问属性（[props, data, computed, methods]）都必须以`m_`开头，普通组件不要以`m_`开头命名
- 尽量避免多余的父节点，不允许出现无意义多余的代码或dom
- 任何时候都要用尽量小的复杂度和尽量少的标签来解决问题。（任何一个复杂的逻辑都是多个简单的逻辑组成）
- 不要在任何位置使用`import`(js中)或`@import url()`(css中)导入非全局css文件
- 不要在内置对象的原型上添加方法，如Vue, Array, Date
- 删除数据时必须二次确认
- 表格操作栏永远浮动在最右侧
- 在生产环境中，保持控制台干净，不要打印无意义的内容
- 文字按钮之外的其他按钮不带图标的情况文字中间加空格
- 任何操作都必须有对应的响应
- 合理使用`@`别名，不要出现类似`../../../`。
- 写代码要聪明一点

## Author

👤 **caihai123**


## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_