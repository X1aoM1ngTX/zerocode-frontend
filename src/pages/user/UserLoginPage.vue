<template>
  <div class="auth-page">
    <AuthCard title="欢迎回来" subtitle="登录到你的 Vexor 账户">
      <a-form
        :model="formState"
        name="login"
        class="auth-form"
        autocomplete="off"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item name="userAccount" label="邮箱地址" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input
            v-model:value="formState.userAccount"
            placeholder="admin@vexor.com"
            size="large"
            allow-clear
          />
        </a-form-item>

        <a-form-item
          name="userPassword"
          label="密码"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
          ]"
        >
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
        </a-form-item>

        <div class="form-row">
          <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
          <RouterLink to="/user/reset-password">忘记密码？</RouterLink>
        </div>

        <a-button type="primary" html-type="submit" size="large" :loading="submitting" block>
          {{ submitting ? '登录中...' : '登录' }}
        </a-button>
      </a-form>

      <div class="auth-footer">
        <span>还没有账户？</span>
        <RouterLink to="/user/register">立即注册</RouterLink>
      </div>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { userLogin } from '@/api/user'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { useErrorHandler } from '@/composables'
import AuthCard from '@/components/auth/AuthCard.vue'

const route = useRoute()
const loginUserStore = useLoginUserStore()
const { handleError } = useErrorHandler()

const submitting = ref(false)
const rememberMe = ref(false)

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const handleSubmit = async (values: API.UserLoginRequest) => {
  submitting.value = true
  try {
    const res = await userLogin(values)

    if (res.data.code === 0 && res.data.data) {
      loginUserStore.setLoginUser(res.data.data)

      if (rememberMe.value) {
        localStorage.setItem('login-user', JSON.stringify(res.data.data))
      } else {
        sessionStorage.setItem('login-user', JSON.stringify(res.data.data))
      }

      message.success('登录成功')
      const redirect = route.query.redirect as string
      window.location.href = redirect || '/'
    } else {
      message.error('登录失败，' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    handleError(error, { defaultMessage: '登录失败，请重试' })
  } finally {
    submitting.value = false
  }
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

.auth-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.auth-form :deep(.ant-form-item-label > label) {
  color: #263244;
  font-weight: 600;
}

.auth-form :deep(.ant-input),
.auth-form :deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 22px;
  font-size: 14px;
}

.auth-form :deep(.ant-btn-primary) {
  height: 46px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #4169ff 0%, #2554f4 100%);
  font-weight: 700;
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  color: #5f6b7d;
  font-size: 14px;
}
</style>
