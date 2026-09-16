module.exports = {
  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    this.setData({ tab })
    if (tab === 'home') {
      this.loadHomeBanners()
    }
    if (tab === 'orders') {
      this.loadMyOrders()
    }
    if (tab === 'menu') {
      this.loadDishes()
    }
    if (tab === 'mine') {
      this.loadStoreStatus()
    }
  },

  switchOrderTab(event) {
    const activeOrderTab = event.currentTarget.dataset.key
    this.setData({ activeOrderTab }, this.updateVisibleOrders)
  },

  updateVisibleOrders() {
    const activeOrderTab = this.data.activeOrderTab
    const visibleOrders = activeOrderTab === 'all'
      ? this.data.orders
      : this.data.orders.filter((order) => order.orderGroup === activeOrderTab)
    this.setData({ visibleOrders })
  },

  goCart() {
    this.setData({ tab: 'cart' })
  },

  goMineLogin() {
    this.openLogin()
  },

  handleServiceTap(event) {
    const title = event.currentTarget.dataset.title
    if (title === '外卖点餐' || title === '预约点餐') {
      this.requestLocation()
      return
    }
    if (title === '会员中心') {
      this.openLogin()
      return
    }
    if (title === '到店自取' || title === '扫码点餐') {
      this.setData({ tab: 'menu' })
    }
  },

  requestLocation() {
    if (!this.data.hasAgreedAgreement) {
      this.setData({ showAgreementModal: true })
      return
    }

    wx.getLocation({
      type: 'gcj02',
      success: (location) => {
        const locationText = `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
        this.setData({
          locationText,
          address: `已获取当前位置：${locationText}`,
        })
        wx.showToast({
          title: '已获取位置',
          icon: 'success',
        })
      },
      fail: () => {
        wx.showModal({
          title: '位置授权未开启',
          content: '需要获取位置来判断配送范围和填写收货地址，可在设置中重新授权。',
          confirmText: '去设置',
          success: (result) => {
            if (result.confirm) wx.openSetting()
          },
        })
      },
    })
  },

  noop() {},
}
