import http from './httpRequest.js'

// 登录
export const login = (data) => {
  return http({
    url: '/login',
    method: 'post',
    data
  })
}
// 修改密码
export const changePassword = (data) => {
  return http({
    url: '/modifyPwdByCode',
    method: 'put',
    data
  })
}
// 加入黑名单
export const blacklist = (id) => {
  return http({
    url: `/blacklist/add?userId=${id}`,
    method: 'post'
  })
}