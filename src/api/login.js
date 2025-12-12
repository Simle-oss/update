import request from "../utils/request";
// 登录接口
export function login(data) {
  return request({
    url: "/api3004/users/login",
    method: "post",
    data: data,
  });
}
// 修改密码接口
export function updatePassword(data) {
  return request({
    url: "/api3004/users/password",
    method: "put",
    data: data,
  });
}
// 获取用户信息接口
export function getUserInfo() {
  return request({
    url: "/api3004/users/me",
    method: "get",
  });
}
// 弹框的通知接口
export function getNotice() {
  return request({
    url: "/api3007/notice",
    method: "get",
    data: {},
  });
}
// 研发云登录过后获取token接口
export function queryTokenByCode(code) {
  return request({
    url: "/api3008/oauth?code=" + code,
    method: "get",
    data: {},
  });
}
