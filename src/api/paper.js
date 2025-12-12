import request from "../utils/request";// 获取runId

// 交底书生成/修改
export function queryRunAppProcess(data) {
  return request({
    url: '/api/proxy/api/v1/query_run_app_process',
    method: 'post',
    headers:{
      'Apikey': data.AppKey
    },
    data
  }) 
}

// 附图生成
export function generateFigure(data) {
  return request({
    url: '/generate_figure',
    method: 'post',
    data
  })
}

// 文件生成
export function generateWord(data) {
  return request({
    url: '/generate_word',
    method: 'post',
    data
  })
}

//点赞点踩接口
export function feedbacks(data) {
  return request({
    url: '/api3004/feedbacks',
    method: 'post',
    data
  })
}