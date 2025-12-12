import request from "@/utils/request";
// 获取历史记录接口
export function queryHistoryData(userid, limit = 5) {
  return request({
    url: "/api3004/history/recent/" + userid + "?limit=" + limit,
    method: "get",
    data: {},
  });
}
// 新增历史记录
export function addHistory(data) {
  return request({
    url: "/api3004/history",
    method: "post",
    data: data,
  });
}
// 更新历史记录
export function updateHistory(data, id) {
  return request({
    url: "/api3004/history/" + id,
    method: "patch",
    data: data,
  });
}
// 获取历史记录详细信息
export function getHistoryDetail(id) {
  return request({
    url: "/api3004/history/" + id,
    method: "get",
  });
}
