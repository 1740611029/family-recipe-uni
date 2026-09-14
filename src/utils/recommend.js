/**
 * 今日推荐数据工具（Web版 - V2 多推荐版）
 *
 * Storage Key: todayRecommend
 * 数据结构: { recommendDate: 'YYYY-MM-DD', recipeIds: ['id1', 'id2', ...] }
 *
 * 规则：
 * - 一天可推荐多个菜谱；重新推荐同一个不会重复
 * - 可随时取消某个推荐
 * - 推荐只在当天有效，第二天自动失效并清除
 * - 推荐菜谱被删除时同步从推荐列表移除
 */

const RECOMMEND_KEY = 'todayRecommend'

function getDateStr(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object') return { recommendDate: '', recipeIds: [] }
  if (!raw.recommendDate || !Array.isArray(raw.recipeIds)) {
    return { recommendDate: '', recipeIds: [] }
  }
  return { recommendDate: raw.recommendDate, recipeIds: raw.recipeIds }
}

function getRawRecommend() {
  try {
    const str = localStorage.getItem(RECOMMEND_KEY)
    if (!str) return { recommendDate: '', recipeIds: [] }
    const parsed = JSON.parse(str)
    // V1 旧数据自动清除（无 recommendDate 字段）
    if (parsed && typeof parsed === 'object' && !parsed.recommendDate) {
      localStorage.removeItem(RECOMMEND_KEY)
      return { recommendDate: '', recipeIds: [] }
    }
    return normalize(parsed)
  } catch (e) {
    return { recommendDate: '', recipeIds: [] }
  }
}

function writeRaw(obj) {
  localStorage.setItem(RECOMMEND_KEY, JSON.stringify(obj))
}

function getTodayRecommendIds() {
  const data = getRawRecommend()
  const today = getDateStr()
  if (data.recommendDate !== today) {
    if (data.recommendDate) localStorage.removeItem(RECOMMEND_KEY)
    return []
  }
  return data.recipeIds.slice()
}

function getTodayRecommend() {
  const data = getRawRecommend()
  const today = getDateStr()
  if (data.recommendDate !== today) {
    if (data.recommendDate) localStorage.removeItem(RECOMMEND_KEY)
    return { recipeIds: [], recommendDate: '' }
  }
  return { recipeIds: data.recipeIds.slice(), recommendDate: data.recommendDate }
}

function isRecommended(recipeId) {
  const ids = getTodayRecommendIds()
  return ids.includes(String(recipeId))
}

function ensureToday() {
  const data = getRawRecommend()
  const today = getDateStr()
  if (data.recommendDate !== today) {
    const fresh = { recommendDate: today, recipeIds: [] }
    writeRaw(fresh)
    return fresh
  }
  return data
}

function addRecommend(recipeId) {
  const data = ensureToday()
  const id = String(recipeId)
  if (data.recipeIds.includes(id)) return false
  data.recipeIds.push(id)
  writeRaw(data)
  return true
}

function removeRecommend(recipeId) {
  const data = getRawRecommend()
  const today = getDateStr()
  if (data.recommendDate !== today) {
    if (data.recommendDate) localStorage.removeItem(RECOMMEND_KEY)
    return false
  }
  const id = String(recipeId)
  const idx = data.recipeIds.indexOf(id)
  if (idx === -1) return false
  data.recipeIds.splice(idx, 1)
  writeRaw(data)
  return true
}

function toggleRecommend(recipeId) {
  const id = String(recipeId)
  if (isRecommended(id)) {
    removeRecommend(id)
    return { action: 'remove' }
  } else {
    addRecommend(id)
    return { action: 'add' }
  }
}

function clearTodayRecommend() {
  localStorage.removeItem(RECOMMEND_KEY)
}

function clearIfMatches(recipeId) {
  removeRecommend(recipeId)
}

export default {
  getDateStr,
  getRawRecommend,
  getTodayRecommend,
  getTodayRecommendIds,
  isRecommended,
  addRecommend,
  removeRecommend,
  toggleRecommend,
  clearTodayRecommend,
  clearIfMatches,
}
