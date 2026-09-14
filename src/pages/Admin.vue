<template>
  <div class="page page-container">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="back-btn" @click="goBack">
        <span class="back-icon">‹</span>
        <span class="back-text">返回</span>
      </div>
      <span class="top-title">菜谱管理</span>
      <div class="add-btn" @click="goAdd">
        <span class="add-icon">+</span>
      </div>
    </div>

    <!-- 内容 -->
    <div class="content">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-box">
        <div class="loading-spinner"></div>
        <span class="loading-text">正在加载...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="recipes.length === 0" class="empty-box">
        <div class="empty-bowl">
          <div class="empty-steam"></div>
          <div class="empty-steam empty-steam-2"></div>
        </div>
        <span class="empty-title">还没有菜谱</span>
        <span class="empty-sub">点击右上角添加第一道菜</span>
      </div>

      <!-- 菜谱列表 -->
      <div v-else class="recipe-list">
        <div
          v-for="(item, idx) in recipes"
          :key="item.id"
          class="recipe-item"
          :style="{ animationDelay: (idx * 0.06) + 's' }"
        >
          <!-- 缩略图 -->
          <div class="item-thumb">
            <img
              v-if="item.image"
              :src="item.image"
              class="thumb-img"
              loading="lazy"
            />
            <div v-else class="thumb-img placeholder-box">
              <span class="thumb-placeholder">暂无</span>
            </div>
          </div>

          <!-- 信息 -->
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.description" class="item-desc">{{ item.description }}</span>
          </div>

          <!-- 操作 -->
          <div class="item-actions">
            <div class="action-btn edit-btn" @click.stop="goEdit(item.id)">
              <span class="action-text edit-text">编辑</span>
            </div>
            <div class="action-btn del-btn" @click.stop="onDelete(item)">
              <span class="action-text del-text">删除</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import recipeApi from '../utils/recipe.js'
import auth from '../utils/auth.js'
import recommendUtil from '../utils/recommend.js'
import { ui } from '../utils/ui.js'

const router = useRouter()

const recipes = ref([])
const loading = ref(true)

function goBack() {
  router.push('/')
}

function loadRecipes() {
  loading.value = true
  recipeApi.getRecipes()
    .then(data => {
      recipes.value = (data || []).map(r => ({ ...r }))
    })
    .catch(err => {
      console.error('[管理端加载失败]', err)
      ui.showToast({ title: '加载失败' })
    })
    .finally(() => {
      loading.value = false
    })
}

function goAdd() {
  router.push('/edit')
}

function goEdit(id) {
  router.push(`/edit/${id}`)
}

async function onDelete(item) {
  const confirmed = await ui.showConfirm({
    title: '删除菜谱',
    content: `确定要删除「${item.name}」吗？`,
    confirmText: '删除',
    confirmType: 'danger',
  })
  if (confirmed) {
    doDelete(item)
  }
}

function doDelete(item) {
  const adminAuth = auth.getAuth()
  ui.showLoading({ title: '删除中...' })
  const targetId = item.id

  recipeApi.deleteRecipe({
    account: adminAuth.account,
    password: adminAuth.password,
    id: targetId,
  }).then(res => {
    ui.hideLoading()
    if (res && res.code === 0) {
      recommendUtil.clearIfMatches(targetId)
      ui.showToast({ title: '已删除', icon: '✓' })
      loadRecipes()
    } else {
      ui.showToast({ title: (res && res.msg) || '删除失败' })
    }
  }).catch(() => {
    ui.hideLoading()
    ui.showToast({ title: '删除失败' })
  })
}

onMounted(() => {
  loadRecipes()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-page);
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
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}
.add-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(200, 90, 58, 0.3);
  cursor: pointer;
  transition: transform 0.15s;
}
.add-btn:hover { transform: scale(1.05); }
.add-icon {
  font-size: 22px;
  color: #fff;
  line-height: 1;
}

/* 内容 */
.content {
  padding: 0 16px 30px;
}

/* 加载 */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}
.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  margin-top: 10px;
  font-size: 13px;
  color: var(--color-text-weak);
}

/* 空状态 */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}
.empty-bowl {
  width: 40px;
  height: 30px;
  border: 3px solid var(--color-text-weak);
  border-top: none;
  border-radius: 0 0 20px 20px;
  position: relative;
  margin-bottom: 15px;
}
.empty-steam {
  position: absolute;
  top: -15px;
  left: 7px;
  width: 4px;
  height: 12px;
  background: var(--color-text-weak);
  border-radius: 4px;
  opacity: 0.5;
  animation: steam 1.5s ease-in-out infinite;
}
.empty-steam-2 {
  left: 25px;
  animation-delay: 0.5s;
}
@keyframes steam {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.6; transform: translateY(-4px); }
}
.empty-title {
  font-size: 16px;
  color: var(--color-text-sub);
  font-weight: 500;
}
.empty-sub {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-weak);
}

/* 菜谱列表 */
.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.recipe-item {
  display: flex;
  align-items: stretch;
  background: var(--bg-card);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  animation: itemIn 0.35s ease both;
}
@keyframes itemIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 缩略图 */
.item-thumb {
  flex-shrink: 0;
  width: 90px;
  height: 90px;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  font-size: 11px;
}

/* 信息 */
.item-info {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 操作按钮 */
.item-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 12px;
}
.action-btn {
  padding: 5px 14px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
}
.action-btn:hover { opacity: 0.85; }
.action-text {
  font-size: 12px;
}
.edit-btn {
  background: rgba(200, 90, 58, 0.1);
}
.edit-text {
  color: var(--color-primary);
}
.del-btn {
  background: rgba(214, 74, 56, 0.1);
}
.del-text {
  color: var(--color-danger);
}
</style>
