/**
 * GET /api/recipes
 * 获取所有菜谱列表（公开，无需鉴权）
 * 今日推荐（recommendDate = 今天）的菜谱置顶
 *
 * 注意：列表接口不返回图片本体（image 是 base64，单张 100~250KB），
 * 只返回 /api/recipe/image/:id 地址，由浏览器按需加载。
 * 否则 11 条菜谱一次就是 2MB，弱网必然超时。
 */

import { json, rowToListRecipe, getDateStr } from '../utils.js'

export async function onRequestGet(context) {
  const { env, request } = context

  try {
    const today = getDateStr()
    // 只取列表需要的字段，不 SELECT image
    const result = await env.DB
      .prepare(`
        SELECT id, name, description, recommendDate, createTime, updateTime,
               (image IS NOT NULL AND image <> '') AS hasImage
        FROM recipes
        ORDER BY
          CASE WHEN recommendDate = ? THEN 0 ELSE 1 END,
          createTime DESC
        LIMIT 200
      `)
      .bind(today)
      .all()

    const data = (result.results || []).map(rowToListRecipe)

    // 列表随时可能变化，允许缓存但每次必须回源校验
    return json(
      { code: 0, data },
      200,
      { 'Cache-Control': 'public, max-age=0, must-revalidate' }
    )
  } catch (e) {
    console.error('getRecipes error:', e)
    return json({ code: -1, msg: '获取菜谱列表失败' })
  }
}
