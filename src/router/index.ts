import ACCESS_ENUM from '@/access/accessEnum'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("@/pages/HomePage.vue"),
    },
    {
      path: '/image-gen',
      name: '图像生成',
      component: () => import("@/pages/ImageGenPage.vue"),
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import("@/pages/user/UserLoginPage.vue"),
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import("@/pages/user/UserRegisterPage.vue"),
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import("@/pages/admin/UserManagePage.vue"),
      meta: {
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/admin/appManage',
      name: '应用管理',
      component: () => import("@/pages/admin/AppManagePage.vue"),
      meta: {
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/admin/chatManage',
      name: '对话管理',
      component: () => import("@/pages/admin/ChatManagePage.vue"),
      meta: {
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/user/profile',
      name: '个人中心',
      component: () => import("@/pages/user/UserProfilePage.vue"),
    },
    {
      path: '/app/chat/:id',
      name: '应用对话',
      component: () => import("@/pages/app/AppChatPage.vue"),
    },
    {
      path: '/app/edit/:id',
      name: '编辑应用',
      component: () => import("@/pages/app/AppEditPage.vue"),
    },
  ],

})

export default router
