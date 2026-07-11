// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:8080',
    userInfo: null,
    token: wx.getStorageSync('token') || '',
  }
})
