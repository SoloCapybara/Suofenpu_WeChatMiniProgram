const storeService = require('../../../services/store-service.js')

module.exports = {
  loadStoreStatus() {
    return storeService.getStoreInfo()
      .then((response) => {
        const body = response.data || {}
        if (response.statusCode < 200 || response.statusCode >= 300) return
        const storeOpen = Boolean(body.storeOpen)
        this.setData({
          storeOpen,
          storeOpenText: body.statusLabel || (storeOpen ? '营业中' : '已打烊'),
        })
      })
      .catch(() => {})
  },
}
