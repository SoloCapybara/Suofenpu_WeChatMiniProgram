function normalizeBannerImage(imageUrl) {
  if (!imageUrl) return '/assets/banner-1.jpg'
  if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith('/assets/')) return imageUrl
  if (imageUrl.startsWith('/uploads/')) {
    const app = getApp()
    return `${app.globalData.apiBaseUrl}${imageUrl}`
  }
  return imageUrl
}

function transformBanner(banner) {
  return {
    image: normalizeBannerImage(banner.image || banner.imageUrl),
    title: banner.title || '',
    highlight: banner.highlight || '',
    badge: banner.badge || '',
  }
}

module.exports = {
  transformBanner,
}
