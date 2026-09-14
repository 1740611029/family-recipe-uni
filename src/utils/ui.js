/**
 * UI 工具模块（Web版）
 * 提供 Toast、Loading、Modal 的全局状态管理
 * 在 App.vue 中渲染对应组件
 */

import { reactive } from 'vue'

const toast = reactive({
  visible: false,
  message: '',
  icon: '',
  _timer: null,
})

const loading = reactive({
  visible: false,
  text: '',
})

const modal = reactive({
  visible: false,
  title: '',
  content: '',
  confirmText: '确定',
  cancelText: '取消',
  confirmType: 'primary',
  _resolve: null,
})

function showToast({ title, icon = '' }) {
  if (toast._timer) clearTimeout(toast._timer)
  toast.message = title
  toast.icon = icon
  toast.visible = true
  toast._timer = setTimeout(() => {
    toast.visible = false
  }, 2000)
}

function showLoading({ title = '' } = {}) {
  loading.text = title
  loading.visible = true
}

function hideLoading() {
  loading.visible = false
  loading.text = ''
}

function showConfirm({ title = '提示', content = '', confirmText = '确定', cancelText = '取消', confirmType = 'primary' }) {
  return new Promise((resolve) => {
    modal.title = title
    modal.content = content
    modal.confirmText = confirmText
    modal.cancelText = cancelText
    modal.confirmType = confirmType
    modal._resolve = resolve
    modal.visible = true
  })
}

export const ui = {
  toast,
  loading,
  modal,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
}
