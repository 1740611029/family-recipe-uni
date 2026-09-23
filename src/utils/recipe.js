/**
 * 菜谱数据操作层（Web版）
 * 通过 HTTP API 调用 Cloudflare Pages Functions 后端
 */

const API_BASE = '/api'

const DEFAULT_TIMEOUT = 30000

function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const method = options.method || 'GET'
  const timeout = options.timeout || DEFAULT_TIMEOUT
  const retries = method === 'GET' ? 1 : 0

  const buildConfig = (signal) => ({
    ...options,
    method,
    signal,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body
      ? (typeof options.body === 'object' ? JSON.stringify(options.body) : options.body)
      : undefined,
  })

  async function attempt() {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const res = await fetch(url, buildConfig(controller.signal))
      const data = await res.json()
      if (data.code === 0) return data.data !== undefined ? data.data : data
      throw new Error(data.msg || '请求失败')
    } finally {
      clearTimeout(timer)
    }
  }

  return (async () => {
    let lastErr
    for (let i = 0; i <= retries; i++) {
      try {
        return await attempt()
      } catch (err) {
        lastErr = err
        if (err.name === 'AbortError') {
          lastErr = new Error('请求超时，请检查网络')
        }
        console.error(`[API] ${path} 第 ${i + 1} 次失败:`, err)
        // 失败后稍等再重试，避免弱网下连续打爆
        if (i < retries) await new Promise((r) => setTimeout(r, 400))
      }
    }
    throw lastErr
  })()
}

/**
 * 获取所有菜谱
 * @returns {Promise<Array>} 菜谱列表
 */
function getRecipes() {
  return request('/recipes')
}

/**
 * 获取单个菜谱
 * @param {string} id 菜谱ID
 * @param {Object} [opts] { raw: true } 时返回图片原图 base64（编辑页用）
 * @returns {Promise<Object>} 菜谱详情
 */
function getRecipe(id, opts = {}) {
  return request(`/recipe/${id}${opts.raw ? '?raw=1' : ''}`)
}

/**
 * 菜谱图片地址（按需加载，不在列表里传输）
 * @param {string} id 菜谱ID
 * @returns {string} 图片 URL
 */
function imageUrl(id) {
  return `${API_BASE}/recipe/image/${id}`
}

/**
 * 保存菜谱（新增或编辑）
 * @param {Object} data { account, password, id?, name, description, image, ingredients, steps }
 * @returns {Promise<Object>} { code, msg, id? }
 */
function saveRecipe(data) {
  return request('/recipe/save', { method: 'POST', body: data }).then((res) => res).catch((err) => {
    // saveRecipe 返回 { code, msg } 格式，不抛异常
    console.error('[saveRecipe] 失败:', err)
    return { code: -1, msg: err.message || '保存失败，请重试' }
  })
}

/**
 * 删除菜谱
 * @param {Object} data { account, password, id }
 * @returns {Promise<Object>} { code, msg }
 */
function deleteRecipe(data) {
  return request('/recipe/delete', { method: 'POST', body: data }).then((res) => res).catch((err) => {
    console.error('[deleteRecipe] 失败:', err)
    return { code: -1, msg: err.message || '删除失败，请重试' }
  })
}

export default { getRecipes, getRecipe, imageUrl, saveRecipe, deleteRecipe }
