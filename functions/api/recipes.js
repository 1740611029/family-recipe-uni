/**
 * GET /api/recipes
 * 获取所有菜谱列表（公开，无需鉴权）
 * 对应原 uniCloud 云函数 getRecipes
 */

import { json, rowToRecipe } from '../utils.js'

export async function onRequestGet(context) {
  const { env } = context

  try {
    const result = await env.DB
      .prepare('SELECT * FROM recipes ORDER BY createTime DESC LIMIT 200')
      .all()

    const data = (result.results || []).map(rowToRecipe)
    return json({ code: 0, data })
  } catch (e) {
    console.error('getRecipes error:', e)
    return json({ code: -1, msg: '获取菜谱列表失败' })
  }
}
