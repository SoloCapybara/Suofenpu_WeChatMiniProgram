const { request } = require('./http.js')

function getCurrentUser() {
  return request({
    url: '/api/auth/me',
    method: 'GET',
  })
}

function loginByWechatCode(code) {
  return request({
    url: '/api/auth/wechat-login',
    method: 'POST',
    data: {
      code,
      nickname: '微信用户',
    },
  })
}

module.exports = {
  getCurrentUser,
  loginByWechatCode,
}
