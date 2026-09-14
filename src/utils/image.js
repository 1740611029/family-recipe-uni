/**
 * 图片处理工具（Web版）
 * 流程：选择图片 -> Canvas 压缩 -> 返回 base64 字符串
 * 图片直接以 base64 存储在 D1 数据库中，无需单独上传
 */

const MAX_WIDTH = 800
const MAX_HEIGHT = 600
const QUALITY = 0.8

/**
 * 选择并压缩图片，返回 base64 字符串
 * @returns {Promise<string>} base64 格式的图片数据
 */
function chooseAndCompressImage() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) {
        reject(new Error('CANCEL'))
        return
      }
      if (!file.type.startsWith('image/')) {
        reject(new Error('请选择图片文件'))
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // 计算缩放尺寸
          let { width, height } = img
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          // Canvas 压缩
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const base64 = canvas.toDataURL('image/jpeg', QUALITY)
          resolve(base64)
        }
        img.onerror = () => reject(new Error('图片加载失败，请重试'))
        img.src = event.target.result
      }
      reader.onerror = () => reject(new Error('图片读取失败，请重试'))
      reader.readAsDataURL(file)
    }

    // 模拟 cancel 行为
    input.addEventListener('cancel', () => reject(new Error('CANCEL')))
    input.click()
  })
}

/**
 * 获取图片显示URL
 * Web版中图片已经是 base64 或 URL，直接返回
 */
function getImageUrl(image) {
  if (!image) return ''
  return image
}

export default { chooseAndCompressImage, getImageUrl }
