<template>
  <div class="auth-page">
    <AuthCard title="重置密码" subtitle="输入你的邮箱，我们将发送重置链接">
      <a-form :model="formState" class="auth-form" autocomplete="off" @finish="handleSubmit">
        <a-form-item
          name="email"
          label="邮箱地址"
          :rules="[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]"
        >
          <a-input v-model:value="formState.email" size="large" placeholder="请输入你的邮箱地址" />
        </a-form-item>
        <a-button type="primary" html-type="submit" size="large" block :loading="submitting">
          发送重置链接
        </a-button>
      </a-form>
      <div class="auth-footer">
        <RouterLink to="/user/login">返回登录</RouterLink>
      </div>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const submitting = ref(false)
const formState = reactive({
  email: '',
})

const handleSubmit = async () => {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    message.info('重置密码邮件功能正在接入中')
  }, 400)
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--layout-header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background:
    radial-gradient(circle at 50% 0%, rgba(65, 105, 255, 0.12), transparent 36%),
    linear-gradient(180deg, #f9fbff 0%, #eef4ff 100%);
}

.auth-form :deep(.ant-form-item-label > label) {
  color: #263244;
  font-weight: 600;
}

.auth-form :deep(.ant-input),
.auth-form :deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

.auth-form :deep(.ant-btn-primary) {
  height: 46px;
  border-radius: 6px;
  background: linear-gradient(135deg, #4169ff 0%, #2554f4 100%);
  font-weight: 700;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
}
</style>
