<template>
  <div class="page page-container">
    <!-- 返回按钮 -->
    <div class="back-bar">
      <div class="back-btn" @click="goBack">
        <span class="back-icon">‹</span>
        <span class="back-text">返回</span>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-box">
      <div class="loading-spinner"></div>
      <span class="loading-text">正在加载...</span>
    </div>

    <div v-else-if="!recipe" class="empty-box">
      <span class="empty-title">菜谱不存在</span>
    </div>

    <div v-else class="detail-content">
      <!-- 大图 -->
      <div class="hero-img-wrap">
        <img
          v-if="recipe.image"
          :src="recipe.image"
          class="hero-img"
        />
        <div v-else class="hero-img placeholder-box">
          <span class="placeholder-text-lg">暂无菜品图片</span>
        </div>
      </div>

      <!-- 名称 -->
      <div class="section">
        <span class="recipe-title">{{ recipe.name }}</span>
      </div>

      <!-- 描述 -->
      <div v-if="recipe.description" class="section">
        <span class="section-label">描述</span>
        <span class="recipe-description">{{ recipe.description }}</span>
      </div>

      <!-- 食材 -->
      <div v-if="recipe.ingredients && recipe.ingredients.length" class="section">
        <span class="section-label">食材</span>
        <div class="ingredient-tags">
          <div
            v-for="(ing, i) in recipe.ingredients"
            :key="i"
            class="ingredient-tag"
          >
            <span class="ingredient-text">{{ ing }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤 -->
      <div v-if="recipe.steps && recipe.steps.length" class="section">
        <span class="section-label">做法步骤</span>
        <div class="step-list">
          <div
            v-for="(step, i) in recipe.steps"
            :key="i"
            class="step-item"
          >
            <div class="step-num">
              <span class="step-num-text">{{ i + 1 }}</span>
            </div>
            <span class="step-text">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import recipeApi from '../utils/recipe.js'
import { ui } from '../utils/ui.js'

const route = useRoute()
const router = useRouter()

const recipe = ref(null)
const loading = ref(true)

function goBack() {
  router.back()
}

function loadRecipe() {
  loading.value = true
  recipeApi.getRecipe(route.params.id)
    .then(data => {
      recipe.value = data
    })
    .catch(() => {
      ui.showToast({ title: '加载失败' })
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  loadRecipe()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-page);
}

/* 返回栏 */
.back-bar {
  padding: 12px 16px;
  display: flex;
  align-items: center;
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
  align-items: center;
  justify-content: center;
  padding: 100px 0;
}
.empty-title {
  font-size: 16px;
  color: var(--color-text-weak);
}

/* 内容 */
.detail-content {
  padding-bottom: 30px;
}

/* 大图 */
.hero-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-text-lg {
  font-size: 15px;
}

/* 区块 */
.section {
  padding: 16px 20px 0;
}
.section-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-weak);
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.recipe-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  padding: 20px 20px 10px;
}
.recipe-description {
  display: block;
  font-size: 15px;
  color: var(--color-text-sub);
  line-height: 1.8;
}

/* 食材标签 */
.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.ingredient-tag {
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}
.ingredient-text {
  font-size: 14px;
  color: var(--color-text);
}

/* 步骤 */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-num-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}
.step-text {
  flex: 1;
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.7;
  padding-top: 3px;
}
</style>
