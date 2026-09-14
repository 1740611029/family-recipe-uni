/**
 * POST /api/recipe/delete
 * 删除菜谱（需管理员鉴权）
 * 对应原 uniCloud 云函数 deleteRecipe
 */

import { json, checkAuth } from '../../utils.js'

export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return json({ code: 400, msg: '请求参数错误' })
  }

  const { account, password, id } = body

  // 1. 鉴权
  if (!checkAuth(body)) {
    return json({ code: 401, msg: '无权限操作' })
  }

  // 2. 参数校验
  if (!id) {
    return json({ code: 400, msg: '缺少菜谱ID' })
  }

  try {
    // 删除数据库记录（图片是 base64 存储在 D1 中，无需单独删除文件）
    await env.DB
      .prepare('DELETE FROM recipes WHERE id = ?')
      .bind(id)
      .run()

    return json({ code: 0, msg: '删除成功' })
  } catch (e) {
    console.error('deleteRecipe error:', e)
    return json({ code: -1, msg: '删除失败，请重试' })
  }
}
