<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- 全局 Toast -->
  <transition name="fade">
    <div v-if="toast.visible" class="toast-overlay">
      <div class="toast-box">
        <span class="toast-icon" v-if="toast.icon">{{ toast.icon }}</span>
        <span class="toast-text">{{ toast.message }}</span>
      </div>
    </div>
  </transition>

  <!-- 全局 Loading -->
  <transition name="fade">
    <div v-if="loading.visible" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text" v-if="loading.text">{{ loading.text }}</div>
    </div>
  </transition>

  <!-- 全局 Modal -->
  <transition name="fade">
    <div v-if="modal.visible" class="modal-overlay" @click.self="onModalCancel">
      <transition name="slide-up" appear>
        <div v-if="modal.visible" class="modal-box">
          <div class="modal-title">{{ modal.title }}</div>
          <div class="modal-content">{{ modal.content }}</div>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" @click="onModalCancel">{{ modal.cancelText }}</button>
            <button
              class="modal-btn"
              :class="modal.confirmType === 'danger' ? 'modal-btn-danger' : 'modal-btn-confirm'"
              @click="onModalConfirm"
            >{{ modal.confirmText }}</button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { reactive } from 'vue'
import { ui } from './utils/ui.js'

const toast = reactive(ui.toast)
const loading = reactive(ui.loading)
const modal = reactive(ui.modal)

function onModalCancel() {
  if (modal._resolve) modal._resolve(false)
  modal.visible = false
}
function onModalConfirm() {
  if (modal._resolve) modal._resolve(true)
  modal.visible = false
}
</script>

<style scoped>
.toast-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}
.toast-box {
  background: rgba(45, 36, 24, 0.88);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  max-width: 80%;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toast-icon {
  font-size: 18px;
}

.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 9998;
  background: rgba(255,255,255,0.6);
}
.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  font-size: var(--font-sm);
  color: var(--color-text-sub);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background: rgba(0,0,0,0.4);
}
.modal-box {
  background: var(--bg-card);
  border-radius: 16px;
  width: 300px;
  max-width: 85%;
  padding: 24px 24px 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
}
.modal-title {
  font-size: var(--font-lg);
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
}
.modal-content {
  font-size: var(--font-md);
  color: var(--color-text-sub);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 22px;
}
.modal-actions {
  display: flex;
  gap: 12px;
}
.modal-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 20px;
  font-size: var(--font-md);
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.15s;
}
.modal-btn:hover { opacity: 0.85; }
.modal-btn-cancel {
  background: #F0EBE3;
  color: var(--color-text-sub);
}
.modal-btn-confirm {
  background: var(--color-primary);
  color: #fff;
}
.modal-btn-danger {
  background: var(--color-danger);
  color: #fff;
}
</style>
