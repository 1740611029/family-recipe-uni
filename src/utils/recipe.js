/**
 * 菜谱数据操作层（Web版）
 * 通过 HTTP API 调用 Cloudflare Pages Functions 后端
 */

const API_BASE = '/api'

function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }
  return fetch(url, config).then(async (res) => {
    const data = await res.json()
    if (data.code === 0) return data.data !== undefined ? data.data : data
    throw new Error(data.msg || '请求失败')
  }).catch((err) => {
    console.error(`[API] ${path} 失败:`, err)
    throw err
  })
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
 * @returns {Promise<Object>} 菜谱详情
 */
function getRecipe(id) {
  return request(`/recipe/${id}`)
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

export default { getRecipes, getRecipe, saveRecipe, deleteRecipe }
