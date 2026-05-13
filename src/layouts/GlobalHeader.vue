<template>
  <div class="header-container">
    <a-row :wrap="false" align="middle" class="header-row">
      <!-- Logo和标题 -->
      <a-col flex="200px" class="logo-col">
        <router-link to="/" class="logo-link">
          <div class="title-bar">
            <img class="logo" src="../assets/vexor-argb.png" alt="logo" />
          </div>
        </router-link>
      </a-col>

      <!-- 导航菜单 -->
      <a-col flex="auto" class="menu-col">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          theme="light"
          :items="filteredMenus"
          @click="doMenuClick"
          class="nav-menu"
          :overflowedIndicator="null"
          :overflowedIndicatorPopupClassName="''"
        />
      </a-col>

      <!-- 用户区域 -->
      <a-col flex="180px" class="user-col">
        <div v-if="loginUserStore.loginUser.id" class="user-info">
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              <a-avatar :size="32" :src="loginUserStore.loginUser.userAvatar" class="user-avatar">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="username">{{ loginUserStore.loginUser.userName || '用户' }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item v-for="item in dropdownMenuItems" :key="item.key" @click="item.action">
                  <component :is="item.icon" />
                  {{ item.label }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else class="auth-buttons">
          <a-button type="link" class="login-btn" @click="toLogin">登录</a-button>
          <a-button type="primary" class="register-btn" @click="toRegister">注册</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, computed } from 'vue'
import {
  BuildOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  PictureOutlined,
  FireOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons-vue'
import router from '@/router'
import { useLoginUserStore } from '@/stores/loginUser'
import { userLogout } from '@/api/user'
import { message } from 'ant-design-vue'
import checkAccess from '@/access/checkAccess'
import ACCESS_ENUM from '@/access/accessEnum'

const loginUserStore = useLoginUserStore()

// 原始菜单项
const menus = ref([
  {
    key: '/',
    icon: () => h(BuildOutlined),
    label: '应用生成',
    title: '应用生成',
  },
  {
    key: '/image-gen',
    icon: () => h(PictureOutlined),
    label: '图像生成',
    title: '图像生成',
  },
  {
    key: '/featured',
    icon: () => h(FireOutlined),
    label: '精选案例',
    title: '精选案例',
  },
  {
    key: '/works',
    icon: () => h(FolderOpenOutlined),
    label: '我的作品',
    title: '我的作品',
  },
])

// 定义菜单项类型
interface MenuItem {
  key: string
  icon: () => unknown
  label: string
  title: string
}

// 过滤菜单项的通用函数
const filterMenusByPermission = (menuItems: MenuItem[]) => {
  return menuItems.filter((menu) => {
    // 根据菜单key找到对应的路由
    const route = router.resolve(menu.key)

    // 如果路由配置了hideInMenu，则隐藏该菜单
    if (route.meta?.hideInMenu) {
      return false
    }

    // 根据权限过滤菜单，有权限则返回true，保留该菜单
    return checkAccess(loginUserStore.loginUser, route.meta?.access as string)
  })
}

// 过滤后的顶部导航菜单项
const filteredMenus = computed(() => {
  return filterMenusByPermission(menus.value)
})

// 下拉菜单项配置
const dropdownMenuItems = computed(() => {
  const items = [
    {
      key: 'profile',
      icon: UserOutlined,
      label: '个人中心',
      action: toProfile,
      // 个人中心需要用户登录权限
      access: ACCESS_ENUM.USER,
    },
    {
      key: 'appManage',
      icon: AppstoreOutlined,
      label: '应用管理',
      action: toAppManage,
      // 应用管理需要管理员权限
      access: ACCESS_ENUM.ADMIN,
    },
    {
      key: 'userManage',
      icon: TeamOutlined,
      label: '用户管理',
      action: toUserManage,
      // 用户管理需要管理员权限
      access: ACCESS_ENUM.ADMIN,
    },
    {
      key: 'chatHistoryManage',
      icon: TeamOutlined,
      label: '对话管理',
      action: toChatHistoryManage,
      // 用户管理需要管理员权限
      access: ACCESS_ENUM.ADMIN,
    },
    {
      key: 'logout',
      icon: LogoutOutlined,
      label: '退出登录',
      action: handleLogout,
      // 退出登录不需要特殊权限
      access: ACCESS_ENUM.NOT_LOGIN,
    },
  ]

  // 过滤有权限的菜单项
  return items.filter((item) => checkAccess(loginUserStore.loginUser, item.access))
})

// 当前选中的菜单
const current = ref<string[]>([])

// 菜单点击事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 监听路由变化，更新当前选中的菜单
router.afterEach((to) => {
  current.value = [to.path]
})

// 个人中心
const toProfile = () => {
  router.push('/user/profile')
}

// 应用管理
const toAppManage = () => {
  router.push('/admin/appManage')
}

// 用户管理
const toUserManage = () => {
  router.push('/admin/userManage')
}

// 用户管理
const toChatHistoryManage = () => {
  router.push('/admin/chatManage')
}

// 登录
const toLogin = () => {
  router.push('/user/login')
}

// 注册
const toRegister = () => {
  router.push('/user/register')
}

// 退出登录
const handleLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    localStorage.removeItem('login-user')
    message.success('退出登录成功')
    await router.replace('/user/login')
  } else {
    message.error('退出登录失败，' + (res.data.message || '未知错误'))
  }
}
</script>

