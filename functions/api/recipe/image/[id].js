/**
 * GET /api/recipe/image/:id
 * 返回菜谱图片的二进制内容（从 D1 里的 base64 还原）
 *
 * 用 ETag + no-cache：图片不变时浏览器只花几百字节校验（304），
 * 图片换了则立即生效，不会缓存住旧图。
 */

function base64ToBytes(b64) {
  const binStr = atob(b64)
  const bytes = new Uint8Array(binStr.length)
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i)
  }
  return bytes
}

export async function onRequestGet(context) {
  const { env, params, request } = context
  const id = params.id

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  try {
    const row = await env.DB
      .prepare('SELECT image, updateTime FROM recipes WHERE id = ?')
      .bind(id)
      .first()

    if (!row || !row.image) {
      return new Response('Not found', { status: 404 })
    }

    const matched = /^data:([^;,]+)?;base64,([\s\S]+)$/.exec(row.image)
    if (!matched) {
      return new Response('Bad image data', { status: 500 })
    }

    const mime = matched[1] || 'image/jpeg'
    const payload = matched[2]

    // 低成本 ETag：不去做哈希，避免大图消耗 CPU
    const etag = `"${id}-${row.updateTime || '0'}-${payload.length}"`

    const headers = {
      'Content-Type': mime,
      'Cache-Control': 'public, no-cache',
      'ETag': etag,
      'Access-Control-Allow-Origin': '*',
    }

    if (request.headers.get('If-None-Match') === etag) {
      return new Response(null, { status: 304, headers })
    }

    return new Response(base64ToBytes(payload), { status: 200, headers })
  } catch (e) {
    console.error('getRecipeImage error:', e)
    return new Response('Internal error', { status: 500 })
  }
}
