<template>
  <div class="user-profile-page">
    <!-- 用户信息区域 -->
    <a-row :gutter="[16, 16]">
      <!-- 左侧用户信息卡片 (2/3) -->
      <a-col :xs="24" :lg="16">
        <a-card class="user-info-card" :bordered="false">
          <a-row :gutter="[16, 16]" align="middle">
            <a-col :xs="24" :sm="8" :md="6" :lg="8">
              <div class="avatar-container">
                <a-avatar
                  :size="120"
                  :src="loginUser.userAvatar"
                  class="user-avatar"
                >
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
              </div>
            </a-col>
            <a-col :xs="24" :sm="16" :md="18" :lg="16">
              <div class="user-details">
                <h1 class="username">{{ loginUser.userName || "未设置用户名" }}</h1>
                <p class="user-account">账号：{{ loginUser.userAccount }}</p>
                <p class="user-profile">
                  {{ loginUser.userProfile || "这个人很懒，什么都没留下~" }}
                </p>
                <div class="user-stats">
                  <a-statistic title="用户角色" :value="userRoleText" />
                  <a-divider type="vertical" />
                  <a-statistic
                    title="创建时间"
                    :value="formatDate(loginUser.createTime)"
                  />
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 右侧VIP信息卡片 (1/3) -->
      <a-col :xs="24" :lg="8" v-if="isOwnProfile">
        <a-card class="user-vip-info-card" :bordered="false">
          <div class="vip-content">
            <h3 class="vip-title">
              <CrownOutlined /> VIP会员服务
            </h3>

            <div class="vip-status">
              <div v-if="loginUser.isVip" class="vip-info">
                <a-tag color="gold" class="vip-badge">
                  <CrownOutlined /> VIP会员
                </a-tag>
                <div class="vip-details">
                  <div class="vip-number">
                    你好{{ `VIP${loginUser.id && loginUser.id.toString().slice(-5).padStart(5, '0')}` }}
                  </div>
                  <div class="vip-expire" v-if="loginUser.vipExpireTime">
                    到期时间：{{ formatDate(loginUser.vipExpireTime) }}
                  </div>
                </div>
              </div>
              <span v-else class="no-vip-tip"> 兑换VIP享受更多特权 </span>
            </div>

            <a-button
              type="primary"
              size="large"
              @click="goToVipExchange"
              class="vip-exchange-btn"
              :icon="h(CrownOutlined)"
              block
            >
              {{ loginUser.isVip ? '续费VIP' : 'VIP兑换' }}
            </a-button>

            <div class="vip-features">
              <h4>VIP特权</h4>
              <ul>
                <li>无限制应用创建</li>
                <li>高级模板使用</li>
                <li>专属客服支持</li>
                <li>优先功能体验</li>
              </ul>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 标签页 -->
    <a-tabs v-model:activeKey="activeTab" class="content-tabs">
      <a-tab-pane key="settings" tab="个人设置" v-if="isOwnProfile">
        <a-card title="编辑个人信息" :bordered="false">
          <a-form
            :model="editForm"
            layout="vertical"
            @finish="handleUpdateUser"
          >
            <a-form-item label="用户名" name="userName">
              <a-input
                v-model:value="editForm.userName"
                placeholder="请输入用户名"
              />
            </a-form-item>
            <a-form-item label="个人简介" name="userProfile">
              <a-textarea
                v-model:value="editForm.userProfile"
                placeholder="请输入个人简介"
                :rows="4"
              />
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                :loading="updateLoading"
              >
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  UserOutlined,
  CrownOutlined,
} from "@ant-design/icons-vue";
import { updateUser } from "@/api/user";
import { useLoginUserStore } from "@/stores/loginUser";

const route = useRoute();
const router = useRouter();
const loginUserStore = useLoginUserStore();

// 当前登录用户
const loginUser = computed(() => loginUserStore.loginUser);

// 是否是自己的主页
const isOwnProfile = computed(() => {
  // 如果没有用户ID参数，默认是查看自己的主页
  if (!route.query.userId) {
    return true;
  }
  // 有用户ID参数，判断是否是当前登录用户
  return loginUser.value.id?.toString() === route.query.userId;
});

// 用户角色文本
const userRoleText = computed(() => {
  if (loginUser.value.userRole === 'admin') {
    return '管理员';
  }
  return '普通用户';
});

// 编辑表单
const editForm = reactive<API.UserUpdateRequest>({
  id: loginUser.value.id || 0,
  userName: loginUser.value.userName,
  userProfile: loginUser.value.userProfile,
});

