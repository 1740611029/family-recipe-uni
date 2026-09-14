/**
 * 管理端凭证工具（Web版）
 * 与原版一致：硬编码 admin/admin
 * 保留原方法名以便页面无感知使用
 */

const ADMIN_ACCOUNT = 'admin'
const ADMIN_PASSWORD = 'admin'

function getAuth() {
  return { account: ADMIN_ACCOUNT, password: ADMIN_PASSWORD }
}

function verify() { return true }
function saveAuth() {}
function clearAuth() {}

export default { verify, saveAuth, getAuth, clearAuth }
