const { AGREEMENT_STORAGE_KEY } = require('../../../data/storage-keys.js')

module.exports = {
  toggleAgreementCheck() {
    this.setData({ agreementChecked: !this.data.agreementChecked })
  },

  acceptAgreement() {
    if (!this.data.agreementChecked) {
      wx.showToast({
        title: '请先勾选协议',
        icon: 'none',
      })
      return
    }
    wx.setStorageSync(AGREEMENT_STORAGE_KEY, true)
    this.setData({
      showAgreementModal: false,
      hasAgreedAgreement: true,
    })
  },

  browseOnly() {
    this.setData({
      showAgreementModal: false,
      hasAgreedAgreement: false,
      agreementChecked: false,
    })
  },

  openUserAgreement() {
    wx.showToast({
      title: '用户协议页面待接入',
      icon: 'none',
    })
  },

  openPrivacyPolicy() {
    wx.showToast({
      title: '隐私政策页面待接入',
      icon: 'none',
    })
  },
}
