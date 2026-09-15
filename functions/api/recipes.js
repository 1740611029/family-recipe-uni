/**
 * GET /api/recipes
 * 获取所有菜谱列表（公开，无需鉴权）
 * 今日推荐（recommendDate = 今天）的菜谱置顶
 * 对应原 uniCloud 云函数 getRecipes
 */

import { json, rowToRecipe, getDateStr } from '../utils.js'

export async function onRequestGet(context) {
  const { env } = context

  try {
    const today = getDateStr()
    // 推荐置顶：recommendDate = today 的排前面，再按 createTime 倒序
    const result = await env.DB
      .prepare(`
        SELECT * FROM recipes
        ORDER BY
          CASE WHEN recommendDate = ? THEN 0 ELSE 1 END,
          createTime DESC
        LIMIT 200
      `)
      .bind(today)
      .all()

    const data = (result.results || []).map(rowToRecipe)
    return json({ code: 0, data })
  } catch (e) {
    console.error('getRecipes error:', e)
    return json({ code: -1, msg: '获取菜谱列表失败' })
  }
}
