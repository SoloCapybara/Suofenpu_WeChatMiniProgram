const { categoryIconByCode, menuCategories } = require('../data/menu-category-data.js')

function inferCategory(dish) {
  const name = dish.name || ''
  if (/饮|甜|奶|茶|汁/.test(name)) return 'drinks'
  if (/酸笋|腐竹|卤蛋|虎皮|豆皮|小吃/.test(name)) return 'snacks'
  if (/加料|配菜|鸭脚|蛋|花生|木耳/.test(name)) return 'toppings'
  if (/套|套餐|组合/.test(name)) return 'combo'
  return 'noodles'
}

function hasKeyword(dish, keyword) {
  const value = (keyword || '').trim().toLowerCase()
  if (!value) return true
  return [dish.name, dish.shortDesc, dish.desc]
    .filter(Boolean)
    .some((text) => String(text).toLowerCase().includes(value))
}

function withMenuMeta(dish, index) {
  const category = dish.categoryCode || dish.category || inferCategory(dish)
  const isHot = index < 2 || dish.mark === '招'
  return {
    ...dish,
    category,
    badgeText: isHot ? '热销' : index === 2 ? '新品' : '',
  }
}

function normalizeCategories(categories) {
  const source = Array.isArray(categories) && categories.length ? categories : menuCategories
  return source.map((category) => {
    const key = category.key || category.code
    return {
      key,
      code: key,
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder || 0,
      icon: normalizeCategoryIcon(category.iconUrl || category.icon || categoryIconByCode[key] || categoryIconByCode.noodles),
    }
  })
}

function normalizeCategoryIcon(iconUrl) {
  if (iconUrl && iconUrl.startsWith('/icons/lucide/')) return `/assets${iconUrl}`
  if (!iconUrl || !iconUrl.startsWith('/uploads/')) return iconUrl
  return `${getApp().globalData.apiBaseUrl}${iconUrl}`
}

function buildMenuSections(dishes, categories = menuCategories, keyword = '') {
  const visibleDishes = dishes.map(withMenuMeta).filter((dish) => hasKeyword(dish, keyword))
  return normalizeCategories(categories).map((category) => {
    const items = category.key === 'recommend'
      ? visibleDishes.slice(0, 6)
      : visibleDishes.filter((dish) => dish.category === category.key)
    return {
      ...category,
      id: `menu-section-${category.key}`,
      items,
      visible: items.length > 0,
    }
  })
}

module.exports = {
  buildMenuSections,
  normalizeCategories,
  normalizeCategoryIcon,
}
