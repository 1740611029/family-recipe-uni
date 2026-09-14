/**
 * GET /api/recipe/:id
 * 获取单个菜谱详情（公开，无需鉴权）
 * 对应原 uniCloud 云函数 getRecipe
 */

import { json, rowToRecipe } from '../../utils.js'

export async function onRequestGet(context) {
  const { env, params } = context
  const id = params.id

  if (!id) {
    return json({ code: 400, msg: '缺少菜谱ID' })
  }

  try {
    const row = await env.DB
      .prepare('SELECT * FROM recipes WHERE id = ?')
      .bind(id)
      .first()

    if (!row) {
      return json({ code: 404, msg: '菜谱不存在' })
    }

    return json({ code: 0, data: rowToRecipe(row) })
  } catch (e) {
    console.error('getRecipe error:', e)
    return json({ code: -1, msg: '获取菜谱失败' })
  }
}
