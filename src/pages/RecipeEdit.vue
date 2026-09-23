<template>
  <div class="page page-container">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="back-btn" @click="goBack">
        <span class="back-icon">‹</span>
        <span class="back-text">返回</span>
      </div>
      <span class="top-title">{{ isEdit ? '编辑菜谱' : '新增菜谱' }}</span>
      <div style="width: 36px"></div>
    </div>

    <!-- 加载中 -->
    <div v-if="loadingData" class="loading-box">
      <div class="loading-spinner"></div>
      <span class="loading-text">正在加载...</span>
    </div>

    <div v-else class="form">
      <!-- 图片 -->
      <div class="section">
        <span class="section-label">菜谱图片</span>
        <div class="img-area" @click="onChooseImage">
          <img v-if="image" :src="image" class="preview-img" />
          <div v-else class="img-placeholder">
            <span class="img-placeholder-icon">📷</span>
            <span class="img-placeholder-text">添加图片</span>
          </div>
          <div v-if="uploading" class="upload-overlay">
            <div class="loading-spinner small"></div>
            <span class="upload-text">处理中...</span>
          </div>
        </div>
        <div v-if="image" class="img-change-hint">
          <span class="img-change-text">点击图片可更换</span>
        </div>
      </div>

      <!-- 名称 -->
      <div class="section">
        <span class="section-label">菜谱名称 <span class="required">*</span></span>
        <input
          v-model="name"
          class="field-input"
          placeholder="请输入菜谱名称"
          maxlength="30"
        />
      </div>

      <!-- 描述 -->
      <div class="section">
        <span class="section-label">菜谱描述</span>
        <textarea
          v-model="description"
          class="field-textarea"
          placeholder="请输入菜谱描述（选填）"
          maxlength="200"
        ></textarea>
      </div>

      <!-- 食材 -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">食材</span>
          <div class="add-row-btn" @click="addIngredient">
            <span class="add-row-icon">+</span>
            <span class="add-row-text">添加食材</span>
          </div>
        </div>
        <div class="dynamic-list">
          <div
            v-for="(ing, i) in ingredients"
            :key="'ing-' + i"
            class="dynamic-row"
          >
            <div class="row-index">
              <span class="row-index-text">{{ i + 1 }}</span>
            </div>
            <input
              v-model="ingredients[i]"
              class="row-input"
              placeholder="如：排骨 500g"
              maxlength="50"
            />
            <div class="row-del" @click="removeIngredient(i)">
              <span class="row-del-icon">×</span>
            </div>
          </div>
          <div v-if="ingredients.length === 0" class="dynamic-empty">
            <span class="dynamic-empty-text">暂未添加食材</span>
          </div>
        </div>
      </div>

      <!-- 步骤 -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">做法步骤</span>
          <div class="add-row-btn" @click="addStep">
            <span class="add-row-icon">+</span>
            <span class="add-row-text">添加步骤</span>
          </div>
        </div>
        <div class="dynamic-list">
          <div
            v-for="(step, i) in steps"
            :key="'step-' + i"
            class="dynamic-row"
          >
            <div class="row-index">
              <span class="row-index-text">{{ i + 1 }}</span>
            </div>
            <textarea
              v-model="steps[i]"
              class="row-textarea"
              placeholder="如：排骨焯水去血沫"
              maxlength="200"
            ></textarea>
            <div class="row-del" @click="removeStep(i)">
              <span class="row-del-icon">×</span>
            </div>
          </div>
          <div v-if="steps.length === 0" class="dynamic-empty">
            <span class="dynamic-empty-text">暂未添加步骤</span>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <button
        class="btn-save"
        :disabled="submitting"
        @click="onSave"
      >
        {{ submitting ? '保存中...' : (isEdit ? '保存修改' : '保存菜谱') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import recipeApi from '../utils/recipe.js'
import imageUtil from '../utils/image.js'
import auth from '../utils/auth.js'
import { ui } from '../utils/ui.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const editId = ref(route.params.id || '')

const image = ref('')
const name = ref('')
const description = ref('')
const ingredients = ref([])
const steps = ref([])
const loadingData = ref(false)
const uploading = ref(false)
const submitting = ref(false)

function goBack() {
  router.back()
}

function loadRecipe(id) {
  loadingData.value = true
  // 编辑页要原图 base64（保存时会原样回传），所以带 raw=1
  recipeApi.getRecipe(id, { raw: true })
    .then(data => {
      if (data) {
        image.value = data.image || ''
        name.value = data.name || ''
        description.value = data.description || ''
        ingredients.value = data.ingredients || []
        steps.value = data.steps || []
      }
    })
    .catch(() => {
      ui.showToast({ title: '加载失败' })
    })
    .finally(() => {
      loadingData.value = false
    })
}

function onChooseImage() {
  uploading.value = true
  imageUtil.chooseAndCompressImage()
    .then(base64 => {
      image.value = base64
    })
    .catch(err => {
      if (err.message !== 'CANCEL') {
        ui.showToast({ title: err.message || '图片处理失败' })
      }
    })
    .finally(() => {
      uploading.value = false
    })
}

function addIngredient() { ingredients.value.push('') }
function removeIngredient(i) { ingredients.value.splice(i, 1) }
function addStep() { steps.value.push('') }
function removeStep(i) { steps.value.splice(i, 1) }

function onSave() {
  if (!name.value || !name.value.trim()) {
    ui.showToast({ title: '请输入菜谱名称' })
    return
  }

  const adminAuth = auth.getAuth()
  submitting.value = true
  ui.showLoading({ title: '保存中...' })

  recipeApi.saveRecipe({
    account: adminAuth.account,
    password: adminAuth.password,
    id: isEdit.value ? editId.value : undefined,
    name: name.value,
    description: description.value,
    image: image.value,
    ingredients: ingredients.value,
    steps: steps.value,
  }).then(res => {
    ui.hideLoading()
    submitting.value = false

    if (res && res.code === 0) {
      ui.showToast({
        title: isEdit.value ? '修改成功' : '添加成功',
        icon: '✓',
      })
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      ui.showToast({ title: (res && res.msg) || '保存失败' })
    }
  }).catch(() => {
    ui.hideLoading()
    submitting.value = false
    ui.showToast({ title: '保存失败，请重试' })
  })
}

onMounted(() => {
  if (route.params.id) {
    loadRecipe(route.params.id)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 30px;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
}
.back-icon {
  font-size: 22px;
  color: var(--color-primary);
  line-height: 1;
}
.back-text {
  font-size: 14px;
  color: var(--color-text);
}
.top-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

/* 加载 */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
}
.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-weak);
}

/* 表单 */
.form {
  padding: 8px 16px;
}

/* 区块 */
.section {
  margin-bottom: 24px;
}
.section-label {
  display: block;
  font-size: 14px;
  color: var(--color-text-sub);
  margin-bottom: 8px;
  font-weight: 500;
}
.required {
  color: var(--color-danger);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.add-row-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px dashed var(--color-primary);
  border-radius: 16px;
  cursor: pointer;
}
.add-row-icon {
  font-size: 16px;
  color: var(--color-primary);
  line-height: 1;
}
.add-row-text {
  font-size: 12px;
  color: var(--color-primary);
}

/* 图片区 */
.img-area {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px dashed var(--color-border);
  cursor: pointer;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5EDE3 0%, #EBE0D3 100%);
}
.img-placeholder-icon {
  font-size: 30px;
  margin-bottom: 6px;
}
.img-placeholder-text {
  font-size: 14px;
  color: var(--color-text-weak);
}
.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-text {
  margin-top: 8px;
  font-size: 12px;
  color: #fff;
}
.img-change-hint {
  margin-top: 6px;
  text-align: center;
}
.img-change-text {
  font-size: 12px;
  color: var(--color-text-weak);
}

/* 输入框 */
.field-input {
  width: 100%;
  height: 48px;
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0 16px;
  font-size: 16px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus {
  border-color: var(--color-primary);
}
.field-textarea {
  width: 100%;
  min-height: 80px;
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.6;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;
}
.field-textarea:focus {
  border-color: var(--color-primary);
}

/* 动态列表 */
.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dynamic-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.row-index {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.row-index-text {
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}
.row-input {
  flex: 1;
  min-width: 0;
  height: 48px;
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 15px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}
.row-input:focus { border-color: var(--color-primary); }
.row-textarea {
  flex: 1;
  min-width: 0;
  min-height: 48px;
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.6;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;
}
.row-textarea:focus { border-color: var(--color-primary); }
.row-del {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(214, 74, 56, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  cursor: pointer;
}
.row-del-icon {
  font-size: 18px;
  color: var(--color-danger);
  line-height: 1;
}
.dynamic-empty {
  padding: 20px 0;
  text-align: center;
}
.dynamic-empty-text {
  font-size: 13px;
  color: var(--color-text-weak);
}

/* 保存按钮 */
.btn-save {
  width: 100%;
  height: 48px;
  background: var(--color-primary);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  border-radius: 24px;
  border: none;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:hover { opacity: 0.9; }
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
