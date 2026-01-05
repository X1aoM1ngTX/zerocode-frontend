<template>
  <div class="header-container">
    <a-row :wrap="false" align="middle" class="header-row">
      <!-- Logo和标题 -->
      <a-col flex="200px" class="logo-col">
        <router-link to="/" class="logo-link">
          <div class="title-bar">
            <img class="logo" src="../assets/zerocode-v2.jpg" alt="logo" />
            <div class="title">ZeroCode 零码</div>
          </div>
        </router-link>
      </a-col>

      <!-- 导航菜单 -->
      <a-col flex="auto" class="menu-col">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="filteredMenus"
          @click="doMenuClick"
          class="nav-menu"
        />
      </a-col>

      <!-- 用户区域 -->
      <a-col flex="220px" class="user-col">
        <div v-if="loginUserStore.loginUser.id" class="user-info">
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              <a-avatar
                :size="32"
                :src="loginUserStore.loginUser.userAvatar"
                class="user-avatar"
              >
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="username">{{ loginUserStore.loginUser.userName || '用户' }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item
                  v-for="item in dropdownMenuItems"
                  :key="item.key"
                  @click="item.action"
                >
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
import { h, ref, computed } from "vue";
import {
  BuildOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  PictureOutlined,
} from "@ant-design/icons-vue";
import router from "@/router";
import { useLoginUserStore } from "@/stores/loginUser";
import { userLogout } from "@/api/user";
import { message } from "ant-design-vue";
import checkAccess from "@/access/checkAccess";
import ACCESS_ENUM from "@/access/accessEnum";

const loginUserStore = useLoginUserStore();

// 原始菜单项
const menus = ref([
  {
    key: "/",
    icon: () => h(BuildOutlined),
    label: "应用生成",
    title: "应用生成",
  },
  {
    key: "/image-gen",
    icon: () => h(PictureOutlined),
    label: "图像生成",
    title: "图像生成",
  },
]);

// 定义菜单项类型
interface MenuItem {
  key: string;
  icon: () => unknown;
  label: string;
  title: string;
}

// 过滤菜单项的通用函数
const filterMenusByPermission = (menuItems: MenuItem[]) => {
  return menuItems.filter((menu) => {
    // 根据菜单key找到对应的路由
    const route = router.resolve(menu.key);

    // 如果路由配置了hideInMenu，则隐藏该菜单
    if (route.meta?.hideInMenu) {
      return false;
    }

    // 根据权限过滤菜单，有权限则返回true，保留该菜单
    return checkAccess(loginUserStore.loginUser, route.meta?.access as string);
  });
};

// 过滤后的顶部导航菜单项
const filteredMenus = computed(() => {
  return filterMenusByPermission(menus.value);
});

// 下拉菜单项配置
const dropdownMenuItems = computed(() => {
  const items = [
    {
      key: "profile",
      icon: UserOutlined,
      label: "个人中心",
      action: toProfile,
      // 个人中心需要用户登录权限
      access: ACCESS_ENUM.USER
    },
    {
      key: "appManage",
      icon: AppstoreOutlined,
      label: "应用管理",
      action: toAppManage,
      // 应用管理需要管理员权限
      access: ACCESS_ENUM.ADMIN
    },
    {
      key: "userManage",
      icon: TeamOutlined,
      label: "用户管理",
      action: toUserManage,
      // 用户管理需要管理员权限
      access: ACCESS_ENUM.ADMIN
    },
    {
      key: "chatHistoryManage",
      icon: TeamOutlined,
      label: "对话管理",
      action: toChatHistoryManage,
      // 用户管理需要管理员权限
      access: ACCESS_ENUM.ADMIN
    },
    {
      key: "logout",
      icon: LogoutOutlined,
      label: "退出登录",
      action: handleLogout,
      // 退出登录不需要特殊权限
      access: ACCESS_ENUM.NOT_LOGIN
    }
  ];

  // 过滤有权限的菜单项
  return items.filter(item =>
    checkAccess(loginUserStore.loginUser, item.access)
  );
});

// 当前选中的菜单
const current = ref<string[]>([]);

// 菜单点击事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  });
};

// 监听路由变化，更新当前选中的菜单
router.afterEach((to) => {
  current.value = [to.path];
});

// 个人中心
const toProfile = () => {
  router.push("/user/profile");
};

// 应用管理
const toAppManage = () => {
  router.push("/admin/appManage");
};

// 用户管理
const toUserManage = () => {
  router.push("/admin/userManage");
};

// 用户管理
const toChatHistoryManage = () => {
  router.push("/admin/chatManage");
};

// 登录
const toLogin = () => {
  router.push("/user/login");
};

// 注册
const toRegister = () => {
  router.push("/user/register");
};

// 退出登录
const handleLogout = async () => {
  const res = await userLogout();
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: "未登录",
    });
    localStorage.removeItem("login-user");
    message.success("退出登录成功");
    await router.replace("/user/login");
  } else {
    message.error("退出登录失败，" + (res.data.message || "未知错误"));
  }
};
</script>

<style scoped>
.header-container {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 64px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; /* 确保header在所有内容之上 */
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
  transition: all 0.3s;
}

.title-bar:hover {
  transform: scale(1.05);
}

.logo {
  width: 36px;
  height: 36px;
  margin-right: 8px;
  transition: all 0.3s;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #3086fe;
  white-space: nowrap;
}

.menu-col {
  display: flex;
  justify-content: center;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
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
  margin-right: 8px;
  background-color: #1890ff;
}

.username {
  margin-right: 4px;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

.login-btn {
  font-weight: 500;
}

.register-btn {
  font-weight: 500;
}

.ant-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.ant-dropdown-link:hover {
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-row {
    padding: 0 12px;
  }

  .logo-col {
    flex: 160px !important;
  }

  .title {
    font-size: 16px;
  }

  .user-col {
    flex: 180px !important;
  }

  .username {
    display: none;
  }
}
</style>
