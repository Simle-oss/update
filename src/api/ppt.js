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

//ppt生成
export function generatePPT(data) {
return request({
  url: '/generate_ppt',
  headers: {
      'Content-Type': 'application/json' ,
  },
  method: 'post',
  data:data
})
}
//文字提取
export function extractText(data) {
return request({
  url: '/extract_text',
  headers: {
      'Content-Type': 'multipart/form-data' ,
  },
  method: 'post',
  data:data
})
}