/**
 * 今日推荐工具（Web版 - 后端接口版）
 *
 * 数据存储于 Cloudflare D1 的 recipes.recommendDate 字段
 * 通过 POST /api/recipe/recommend 切换推荐状态
 *
 * 规则：
 * - 一天可推荐多个菜谱（多个菜谱共享同一 recommendDate = today）
 * - 次日自动失效（查询时 WHERE recommendDate = today）
 * - 删除菜谱时推荐随之消失（数据行被删除）
 */

const API_BASE = '/api'

function getDateStr(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 调用后端接口切换推荐状态
 * @param {string} recipeId 菜谱ID
 * @param {Object} auth { account, password }
 * @returns {Promise<{code:number,msg?:string,action?:'add'|'remove'}>}
 */
function toggleRecommend(recipeId, auth) {
  const url = `${API_BASE}/recipe/recommend`
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account: auth && auth.account,
      password: auth && auth.password,
      id: String(recipeId),
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error('[toggleRecommend] 失败:', err)
      return { code: -1, msg: '网络错误，请重试' }
    })
}

export default {
  getDateStr,
  toggleRecommend,
}
