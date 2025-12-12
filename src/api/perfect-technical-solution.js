import request from "../utils/request";

// 工作流运行接口（获取runId）
export function runAppWorkFlow(data) {
return request({
url: '/api/proxy/api/v1/run_app_workflow',
  headers: {
      'Content-Type': 'application/json' ,
      'Apikey':data.AppKey
  },
  method: 'post',
  data:data
})
}

//工作流运行进展接口（获取返回数据）
export function queryRunAppProcess(data) {
return request({
url: '/api/proxy/api/v1/query_run_app_process',
  headers: {
      'Content-Type': 'application/json' ,
      'Apikey':data.AppKey
  },
  method: 'post',
  data:data
})
}

//技术方案查新start
export function ideaCheckStart(data) {
return request({
url: '/idea_check/start',
  headers: {
      'Content-Type': 'application/json' ,
  },
  method: 'post',
  data:data
})
}
//技术方案查新Result
export function ideaCheckResult(data) {
return request({
url: `/idea_check/result/${data.runId}`,
  headers: {
      'Content-Type': 'application/json' ,
  },
  method: 'get',
})
}
//获取鉴权token
export function getOauthToken(data) {
return request({
  url: 'https://connect.zhihuiya.com/oauth/token',
  headers: {
      'Content-Type': 'application/x-www-form-urlencoded' ,
  },
  // 认证信息（Basic Auth）
  auth: {
    username: process.env.VUE_APP_USER_NAME,
    password: process.env.VUE_APP_PASSWORD
  },
  // 请求参数（x-www-form-urlencoded格式）
  data: new URLSearchParams(data),
  method: 'post',
})
}

//获取专利pdf地址
// export function getPdfData(data) {
// return request({
//   url: 'https://connect.zhihuiya.com/basic-patent-data/pdf-data',
//   headers: {
//       'Content-Type': 'application/json' ,
//       'authorization': `Bearer ${data.token}`
//   },
//   method: 'get',
//   params:data
// })
// }

//点赞点踩接口
export function feedbacks(data) {
return request({
  url: '/feedbacks',
  headers: {
      'Content-Type': 'application/json' ,
  },
  method: 'post',
  data:data
})
}
