/**
 * POST /api/recipe/save
 * 新增 / 编辑菜谱（需管理员鉴权）
 * 对应原 uniCloud 云函数 saveRecipe
 */

import { json, checkAuth, formatDate, generateId, rowToRecipe } from '../../utils.js'

export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return json({ code: 400, msg: '请求参数错误' })
  }

  const { account, password, id, name, description, image, ingredients, steps } = body

  // 1. 鉴权
  if (!checkAuth(body)) {
    return json({ code: 401, msg: '无权限操作' })
  }

  // 2. 校验名称
  if (!name || !String(name).trim()) {
    return json({ code: 400, msg: '请输入菜谱名称' })
  }

  // 3. 清理空食材和空步骤
  const cleanIngredients = (ingredients || []).filter(s => s && s.trim())
  const cleanSteps = (steps || []).filter(s => s && s.trim())
  const now = formatDate(new Date())

  try {
    if (id) {
      // 更新
      await env.DB
        .prepare(`
          UPDATE recipes SET
            name = ?, description = ?, image = ?,
            ingredients = ?, steps = ?, updateTime = ?
          WHERE id = ?
        `)
        .bind(
          String(name).trim(),
          description || '',
          image || '',
          JSON.stringify(cleanIngredients),
          JSON.stringify(cleanSteps),
          now,
          id
        )
        .run()

      return json({ code: 0, msg: '修改成功' })
    } else {
      // 新增
      const newId = generateId()
      await env.DB
        .prepare(`
          INSERT INTO recipes (id, name, description, image, ingredients, steps, createTime, updateTime)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          newId,
          String(name).trim(),
          description || '',
          image || '',
          JSON.stringify(cleanIngredients),
          JSON.stringify(cleanSteps),
          now,
          now
        )
        .run()

      return json({ code: 0, msg: '添加成功', id: newId })
    }
  } catch (e) {
    console.error('saveRecipe error:', e)
    return json({ code: -1, msg: '保存失败，请重试' })
  }
}
