const { coupons } = require('../../../data/pricing-data.js')
const { buildViewState } = require('../../../models/cart-model.js')
const { buildMenuSections } = require('../../../models/menu-model.js')
const { transformOrder } = require('../../../models/order-model.js')
const orderService = require('../../../services/order-service.js')

function hasNoMenuResult(sections, keyword) {
  return Boolean(keyword && sections.every((section) => section.items.length === 0))
}

function menuViewState(dishes, categories, keyword) {
  const menuSections = buildMenuSections(dishes, categories, keyword)
  return {
    menuSections,
    menuHasNoResult: hasNoMenuResult(menuSections, keyword),
  }
}

module.exports = {
  loadMyOrders() {
    if (!this.data.user || this.data.orderLoading) return
    this.setData({ orderLoading: true })

    orderService.listMyOrders()
      .then((response) => {
        const body = response.data || []
        if (response.statusCode >= 200 && response.statusCode < 300 && Array.isArray(body)) {
          this.setData({
            orders: body.map(transformOrder),
            orderLoading: false,
          }, this.updateVisibleOrders)
          return
        }
        this.setData({ orderLoading: false })
        wx.showToast({
          title: body.message || '订单加载失败',
          icon: 'none',
        })
      })
      .catch(() => {
        this.setData({ orderLoading: false })
        wx.showToast({
          title: '订单接口未连接',
          icon: 'none',
        })
      })
  },

  changeCartItemQty(event) {
    const { key, delta } = event.currentTarget.dataset
    const rawCartItems = this.data.rawCartItems
      .map((item) => (item.key === key ? { ...item, qty: item.qty + Number(delta) } : item))
      .filter((item) => item.qty > 0)

    const viewState = buildViewState(rawCartItems, this.data.selectedCouponId, this.data.rawDishes)
    this.setData({
      rawCartItems,
      ...viewState,
      ...menuViewState(viewState.dishes, this.data.menuCategories, this.data.menuKeyword),
    })
  },

  chooseCoupon(event) {
    const couponId = event.currentTarget.dataset.id
    const coupon = coupons.find((item) => item.id === couponId)
    if (!coupon || this.data.subtotal < coupon.minSpend) return

    const viewState = buildViewState(this.data.rawCartItems, couponId, this.data.rawDishes)
    this.setData({
      ...viewState,
      ...menuViewState(viewState.dishes, this.data.menuCategories, this.data.menuKeyword),
    })
  },

  chooseDeliveryTime(event) {
    this.setData({ deliveryTime: event.currentTarget.dataset.value })
  },

  chooseInvoice(event) {
    this.setData({ invoiceType: event.currentTarget.dataset.value })
  },

  onAddressInput(event) {
    this.setData({ address: event.detail.value })
  },

  onPhoneInput(event) {
    this.setData({ receiverPhone: event.detail.value })
  },

  onOrderRemarkInput(event) {
    this.setData({
      orderRemark: event.detail.value,
      orderRemarkLength: event.detail.value.length,
    })
  },

  placeOrder() {
    if (!this.data.cartItems.length) return
    if (!this.data.user) {
      this.openLogin()
      return
    }

    if (!this.data.receiverPhone.trim()) {
      wx.showToast({
        title: '请填写联系电话',
        icon: 'none',
      })
      return
    }

    if (!this.data.address.trim()) {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'none',
      })
      return
    }

    wx.showLoading({ title: '提交中' })
    orderService.createOrder({
      customerName: this.data.user.name,
      phone: this.data.receiverPhone,
      address: this.data.address,
      deliveryTime: this.data.deliveryTime,
      invoiceType: this.data.invoiceType,
      orderRemark: this.data.orderRemark,
      couponId: this.data.selectedCouponId,
      items: this.data.cartItems.map((item) => ({
        dishId: item.backendDishId,
        spec: item.spec,
        spice: item.spice,
        tableware: item.tableware,
        itemRemark: item.remark,
        quantity: item.qty,
      })),
    })
      .then((response) => {
        wx.hideLoading()
        const body = response.data || {}
        if (response.statusCode >= 200 && response.statusCode < 300 && body.orderNo) {
          const order = transformOrder(body)
          const viewState = buildViewState([], 'new5', this.data.rawDishes)
          this.setData({
            tab: 'orders',
            rawCartItems: [],
            orders: [order, ...this.data.orders],
            orderRemark: '',
            orderRemarkLength: 0,
            ...viewState,
            ...menuViewState(viewState.dishes, this.data.menuCategories, this.data.menuKeyword),
          }, this.updateVisibleOrders)
          this.loadDishes()
          wx.showToast({
            title: '订单已提交',
            icon: 'success',
          })
          return
        }
        wx.showToast({
          title: body.message || '提交失败',
          icon: 'none',
        })
      })
      .catch(() => {
        wx.hideLoading()
        wx.showToast({
          title: '下单接口未连接',
          icon: 'none',
        })
      })
  },
}
