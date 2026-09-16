const { baseDishes } = require('../../../data/dish-data.js')
const { menuCategories: defaultMenuCategories } = require('../../../data/menu-category-data.js')
const { specOptions, spiceOptions, tablewareOptions } = require('../../../data/spec-data.js')
const { money } = require('../../../utils/money.js')
const { makeLineKey, buildViewState } = require('../../../models/cart-model.js')
const { transformDish } = require('../../../models/dish-model.js')
const { buildMenuSections, normalizeCategories } = require('../../../models/menu-model.js')
const { defaultSpecState, getSpecOption } = require('../../../models/spec-model.js')
const menuService = require('../../../services/menu-service.js')

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
  loadDishes() {
    if (this.data.menuLoading) return
    this.setData({ menuLoading: true })

    Promise.all([menuService.listCategories(), menuService.listDishes()])
      .then(([categoryResponse, dishResponse]) => {
        const categoryBody = categoryResponse.data || []
        const dishBody = dishResponse.data || []
        if (
          categoryResponse.statusCode >= 200
          && categoryResponse.statusCode < 300
          && dishResponse.statusCode >= 200
          && dishResponse.statusCode < 300
          && Array.isArray(categoryBody)
          && Array.isArray(dishBody)
        ) {
          const backendCategories = categoryBody.map((category) => ({
            key: category.code,
            id: category.id,
            code: category.code,
            name: category.name,
            sortOrder: category.sortOrder,
            iconUrl: category.iconUrl,
            icon: category.iconUrl,
          }))
          const menuCategories = normalizeCategories([defaultMenuCategories[0], ...backendCategories])
          const rawDishes = dishBody.map(transformDish).filter((dish) => dish.available)
          const viewState = buildViewState(this.data.rawCartItems, this.data.selectedCouponId, rawDishes)
          this.setData({
            menuCategories,
            activeMenuCategory: menuCategories[0]?.key || this.data.activeMenuCategory,
            activeMenuSectionId: `menu-section-${menuCategories[0]?.key || this.data.activeMenuCategory}`,
            rawDishes,
            menuLoading: false,
            ...viewState,
            ...menuViewState(viewState.dishes, menuCategories, this.data.menuKeyword),
          })
          return
        }
        this.setData({ menuLoading: false })
        wx.showToast({
          title: '商品接口异常',
          icon: 'none',
        })
      })
      .catch(() => {
        const viewState = buildViewState(this.data.rawCartItems, this.data.selectedCouponId, baseDishes)
        this.setData({
          menuLoading: false,
          rawDishes: baseDishes,
          ...viewState,
          ...menuViewState(viewState.dishes, this.data.menuCategories, this.data.menuKeyword),
        })
      })
  },

  onMenuSearchInput(event) {
    const menuKeyword = event.detail.value
    const nextMenuState = menuViewState(this.data.dishes, this.data.menuCategories, menuKeyword)
    this.setData({
      menuKeyword,
      ...nextMenuState,
    })
  },

  switchMenuCategory(event) {
    const key = event.currentTarget.dataset.key
    this.setData({
      activeMenuCategory: key,
      activeMenuSectionId: `menu-section-${key}`,
    })
  },

  openSpec(event) {
    if (!this.data.user) {
      this.openLogin()
      return
    }
    const dish = this.data.rawDishes.find((item) => item.id === event.currentTarget.dataset.id)
    if (!dish) return

    if (this._specCloseTimer) {
      clearTimeout(this._specCloseTimer)
      this._specCloseTimer = null
    }

    this.specSheetStartY = 0
    this.setData({
      showSpecModal: true,
      specSheetReady: false,
      specSheetTranslateY: 720,
      specSheetTransition: 'none',
      selectedDish: {
        ...dish,
        priceText: money(dish.price),
      },
      selectedSpec: specOptions[0].label,
      selectedSpice: spiceOptions[1],
      selectedTableware: tablewareOptions[0],
      specQty: 1,
      itemRemark: '',
      specTotalText: money(dish.price),
    }, () => {
      setTimeout(() => {
        if (!this.data.showSpecModal) return
        this.setData({
          specSheetReady: true,
          specSheetTranslateY: 0,
          specSheetTransition: 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
        })
      }, 24)
    })
  },

  closeSpec() {
    if (!this.data.showSpecModal) return
    this.specSheetStartY = 0
    this.setData({
      specSheetReady: false,
      specSheetTranslateY: 720,
      specSheetTransition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    })
    if (this._specCloseTimer) clearTimeout(this._specCloseTimer)
    this._specCloseTimer = setTimeout(() => {
      this._specCloseTimer = null
      this.setData({
        showSpecModal: false,
        specSheetTranslateY: 720,
        specSheetTransition: 'none',
        ...defaultSpecState(),
      })
    }, 280)
  },

  onSpecSheetTouchStart(event) {
    const touch = event.touches && event.touches[0]
    if (!touch || !this.data.showSpecModal) return
    this.specSheetStartY = touch.clientY
    this.setData({ specSheetTransition: 'none' })
  },

  onSpecSheetTouchMove(event) {
    const touch = event.touches && event.touches[0]
    if (!touch || !this.specSheetStartY) return
    const offsetY = touch.clientY - this.specSheetStartY
    if (offsetY <= 0) {
      if (this.data.specSheetTranslateY !== 0) {
        this.setData({ specSheetTranslateY: 0 })
      }
      return
    }
    this.setData({ specSheetTranslateY: Math.min(offsetY, 420) })
  },

  onSpecSheetTouchEnd() {
    if (!this.specSheetStartY) return
    const shouldClose = this.data.specSheetTranslateY > 96
    this.specSheetStartY = 0
    if (shouldClose) {
      this.closeSpec()
      return
    }
    this.setData({
      specSheetTranslateY: 0,
      specSheetTransition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
    })
  },

  chooseSpec(event) {
    this.setData({ selectedSpec: event.currentTarget.dataset.value }, this.updateSpecTotal)
  },

  chooseSpice(event) {
    this.setData({ selectedSpice: event.currentTarget.dataset.value })
  },

  chooseTableware(event) {
    this.setData({ selectedTableware: event.currentTarget.dataset.value })
  },

  changeSpecQty(event) {
    const nextQty = Math.max(1, this.data.specQty + Number(event.currentTarget.dataset.delta))
    this.setData({ specQty: nextQty }, this.updateSpecTotal)
  },

  onItemRemarkInput(event) {
    this.setData({ itemRemark: event.detail.value })
  },

  updateSpecTotal() {
    const dish = this.data.selectedDish
    if (!dish) return
    const spec = getSpecOption(this.data.selectedSpec)
    this.setData({
      specTotalText: money((dish.price + spec.price) * this.data.specQty),
    })
  },

  addConfiguredDish() {
    const dish = this.data.selectedDish
    if (!dish) return

    const spec = getSpecOption(this.data.selectedSpec)
    const remark = this.data.itemRemark.trim()
    const key = makeLineKey(
      dish.id,
      this.data.selectedSpec,
      this.data.selectedSpice,
      this.data.selectedTableware,
      remark,
    )
    const rawCartItems = [...this.data.rawCartItems]
    const existing = rawCartItems.find((item) => item.key === key)

    if (existing) {
      existing.qty += this.data.specQty
    } else {
      rawCartItems.push({
        key,
        dishId: dish.id,
        backendDishId: dish.backendId || Number(dish.id),
        name: dish.name,
        imageUrl: dish.imageUrl || '/assets/banner-1.jpg',
        spec: this.data.selectedSpec,
        spice: this.data.selectedSpice,
        tableware: this.data.selectedTableware,
        remark,
        unitPrice: dish.price + spec.price,
        qty: this.data.specQty,
      })
    }

    const viewState = buildViewState(rawCartItems, this.data.selectedCouponId, this.data.rawDishes)
    this.setData({
      rawCartItems,
      ...viewState,
      ...menuViewState(viewState.dishes, this.data.menuCategories, this.data.menuKeyword),
    })
    this.closeSpec()

    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
    })
  },

  reduceDish(event) {
    const dishId = event.currentTarget.dataset.id
    const rawCartItems = [...this.data.rawCartItems]
    let index = -1
    for (let i = rawCartItems.length - 1; i >= 0; i -= 1) {
      if (rawCartItems[i].dishId === dishId) {
        index = i
        break
      }
    }
    if (index < 0) return

    rawCartItems[index].qty -= 1
    if (rawCartItems[index].qty <= 0) rawCartItems.splice(index, 1)

    const viewState = buildViewState(rawCartItems, this.data.selectedCouponId, this.data.rawDishes)
    this.setData({
      rawCartItems,
      ...viewState,
      ...menuViewState(viewState.dishes, this.data.menuCategories, this.data.menuKeyword),
    })
  },
}
