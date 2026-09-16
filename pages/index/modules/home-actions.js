const { banners: fallbackBanners } = require('../../../data/home-data.js')
const { transformBanner } = require('../../../models/banner-model.js')
const storeService = require('../../../services/store-service.js')

module.exports = {
  loadHomeBanners() {
    return storeService.getHomeBanners()
      .then((response) => {
        const body = response.data || []
        if (response.statusCode < 200 || response.statusCode >= 300 || !Array.isArray(body)) return
        const banners = body.map(transformBanner).filter((banner) => banner.image)
        if (!banners.length) return
        this.setData({ banners })
      })
      .catch(() => {})
  },

  ensureHomeBanners() {
    if (this.data.banners && this.data.banners.length) return
    this.setData({ banners: fallbackBanners })
  },
}
