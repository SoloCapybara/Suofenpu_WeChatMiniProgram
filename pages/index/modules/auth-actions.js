const { GUEST_AVATAR } = require('../../../data/storage-keys.js')
const authService = require('../../../services/auth-service.js')

const app = getApp()

module.exports = {
  openLogin() {
    if (this.data.user) return
    if (!this.data.hasAgreedAgreement) {
      this.setData({ showAgreementModal: true })
      return
    }
    this.authSheetStartY = 0
    this.setData({
      showLoginModal: true,
      authSheetTranslateY: 0,
      authSheetTransition: 'transform 0.2s ease-out',
    })
  },

  closeLogin() {
    this.authSheetStartY = 0
    this.setData({
      showLoginModal: false,
      loginLoading: false,
      authSheetTranslateY: 0,
      authSheetTransition: 'transform 0.2s ease-out',
    })
  },

  onAuthSheetTouchStart(event) {
    const touch = event.touches && event.touches[0]
    if (!touch) return
    this.authSheetStartY = touch.clientY
    this.setData({ authSheetTransition: 'none' })
  },

  onAuthSheetTouchMove(event) {
    const touch = event.touches && event.touches[0]
    if (!touch || !this.authSheetStartY) return
    const offsetY = touch.clientY - this.authSheetStartY
    if (offsetY <= 0) {
      this.setData({ authSheetTranslateY: 0 })
      return
    }
    this.setData({ authSheetTranslateY: Math.min(offsetY, 280) })
  },

  onAuthSheetTouchEnd() {
    const shouldClose = this.data.authSheetTranslateY > 90
    this.authSheetStartY = 0
    if (shouldClose) {
      this.setData({
        authSheetTranslateY: 640,
        authSheetTransition: 'transform 0.18s ease-in',
      })
      setTimeout(() => {
        if (this.data.showLoginModal) this.closeLogin()
      }, 180)
      return
    }
    this.setData({
      authSheetTranslateY: 0,
      authSheetTransition: 'transform 0.2s ease-out',
    })
  },

  toggleLoginAgreement() {
    this.setData({ loginAgreementChecked: !this.data.loginAgreementChecked })
  },

  toViewUser(user) {
    const name = user.nickname || '嗦粉会员'
    return {
      name,
      phone: user.phone || '未绑定手机号',
      avatarUrl: user.avatarUrl || GUEST_AVATAR,
    }
  },

  saveLoggedInUser(user, token) {
    wx.setStorageSync('token', token)
    wx.setStorageSync('user', user)
    app.globalData.token = token
    app.globalData.userInfo = user

    this.setData({
      user: this.toViewUser(user),
      showLoginModal: false,
      loginLoading: false,
    })
    this.loadMyOrders()
    wx.showToast({
      title: '登录成功',
      icon: 'success',
    })
  },

  refreshCurrentUser() {
    authService.getCurrentUser().then((response) => {
      const user = response.data || null
      if (response.statusCode >= 200 && response.statusCode < 300 && user && user.id) {
        wx.setStorageSync('user', user)
        app.globalData.userInfo = user
        this.setData({ user: this.toViewUser(user) })
      }
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后将无法同步会员权益和历史订单，确认退出吗？',
      confirmText: '退出',
      confirmColor: '#ef3d32',
      success: (result) => {
        if (!result.confirm) return

        wx.removeStorageSync('token')
        wx.removeStorageSync('user')
        app.globalData.token = ''
        app.globalData.userInfo = null

        this.setData({
          user: null,
          showLoginModal: false,
          loginLoading: false,
        })

        wx.showToast({
          title: '已退出登录',
          icon: 'success',
        })
      },
    })
  },

  wechatLogin() {
    if (!this.data.loginAgreementChecked) {
      wx.showToast({
        title: '请先同意协议',
        icon: 'none',
      })
      return
    }
    if (this.data.loginLoading) return

    this.setData({ loginLoading: true })
    wx.login({
      success: (loginResult) => {
        if (!loginResult.code) {
          this.setData({ loginLoading: false })
          wx.showToast({
            title: '微信登录失败',
            icon: 'none',
          })
          return
        }

        authService.loginByWechatCode(loginResult.code)
          .then((response) => {
            const body = response.data || {}
            if (response.statusCode >= 200 && response.statusCode < 300 && body.token && body.user) {
              this.saveLoggedInUser(body.user, body.token)
              return
            }
            this.setData({ loginLoading: false })
            wx.showToast({
              title: body.message || '登录接口异常',
              icon: 'none',
            })
          })
          .catch((error) => {
            this.setData({ loginLoading: false })
            console.error('微信登录请求本地后端失败', error)
            wx.showModal({
              title: '登录请求失败',
              content: `本地后端可用，但小程序请求失败：${error.errMsg || '未知错误'}。请确认开发者工具已关闭合法域名校验。`,
              showCancel: false,
            })
          })
      },
      fail: () => {
        this.setData({ loginLoading: false })
        wx.showToast({
          title: '微信登录失败',
          icon: 'none',
        })
      },
    })
  },

  phoneLoginTodo() {
    wx.showToast({
      title: '手机号验证码后续接入',
      icon: 'none',
    })
  },
}