// 更新相关
const updateLoading = ref(false);

// 更新用户信息
const handleUpdateUser = async () => {
  updateLoading.value = true;
  try {
    const res = await updateUser(editForm);
    if (res.data.code === 0) {
      message.success("个人信息更新成功");
      // 更新本地存储的用户信息
      loginUserStore.setLoginUser({
        ...loginUser.value,
        userName: editForm.userName,
        userProfile: editForm.userProfile,
      });
      // 重新获取用户信息
      await loginUserStore.fetchLoginUser();
    } else {
      message.error("更新失败：" + (res.data.message || "未知错误"));
    }
  } catch (e) {
    message.error("更新失败：" + (e instanceof Error ? e.message : "未知错误"));
  } finally {
    updateLoading.value = false;
  }
};

// VIP兑换页面跳转
const goToVipExchange = () => {
  router.push("/user/vip/exchange");
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// 标签页相关
const activeTab = ref("settings");

// 页面加载时获取数据
onMounted(() => {
  // 重新获取用户信息
  loginUserStore.fetchLoginUser();
});
</script>

<style scoped>
.user-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  /* AI 主题渐变背景 */
  background:
    radial-gradient(ellipse at 10% 20%, rgba(139, 92, 246, 0.08), transparent 40%),
    radial-gradient(ellipse at 90% 80%, rgba(6, 182, 212, 0.08), transparent 40%);
  min-height: calc(100vh - var(--layout-header-height));
}

.user-info-card {
  margin-bottom: 32px;
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-3);
  overflow: hidden;
}

.avatar-container {
  text-align: center;
  padding: 40px 24px 32px;
  position: relative;
}

/* 发光效果 */
.avatar-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: var(--gradient-ai-primary);
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(20px);
  z-index: 0;
}

.user-avatar {
  position: relative;
  z-index: 1;
  border: 3px solid white;
  box-shadow: var(--shadow-glow-purple);
  border-radius: 50%;
  transition: all var(--transition-base);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow-strong);
}

.avatar-uploader > .ant-upload {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: var(--shadow-3);
  background: var(--gradient-ai-card);
  transition: all var(--transition-base);
  position: relative;
  z-index: 1;
}

.avatar-uploader > .ant-upload:hover {
  border-style: solid !important;
  box-shadow: var(--shadow-glow-mixed);
  transform: scale(1.05);
}

.avatar-uploader img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: var(--color-primary);
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.user-details {
  padding: 24px;
}

.username {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  margin-bottom: 8px;
  background: var(--gradient-ai-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

.user-account {
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.user-account::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
}

.user-profile {
  color: var(--color-text-secondary);
  line-height: var(--line-height-lg);
  margin-bottom: 16px;
  font-size: var(--font-size-sm);
}

.user-stats {
  display: flex;
  align-items: center;
}

.content-tabs {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}

.search-bar {
  max-width: 400px;
  margin-bottom: 16px;
}

.vip-actions {
  text-align: center;
  padding: 16px;
}

.vip-exchange-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  color: #333;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.vip-exchange-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  color: #333;
}

.vip-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.vip-badge {
  font-weight: bold;
  font-size: 14px;
}

.vip-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.vip-number {
  font-size: 16px;
  font-weight: bold;
  color: #d4af37;
  background: linear-gradient(135deg, #fff8dc 0%, #ffd700 100%);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #d4af37;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
  width: 100%;
  text-align: center;
}

.vip-expire {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.no-vip-tip {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* VIP信息卡片样式 */
.user-vip-info-card {
  background: linear-gradient(135deg, #fff8dc 0%, #fff 100%);
  border: 1px solid #d4af37;
  height: 100%;
}

.vip-content {
  text-align: center;
  padding: 8px;
}

.vip-title {
  color: #d4af37;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vip-exchange-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  color: #333;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  margin: 16px 0;
  transition: all 0.3s ease;
}

.vip-exchange-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  color: #333;
}

.vip-features {
  margin-top: 20px;
  text-align: left;
}

.vip-features h4 {
  color: #d4af37;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: center;
}

.vip-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vip-features li {
  padding: 4px 0;
  font-size: 12px;
  color: #666;
  position: relative;
  padding-left: 16px;
}

.vip-features li:before {
  content: "✓";
  color: #d4af37;
  position: absolute;
  left: 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  .user-details {
    text-align: center;
    padding-top: 16px;
  }

  .user-stats {
    justify-content: center;
  }

  .vip-content {
    padding: 16px;
  }

  .vip-title {
    font-size: 16px;
  }
}
</style>
