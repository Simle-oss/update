import request from "@/utils/request";
// 技术方案查新start
export function noveltyCheckStart(data) {
    return request({
        url: '/idea_check/start',
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'post',
        data: data
    })
}
// 技术方案查新result
export function ideaCheckResult(runId) {
    return request({
        url: `/idea_check/result/${runId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'get',
    })
}