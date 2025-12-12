// 打包时间（启动时间）
const nowDate = new Date();
const buildDate = `${nowDate.getFullYear() +
  "-" +
  (nowDate.getMonth() + 1) +
  "-" +
  nowDate.getDate() +
  " " +
  nowDate.getHours() +
  ":" +
  nowDate.getMinutes() +
  ":" +
  nowDate.getSeconds()}`;

module.exports = {
  productionSourceMap: true, // 生产环境是否生成 sourceMap 文件
  filenameHashing: true, //是否在文件名中包含了 hash 以便更好的控制缓存
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0]["process.env"].buildDate = JSON.stringify(buildDate);
      return args;
    });
  },
  devServer: {
    // proxy: 'https://api.coze.cn',
    // https: false,
    // open: 'Chrome'//构建完成之后自动打开谷歌
    proxy: {
      "api/proxy": {
        // target: 'https://hiagent.ctlabs.com.cn',
        target: "https://172.28.73.25:32300",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          // '^/': ''
        },
      },
      "/idea_check": {
        target: "https://172.28.160.179:3005",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/": "",
        },
      },
      "/api3004": {
        // 匹配所有以 /api3004 开头的请求（包括 /api3004/action_logs）
        target: "https://172.28.160.179:3004",
        ws: false,
        changeOrigin: true,
        pathRewrite: { "^/api3004": "" }, // 去掉前缀，转发为目标服务器的 /action_logs
      },
      "/api3007": {
        // 匹配所有以 /api3007 开头的请求（包括 /api3007/action_logs）
        target: "https://172.28.160.179:3007",
        ws: false,
        changeOrigin: true,
        pathRewrite: { "^/api3007": "" }, // 去掉前缀，转发为目标服务器的 /action_logs
      },
      "/api3008": {
        // 匹配所有以 /api3007 开头的请求（包括 /api3007/action_logs）
        target: "https://172.28.160.179:3008",
        ws: false,
        changeOrigin: true,
        pathRewrite: { "^/api3008": "" }, // 去掉前缀，转发为目标服务器的 /action_logs
      },
      "/generate_figure": {
        target: "https://172.28.160.179:3003",
        ws: false,
        changeOrigin: true,
      },
      "/generate_word": {
        target: "https://172.28.160.179:3000",
        ws: false,
        changeOrigin: true,
      },
      "/generate_ppt": {
        target: "https://172.28.160.179:3002",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/": "",
        },
      },
      "/extract_text": {
        target: "https://172.28.160.179:3006",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/": "",
        },
      },
    },
  },
  publicPath: "./",
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "~@/variables/style.scss";`,
      },
    },
  },
  configureWebpack: {
    module: {
      rules: [
        // {
        //   test: /\.vue$/,
        //   loader: 'vue-loader'
        // },
        // {
        //   test: /\.js$/,
        //   loader: 'babel-loader',
        //   exclude: /node_modules/
        // },
        // {
        //   test: /\.css$/,
        //   use: ['style-loader', 'css-loader']
        // },
        // 添加其他所需的 loader
      ],
    },
  },
};
