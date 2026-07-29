<template>
  <div class="auth-page">
    <AuthCard title="创建账户" subtitle="加入 Vexor 开始你的创作之旅">
      <a-form
        ref="formRef"
        :model="formState"
        name="register"
        class="auth-form"
        autocomplete="off"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item
          name="userAccount"
          label="账号"
          :rules="[
            { required: true, message: '请输入账号' },
            { min: 4, message: '账号长度不能小于 4 位' },
            { max: 20, message: '账号长度不能超过 20 位' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线' },
          ]"
        >
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" allow-clear />
        </a-form-item>

        <a-form-item
          name="userPassword"
          label="密码"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
            { max: 20, message: '密码长度不能超过 20 位' },
          ]"
        >
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
        </a-form-item>

        <a-form-item
          name="checkPassword"
          label="确认密码"
          :rules="[{ required: true, message: '请确认密码' }, { validator: validatePassword }]"
        >
          <a-input-password v-model:value="formState.checkPassword" placeholder="请再次输入密码" size="large" />
        </a-form-item>

        <a-checkbox v-model:checked="accepted" class="agreement">
          我已阅读并同意
          <a>用户协议</a>
          和
          <a>隐私政策</a>
        </a-checkbox>

        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="submitting"
          :disabled="!accepted"
          block
        >
          {{ submitting ? '注册中...' : '注册' }}
        </a-button>
      </a-form>

      <div class="auth-footer">
        <span>已有账户？</span>
        <RouterLink to="/user/login">立即登录</RouterLink>
      </div>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/user'
import { message } from 'ant-design-vue'
import { useErrorHandler } from '@/composables'
import type { FormInstance } from 'ant-design-vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const router = useRouter()
const { handleError } = useErrorHandler()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const accepted = ref(false)

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const validatePassword = (_rule: unknown, value: string) => {
  if (value !== formState.userPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const handleSubmit = async (values: API.UserRegisterRequest) => {
  if (!accepted.value) {
    message.warning('请先同意用户协议和隐私政策')
    return
  }

  submitting.value = true
  try {
    const res = await userRegister(values)

    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功，即将跳转到登录页面')
      setTimeout(() => {
        router.push({
          path: '/user/login',
          replace: true,
        })
      }, 1000)
    } else {
      message.error('注册失败，' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    handleError(error, { defaultMessage: '注册失败，请重试' })
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
  margin-bottom: 14px;
}

.auth-form :deep(.ant-form-item-label > label) {
  color: #263244;
  font-weight: 600;
}

.auth-form :deep(.ant-input),
.auth-form :deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

.agreement {
  margin-bottom: 22px;
  color: #5f6b7d;
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
