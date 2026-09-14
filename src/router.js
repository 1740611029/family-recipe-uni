import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('./pages/Index.vue'),
    meta: { title: '家庭菜谱' }
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('./pages/Detail.vue'),
    meta: { title: '菜谱详情' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./pages/Admin.vue'),
    meta: { title: '菜谱管理' }
  },
  {
    path: '/edit',
    name: 'edit-new',
    component: () => import('./pages/RecipeEdit.vue'),
    meta: { title: '新增菜谱' }
  },
  {
    path: '/edit/:id',
    name: 'edit-existing',
    component: () => import('./pages/RecipeEdit.vue'),
    meta: { title: '编辑菜谱' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title || '家庭菜谱'
})

export default router
