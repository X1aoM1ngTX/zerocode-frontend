import ACCESS_ENUM from '@/access/accessEnum'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

/**
 * 路由配置
 * 使用懒加载优化性能，每个路由按需加载
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: {
      title: '首页',
      keepAlive: true,
    },
  },
  {
    path: '/image-gen',
    name: '图像生成',
    component: () => import('@/pages/ImageGenPage.vue'),
    meta: {
      title: '图像生成',
    },
  },
  {
    path: '/user/login',
    name: '用户登录',
    component: () => import('@/pages/user/UserLoginPage.vue'),
    meta: {
      title: '用户登录',
      hideInMenu: true,
    },
  },
  {
    path: '/user/register',
    name: '用户注册',
    component: () => import('@/pages/user/UserRegisterPage.vue'),
    meta: {
      title: '用户注册',
      hideInMenu: true,
    },
  },
  {
    path: '/user/profile',
    name: '个人中心',
    component: () => import('@/pages/user/UserProfilePage.vue'),
    meta: {
      title: '个人中心',
      access: ACCESS_ENUM.USER,
    },
  },
  {
    path: '/admin/userManage',
    name: '用户管理',
    component: () => import('@/pages/admin/UserManagePage.vue'),
    meta: {
      title: '用户管理',
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: '/admin/appManage',
    name: '应用管理',
    component: () => import('@/pages/admin/AppManagePage.vue'),
    meta: {
      title: '应用管理',
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: '/admin/chatManage',
    name: '对话管理',
    component: () => import('@/pages/admin/ChatManagePage.vue'),
    meta: {
      title: '对话管理',
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: '/app/chat/:id',
    name: '应用对话',
    component: () => import('@/pages/app/AppChatPage.vue'),
    meta: {
      title: '应用对话',
      access: ACCESS_ENUM.USER,
    },
  },
  {
    path: '/app/edit/:id',
    name: '编辑应用',
    component: () => import('@/pages/app/AppEditPage.vue'),
    meta: {
      title: '编辑应用',
      access: ACCESS_ENUM.USER,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/error/NotFoundPage.vue'),
    meta: {
      title: '页面不存在',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
})

// 设置路由守卫
setupRouterGuards(router)

export default router

