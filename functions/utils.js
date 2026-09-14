/**
 * 通用工具函数
 */

// JSON 响应
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
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

// 生成 UUID
export function generateId() {
  return crypto.randomUUID()
}

// 将 D1 行数据转换为前端格式
export function rowToRecipe(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    image: row.image || '',
    ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
    steps: row.steps ? JSON.parse(row.steps) : [],
    createTime: row.createTime || '',
    updateTime: row.updateTime || '',
  }
}
