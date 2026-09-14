<template>
  <div class="page page-container">
    <!-- 顶部标题区 -->
    <div class="hero">
      <span class="hero-title">家庭菜谱</span>
      <span class="hero-sub">今天吃点什么？</span>
    </div>

    <!-- 管理端隐藏入口：右上角图标，仅长按有效 -->
    <div
      class="admin-entry"
      @pointerdown="onPressStart"
      @pointerup="onPressEnd"
      @pointerleave="onPressEnd"
    >
      <div class="admin-avatar">
        <span class="admin-avatar-icon">🍴</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-box">
        <div class="loading-spinner"></div>
        <span class="loading-text">正在加载...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="recipes.length === 0" class="empty-box">
        <div class="empty-icon">
          <div class="empty-bowl">
            <div class="empty-steam"></div>
            <div class="empty-steam empty-steam-2"></div>
          </div>
        </div>
        <span class="empty-title">还没有菜谱</span>
        <span class="empty-sub">去管理端添加第一道家庭菜吧</span>
      </div>

      <!-- 菜谱列表 -->
      <div v-else class="recipe-list">
        <div
          v-for="(item, idx) in recipes"
          :key="item.id"
          class="recipe-card"
          :class="{ 'recommend-card': item._isRecommend }"
          :style="{ animationDelay: (idx * 0.08) + 's' }"
          @click="goDetail(item.id)"
        >
          <!-- 今日推荐标识 -->
          <div v-if="item._isRecommend" class="recommend-tag">
            <span class="recommend-tag-star">⭐</span>
            <span class="recommend-tag-text">今日推荐</span>
          </div>

          <div class="recipe-img-wrap">
            <img
              v-if="item.image"
              :src="item.image"
              class="recipe-img"
              loading="lazy"
            />
            <div v-else class="recipe-img placeholder-box">
              <span class="placeholder-text">暂无图片</span>
            </div>
          </div>

          <div class="recipe-info">
            <span class="recipe-name">{{ item.name }}</span>
            <span v-if="item.description" class="recipe-desc">{{ item.description }}</span>

            <!-- 推荐操作按钮 -->
            <div class="card-actions">
              <div
                class="rec-btn"
                :class="{ 'rec-btn-active': item._isRecommend }"
                @click.stop="onToggleRecommend(item)"
              >
                <span class="rec-btn-icon">{{ item._isRecommend ? '★' : '☆' }}</span>
                <span class="rec-btn-label">
                  {{ item._isRecommend ? '取消推荐' : '推荐今日' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import recipeApi from '../utils/recipe.js'
import recommendUtil from '../utils/recommend.js'
import { ui } from '../utils/ui.js'

const router = useRouter()

const recipes = ref([])
const loading = ref(true)

let pressTimer = null

function onPressStart() {
  pressTimer = setTimeout(() => {
    router.push('/admin')
  }, 600)
}
function onPressEnd() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

/**
 * 应用"今日推荐"到列表
 */
function applyRecommend(list, recIds) {
  const arr = list.map(r => ({ ...r, _isRecommend: false }))
  if (!recIds || recIds.length === 0) return arr

  const idSet = new Set()
  const recOrder = []

  for (const recId of recIds) {
    const idx = arr.findIndex(r => String(r.id) === String(recId))
    if (idx !== -1) {
      idSet.add(String(recId))
      recOrder.push(String(recId))
    }
  }

  // 清理不存在的推荐
  for (const recId of recIds) {
    if (!idSet.has(String(recId))) {
      recommendUtil.removeRecommend(recId)
    }
  }

  // 打标记
  for (const r of arr) {
    if (idSet.has(String(r.id))) {
      r._isRecommend = true
    }
  }

  if (recOrder.length === 0) return arr

  // 多推荐全部置顶
  const recommended = []
  recOrder.forEach(rid => {
    const idx = arr.findIndex(r => String(r.id) === rid)
    if (idx !== -1) {
      recommended.push(arr.splice(idx, 1)[0])
    }
  })
  return recommended.concat(arr)
}

function loadRecipes(cb) {
  loading.value = true
  const recIds = recommendUtil.getTodayRecommendIds()

  recipeApi.getRecipes()
    .then(data => {
      recipes.value = applyRecommend(data || [], recIds)
    })
    .catch(err => {
      console.error('[首页加载失败]', err)
      ui.showToast({ title: err.message || '加载失败' })
      recipes.value = []
    })
    .finally(() => {
      loading.value = false
      if (cb) cb()
    })
}

function goDetail(id) {
  router.push(`/detail/${id}`)
}

function onToggleRecommend(item) {
  const id = String(item.id)
  const result = recommendUtil.toggleRecommend(id)

  const recIds = recommendUtil.getTodayRecommendIds()
  recipes.value = applyRecommend(
    recipes.value.map(r => {
      const o = { ...r }
      delete o._isRecommend
      return o
    }),
    recIds
  )

  if (result.action === 'add') {
    ui.showToast({ title: '已加入今日推荐', icon: '✓' })
  } else {
    ui.showToast({ title: '已取消推荐' })
  }
}

onMounted(() => {
  loadRecipes()
})

onUnmounted(() => {
  if (pressTimer) clearTimeout(pressTimer)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 30px;
}

/* 顶部标题 */
.hero {
  padding: 30px 20px 15px;
}
.hero-title {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 1px;
}
.hero-sub {
  display: block;
  font-size: 14px;
  color: var(--color-text-sub);
  margin-top: 6px;
}

/* 管理端隐藏入口 */
.admin-entry {
  position: absolute;
  top: 28px;
  right: 20px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}
.admin-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(200, 90, 58, 0.08);
  border: 1px solid rgba(200, 90, 58, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-avatar-icon {
  font-size: 18px;
  line-height: 1;
}

/* 内容区 */
.content {
  padding: 0 16px;
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
.empty-icon {
  margin-bottom: 15px;
}
.empty-bowl {
  width: 40px;
  height: 30px;
  border: 3px solid var(--color-text-weak);
  border-top: none;
  border-radius: 0 0 20px 20px;
  position: relative;
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
  gap: 16px;
}
.recipe-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  animation: cardIn 0.4s ease both;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.recipe-card:hover {
  box-shadow: var(--shadow-card-hover);
}
.recipe-card.recommend-card {
  border: 1px solid rgba(200, 90, 58, 0.25);
  box-shadow: 0 2px 14px rgba(200, 90, 58, 0.1);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.recipe-img-wrap {
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  position: relative;
}
.recipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-text {
  font-size: 13px;
}

/* 今日推荐标签 */
.recommend-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(200, 90, 58, 0.95), rgba(232, 144, 112, 0.95));
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(200, 90, 58, 0.25);
}
.recommend-tag-star {
  font-size: 12px;
  line-height: 1;
}
.recommend-tag-text {
  font-size: 11px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.recipe-info {
  padding: 14px 16px 12px;
}
.recipe-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}
.recipe-desc {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: var(--color-text-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 卡片内推荐操作按钮 */
.card-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.rec-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 16px;
  background: rgba(245, 170, 60, 0.1);
  border: 1px solid rgba(245, 170, 60, 0.25);
  cursor: pointer;
  transition: all 0.15s;
}
.rec-btn-icon {
  font-size: 13px;
  line-height: 1;
  color: #D49230;
}
.rec-btn-label {
  font-size: 11px;
  color: #D49230;
  font-weight: 500;
}
.rec-btn.rec-btn-active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  border-color: transparent;
}
.rec-btn.rec-btn-active .rec-btn-icon,
.rec-btn.rec-btn-active .rec-btn-label {
  color: #fff;
}
</style>
