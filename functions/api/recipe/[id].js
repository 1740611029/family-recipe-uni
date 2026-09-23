/**
 * GET /api/recipe/:id
 * 获取单个菜谱详情（公开，无需鉴权）
 *
 * 默认不返回图片本体，image 是 /api/recipe/image/:id 地址。
 * 编辑页需要原图 base64 时加 ?raw=1（只有编辑场景才付这个流量）。
 */

import { json, rowToRecipe, rowToDetailRecipe } from '../../utils.js'

export async function onRequestGet(context) {
  const { env, params, request } = context
  const id = params.id

  if (!id) {
    return json({ code: 400, msg: '缺少菜谱ID' })
  }

  const wantRaw = new URL(request.url).searchParams.get('raw') === '1'

  try {
    if (wantRaw) {
      const row = await env.DB
        .prepare('SELECT * FROM recipes WHERE id = ?')
        .bind(id)
        .first()

      if (!row) {
        return json({ code: 404, msg: '菜谱不存在' })
      }
      // 原图只在编辑时用，不需要缓存
      return json({ code: 0, data: rowToRecipe(row) }, 200, {
        'Cache-Control': 'no-store',
      })
    }

    const row = await env.DB
      .prepare(`
        SELECT id, name, description, ingredients, steps, recommendDate, createTime, updateTime,
               (image IS NOT NULL AND image <> '') AS hasImage
        FROM recipes WHERE id = ?
      `)
      .bind(id)
      .first()

    if (!row) {
      return json({ code: 404, msg: '菜谱不存在' })
    }

    return json(
      { code: 0, data: rowToDetailRecipe(row) },
      200,
      { 'Cache-Control': 'public, max-age=0, must-revalidate' }
    )
  } catch (e) {
    console.error('getRecipe error:', e)
    return json({ code: -1, msg: '获取菜谱失败' })
  }
}
