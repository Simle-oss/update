import request from "@/utils/request";

// 获取runId
export function runAppWorkFlow(data) {
   return request({
    url: '/api/proxy/api/v1/run_app_workflow',
    method: 'post',
    headers:{
      'Apikey': data.AppKey
    },
    data
  })
 
}