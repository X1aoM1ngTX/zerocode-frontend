<template>
  <div class="user-profile-page">
    <div class="profile-shell">
      <aside class="profile-sidebar">
        <a-card class="profile-summary-card" :bordered="false">
          <div class="avatar-container">
            <a-avatar
              :size="112"
              :src="loginUser.userAvatar"
              class="user-avatar"
            >
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
          </div>

          <div class="profile-identity">
            <h1 class="username">{{ loginUser.userName || "未设置用户名" }}</h1>
            <p class="user-account">{{ loginUser.userAccount }}</p>
            <p class="user-profile">
              {{ loginUser.userProfile || "这个人很懒，什么都没留下~" }}
            </p>
          </div>

          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">用户角色</span>
              <span class="meta-value">{{ userRoleText }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建时间</span>
              <span class="meta-value">{{ formatDate(loginUser.createTime) }}</span>
            </div>
          </div>
        </a-card>

        <a-card v-if="isOwnProfile" class="vip-card" :bordered="false">
          <div class="vip-header">
            <div class="vip-icon">
              <CrownOutlined />
            </div>
            <div>
              <h2 class="vip-title">VIP会员服务</h2>
              <p class="vip-subtitle">解锁更多生成与协作能力</p>
            </div>
          </div>

          <div class="vip-status">
            <div v-if="loginUser.isVip" class="vip-info">
              <a-tag color="gold" class="vip-badge">
                <CrownOutlined /> VIP会员
              </a-tag>
              <div class="vip-number">
                {{ `VIP${loginUser.id && loginUser.id.toString().slice(-5).padStart(5, '0')}` }}
              </div>
              <div class="vip-expire" v-if="loginUser.vipExpireTime">
                到期时间：{{ formatDate(loginUser.vipExpireTime) }}
              </div>
            </div>
            <span v-else class="no-vip-tip">兑换VIP享受更多特权</span>
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
            <div class="vip-feature">无限制应用创建</div>
            <div class="vip-feature">高级模板使用</div>
            <div class="vip-feature">专属客服支持</div>
            <div class="vip-feature">优先功能体验</div>
          </div>
        </a-card>
      </aside>

      <main class="profile-main">
        <a-card class="settings-card" :bordered="false">
          <div class="settings-header">
            <div>
              <h2 class="settings-title">个人设置</h2>
              <p class="settings-desc">维护你的公开资料与平台身份信息</p>
            </div>
          </div>

          <a-form
            v-if="isOwnProfile"
            :model="editForm"
            layout="vertical"
            @finish="handleUpdateUser"
            class="settings-form"
          >
            <a-form-item label="用户名" name="userName">
              <a-input
                v-model:value="editForm.userName"
                placeholder="请输入用户名"
                size="large"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="个人简介" name="userProfile">
              <a-textarea
                v-model:value="editForm.userProfile"
                placeholder="请输入个人简介"
                :rows="6"
                show-count
                :maxlength="200"
              />
            </a-form-item>
            <a-form-item class="form-actions">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="updateLoading"
              >
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </main>
    </div>
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

// 页面加载时获取数据
onMounted(() => {
  // 重新获取用户信息
  loginUserStore.fetchLoginUser();
});
</script>

<style scoped>
.user-profile-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 24px;
  background:
    radial-gradient(ellipse at 10% 10%, rgba(79, 70, 229, 0.08), transparent 34%),
    radial-gradient(ellipse at 88% 78%, rgba(20, 184, 166, 0.08), transparent 36%),
    #f8fafc;
  min-height: calc(100vh - var(--layout-header-height));
}

.profile-shell {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.profile-sidebar {
  display: grid;
  gap: 16px;
}

.profile-summary-card,
.vip-card,
.settings-card {
  border: 1px solid rgba(226, 232, 240, 0.86);
  border-radius: 12px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.profile-summary-card,
.settings-card {
  background: rgba(255, 255, 255, 0.94);
}

.avatar-container {
  text-align: center;
  padding: 24px 20px 16px;
  position: relative;
}

.avatar-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 132px;
  height: 132px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(20, 184, 166, 0.18));
  border-radius: 50%;
  filter: blur(18px);
  z-index: 0;
}

.user-avatar {
  position: relative;
  z-index: 1;
  border: 4px solid #fff;
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.22);
  border-radius: 50%;
}

.username {
  font-family: var(--font-family-heading);
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: #0f172a;
  text-align: center;
  margin: 0 0 8px;
}

.user-account {
  color: #64748b;
  margin: 0 0 14px;
  font-size: 14px;
  text-align: center;
  word-break: break-all;
}

.user-profile {
  color: #475569;
  line-height: var(--line-height-lg);
  margin: 0;
  font-size: 14px;
  text-align: center;
}

.profile-identity {
  padding: 0 24px 20px;
}

.profile-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.meta-item {
  padding: 16px;
  text-align: center;
}

.meta-item + .meta-item {
  border-left: 1px solid #e2e8f0;
}

.meta-label {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
}

.meta-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
}

.vip-card {
  background: linear-gradient(135deg, #fff7d6 0%, #ffffff 72%);
}

.vip-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.vip-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #a16207;
  background: rgba(250, 204, 21, 0.22);
}

.vip-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.vip-badge {
  width: max-content;
  font-weight: 600;
}

.vip-number {
  font-size: 15px;
  font-weight: 700;
  color: #854d0e;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(202, 138, 4, 0.22);
  width: 100%;
}

.vip-expire {
  font-size: 13px;
  color: #64748b;
}

.no-vip-tip {
  display: block;
  color: #854d0e;
  font-size: 14px;
  margin-bottom: 2px;
}

.vip-title {
  color: #713f12;
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px;
}

.vip-subtitle {
  color: #854d0e;
  font-size: 13px;
  margin: 0;
}

.vip-exchange-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 100%);
  border: none;
  color: #3f2a02;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.22);
  margin: 16px 0;
}

.vip-exchange-btn:hover {
  background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%);
  color: #3f2a02;
}

.vip-features {
  display: grid;
  gap: 8px;
}

.vip-feature {
  color: #475569;
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(226, 232, 240, 0.72);
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 10px;
}

.settings-card {
  min-height: 520px;
}

.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.settings-title {
  color: #0f172a;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
}

.settings-desc {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.settings-form {
  max-width: 620px;
}

.form-actions {
  margin-top: 28px;
}

@media (max-width: 900px) {
  .profile-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .user-profile-page {
    padding: 20px 16px;
  }

  .profile-meta {
    grid-template-columns: 1fr;
  }

  .meta-item + .meta-item {
    border-left: 0;
    border-top: 1px solid #e2e8f0;
  }
}
</style>
