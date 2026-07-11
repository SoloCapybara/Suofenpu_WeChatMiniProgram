function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return '/assets/banner-1.jpg'
  if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith('/assets/')) return imageUrl
  if (imageUrl.startsWith('/uploads/')) {
    const app = getApp()
    return `${app.globalData.apiBaseUrl}${imageUrl}`
  }
  return imageUrl
}

function transformDish(dish, index) {
  return {
    id: String(dish.id),
    backendId: Number(dish.id),
    mark: ['招', '辣', '鸭', '笋'][index % 4],
    name: dish.name,
    shortDesc: dish.shortDescription || dish.name,
    desc: dish.description || dish.shortDescription || dish.name,
    price: Number(dish.price || 0),
    imageUrl: normalizeImageUrl(dish.imageUrl),
    stock: Number(dish.stock || 0),
    available: Boolean(dish.available),
    categoryId: dish.categoryId,
    categoryCode: dish.categoryCode,
    categoryName: dish.categoryName,
    categorySortOrder: Number(dish.categorySortOrder || 0),
  }
}

module.exports = {
  transformDish,
}
