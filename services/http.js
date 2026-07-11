function request(options) {
  const app = getApp()
  const token = app.globalData.token || wx.getStorageSync('token') || ''
  const header = {
    ...(options.header || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url: `${app.globalData.apiBaseUrl}${options.url}`,
      header,
      success: resolve,
      fail: reject,
    })
  })
}

module.exports = {
  request,
}
