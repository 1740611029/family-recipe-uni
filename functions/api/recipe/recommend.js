/**
 * POST /api/recipe/recommend
 * 切换菜谱的"今日推荐"状态（需管理员鉴权）
 *
 * 逻辑：
 * - 若当前 recommendDate = 今天，则取消（清空）
 * - 否则设为今天（覆盖旧日期，自动实现"次日失效"语义）
 *
 * 请求体: { account, password, id }
 * 响应: { code, msg, action: 'add' | 'remove' }
 */

import { json, checkAuth, getDateStr } from '../../utils.js'

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

  const today = getDateStr()

  try {
    const row = await env.DB
      .prepare('SELECT recommendDate FROM recipes WHERE id = ?')
      .bind(id)
      .first()

    if (!row) {
      return json({ code: 404, msg: '菜谱不存在' })
    }

    // 已是今日推荐 → 取消；否则设为今天
    if (row.recommendDate === today) {
      await env.DB
        .prepare('UPDATE recipes SET recommendDate = ? WHERE id = ?')
        .bind('', id)
        .run()
      return json({ code: 0, msg: '已取消推荐', action: 'remove' })
    } else {
      await env.DB
        .prepare('UPDATE recipes SET recommendDate = ? WHERE id = ?')
        .bind(today, id)
        .run()
      return json({ code: 0, msg: '已加入今日推荐', action: 'add' })
    }
  } catch (e) {
    console.error('recommend error:', e)
    return json({ code: -1, msg: '操作失败，请重试' })
  }
}
