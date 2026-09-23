/**
 * 通用工具函数
 */

// JSON 响应
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  })
}

// 列表项的图片访问地址（按需加载，列表接口不返回图片本体）
export function imageUrlOf(id) {
  return `/api/recipe/image/${id}`
}

// 判断一行数据是否带有图片（不把图片内容读进响应）
export function hasImage(row) {
  if (!row) return false
  // SQL 里用 (image IS NOT NULL AND image <> '') AS hasImage 计算时直接取该字段
  if (row.hasImage !== undefined) return !!row.hasImage
  return !!(row.image && row.image.length > 0)
}

// 管理员鉴权
const ADMIN_ACCOUNT = 'admin'
const ADMIN_PASSWORD = 'admin'

export function checkAuth(body) {
  return body.account === ADMIN_ACCOUNT && body.password === ADMIN_PASSWORD
}

// 格式化日期时间
export function formatDate(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${mi}:${s}`
}

// 格式化为日期字符串 YYYY-MM-DD（用于推荐日期）
export function getDateStr(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 生成 UUID
export function generateId() {
  return crypto.randomUUID()
}

// 将 D1 行数据转换为前端格式（详情，含图片本体）
export function rowToRecipe(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    image: row.image || '',
    ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
    steps: row.steps ? JSON.parse(row.steps) : [],
    recommendDate: row.recommendDate || '',
    createTime: row.createTime || '',
    updateTime: row.updateTime || '',
  }
}

/**
 * 列表项格式：不包含图片 base64，只给图片访问地址
 * 图片由浏览器按需请求 /api/recipe/image/:id，避免一次拉回几 MB
 */
export function rowToListRecipe(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    image: hasImage(row) ? imageUrlOf(row.id) : '',
    hasImage: hasImage(row),
    ingredients: [],
    steps: [],
    recommendDate: row.recommendDate || '',
    createTime: row.createTime || '',
    updateTime: row.updateTime || '',
  }
}

// 详情格式：图片用访问地址代替本体（编辑时用 raw=1 拿原文）
export function rowToDetailRecipe(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    image: hasImage(row) ? imageUrlOf(row.id) : '',
    hasImage: hasImage(row),
    ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
    steps: row.steps ? JSON.parse(row.steps) : [],
    recommendDate: row.recommendDate || '',
    createTime: row.createTime || '',
    updateTime: row.updateTime || '',
  }
}