<style scoped>
.header-container {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(213, 222, 238, 0.9);
  height: var(--layout-header-height);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 6px 22px rgba(28, 45, 90, 0.08);
  transition: all var(--transition-base);
}

.header-container:hover {
  box-shadow: 0 8px 26px rgba(28, 45, 90, 0.1);
}

.header-row {
  height: 100%;
  padding: 0 24px;
}

.logo-col {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
}

.title-bar {
  display: flex;
  align-items: center;
}

.logo {
  width: 112px;
  height: 40px;
  object-fit: contain;
  margin-right: 0;
}

.title {
  font-family: var(--font-family-heading);
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  background: var(--gradient-ai-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
  white-space: nowrap;
  letter-spacing: -0.5px;
}

.menu-col {
  display: flex;
  justify-content: center;
  overflow: visible !important;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
  font-family: var(--font-family-body);
  min-width: max-content;
  overflow: visible !important;
}

/* 禁用菜单的溢出检测 */
.nav-menu :deep(.ant-menu-list) {
  overflow: visible !important;
}

.nav-menu :deep(.ant-menu-root) {
  overflow: visible !important;
}

/* 强制隐藏溢出指示器和下拉菜单 */
.nav-menu :deep(.ant-menu-overflowed-ref),
.nav-menu :deep(.ant-menu-submenu),
.nav-menu :deep(.ant-menu-submenu-arrow) {
  display: none !important;
}

/* 强制隐藏折叠的菜单项并展开 */
.nav-menu :deep(.ant-menu-hidden),
.nav-menu :deep(.ant-menu-overflowed-submenu) {
  display: flex !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* 确保菜单项容器不隐藏 */
.nav-menu :deep(.ant-menu-overflowed-container) {
  display: none !important;
}

.nav-menu :deep(.ant-menu-item) {
  color: #344157;
  font-weight: 700;
  transition: all var(--transition-base);
  border-radius: 4px;
  margin: 0 4px;
}

.nav-menu :deep(.ant-menu-item:hover) {
  color: #254ff0;
  background: rgba(65, 105, 255, 0.08);
}

.nav-menu :deep(.ant-menu-item-selected) {
  color: #254ff0;
  background: rgba(65, 105, 255, 0.1);
}

.nav-menu :deep(.ant-menu-item-selected::after) {
  border-bottom-color: #4169ff;
}

.user-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 12px;
  background: var(--gradient-ai-primary);
  border: 2px solid transparent;
  transition: all var(--transition-base);
  position: relative;
}

/* Avatar 发光边框效果 */
.user-avatar::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-ai-border);
  border-radius: 50%;
  z-index: -1;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.user-avatar:hover::before {
  opacity: 1;
}

.user-avatar:hover {
  box-shadow: var(--shadow-glow-purple);
}

.username {
  margin-right: 8px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-base);
  transition: color var(--transition-base);
}

.ant-dropdown-link:hover .username {
  color: var(--color-primary);
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.login-btn {
  height: 34px;
  padding: 0 18px;
  border-radius: 5px;
  font-weight: 700;
  color: #172033;
  border: 1px solid #d9e2f2;
  transition: all var(--transition-base);
}

.login-btn:hover {
  color: #254ff0;
  border-color: #4169ff;
  background: rgba(65, 105, 255, 0.08);
}

.register-btn {
  height: 34px;
  padding: 0 18px;
  border-radius: 5px;
  font-weight: 700;
  background: linear-gradient(135deg, #4169ff 0%, #2554f4 100%);
  border: none;
  color: white;
  transition: all var(--transition-base);
}

.register-btn:hover {
  box-shadow: 0 10px 22px rgba(48, 88, 244, 0.24);
}

.ant-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  background: transparent;
  border: 1px solid transparent;
}

.ant-dropdown-link:hover {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

/* 下拉菜单样式 */
:deep(.ant-dropdown-menu) {
  background: var(--glass-bg-light);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px;
  box-shadow: var(--shadow-4);
}

:deep(.ant-dropdown-menu-item) {
  border-radius: var(--radius-base);
  padding: 10px 16px;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

:deep(.ant-dropdown-menu-item:hover) {
  background: rgba(139, 92, 246, 0.1);
  color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-row {
    padding: 0 16px;
  }

  .logo-col {
    flex: 140px !important;
  }

  .logo {
    width: 92px;
    height: 32px;
  }

  .title {
    font-size: 14px;
  }

  .user-col {
    flex: 140px !important;
  }

  .username {
    display: none;
  }

  .nav-menu {
    font-size: var(--font-size-sm);
  }
}

/* 深色模式适配 */
[data-theme='dark'] .header-container {
  background: var(--glass-bg-dark);
  border-bottom-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}

[data-theme='dark'] .nav-menu :deep(.ant-menu-item) {
  color: var(--color-text-secondary);
}

[data-theme='dark'] .nav-menu :deep(.ant-menu-item:hover) {
  background: rgba(139, 92, 246, 0.15);
}

[data-theme='dark'] .ant-dropdown-link:hover {
  background: var(--color-bg-container);
}

[data-theme='dark'] :deep(.ant-dropdown-menu) {
  background: var(--color-bg-container);
  border-color: rgba(139, 92, 246, 0.3);
}
</style>
