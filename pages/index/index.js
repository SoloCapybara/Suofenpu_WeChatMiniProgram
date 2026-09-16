const { banners, services } = require('../../data/home-data.js')
const { baseDishes } = require('../../data/dish-data.js')
const { deliveryTimes, invoiceOptions, orderTabs } = require('../../data/order-data.js')
const { specOptions, spiceOptions, tablewareOptions } = require('../../data/spec-data.js')
const { menuCategories } = require('../../data/menu-category-data.js')
const { AGREEMENT_STORAGE_KEY } = require('../../data/storage-keys.js')
const { buildViewState } = require('../../models/cart-model.js')
const { buildMenuSections } = require('../../models/menu-model.js')
const { defaultSpecState } = require('../../models/spec-model.js')
const agreementActions = require('./modules/agreement-actions.js')
const authActions = require('./modules/auth-actions.js')
const navigationActions = require('./modules/navigation-actions.js')
const menuActions = require('./modules/menu-actions.js')
const orderCartActions = require('./modules/order-cart-actions.js')
const storeActions = require('./modules/store-actions.js')
const homeActions = require('./modules/home-actions.js')

const app = getApp()
const initialViewState = buildViewState([], 'new5', baseDishes)

Page({
  data: {
    tab: 'home',
    banners,
    services,
    specOptions,
    spiceOptions,
    tablewareOptions,
    deliveryTimes,
    invoiceOptions,
    orderTabs,
    menuCategories,
    activeMenuCategory: menuCategories[0].key,
    activeMenuSectionId: `menu-section-${menuCategories[0].key}`,
    menuKeyword: '',
    menuHasNoResult: false,
    menuSections: buildMenuSections(initialViewState.dishes, menuCategories),
    activeOrderTab: 'all',
    showSpecModal: false,
    specSheetReady: false,
    specSheetTranslateY: 720,
    specSheetTransition: 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
    showAgreementModal: false,
    agreementChecked: false,
    hasAgreedAgreement: false,
    showLoginModal: false,
    authSheetTranslateY: 0,
    authSheetTransition: 'transform 0.2s ease-out',
    loginAgreementChecked: true,
    loginLoading: false,
    menuLoading: false,
    orderLoading: false,
    locationText: '',
    user: null,
    rawDishes: baseDishes,
    rawCartItems: [],
    orders: [],
    visibleOrders: [],
    address: '桂林市七星区 漓江路 88 号',
    receiverPhone: '138 0000 8888',
    deliveryTime: deliveryTimes[0],
    invoiceType: invoiceOptions[0],
    orderRemark: '',
    orderRemarkLength: 0,
    storeOpen: true,
    storeOpenText: '营业中',
    ...defaultSpecState(),
    ...initialViewState,
  },

  onLoad() {
    const hasAgreedAgreement = Boolean(wx.getStorageSync(AGREEMENT_STORAGE_KEY))
    const token = wx.getStorageSync('token') || ''
    const cachedUser = wx.getStorageSync('user') || null

    if (token) app.globalData.token = token
    if (cachedUser) app.globalData.userInfo = cachedUser

    this.setData({
      hasAgreedAgreement,
      showAgreementModal: !hasAgreedAgreement,
      user: cachedUser ? this.toViewUser(cachedUser) : null,
    })

    this.loadDishes()
    this.loadStoreStatus()
    this.loadHomeBanners()
    if (token) {
      this.refreshCurrentUser()
      this.loadMyOrders()
    }
  },

  onShow() {
    this.loadStoreStatus()
    this.loadHomeBanners()
  },

  ...agreementActions,
  ...authActions,
  ...navigationActions,
  ...menuActions,
  ...orderCartActions,
  ...storeActions,
  ...homeActions,
})
