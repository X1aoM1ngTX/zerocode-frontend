<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 左侧装饰区域 -->
      <div class="register-decorate">
        <div class="decorate-content">
          <div class="decorate-logo">
            <span class="logo-icon">✨</span>
            <h1 class="logo-title">ZeroCode</h1>
          </div>
          <p class="decorate-slogan">开启你的零代码创作之旅</p>
          <div class="decorate-features">
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <div class="feature-text">快速创建应用</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div class="feature-text">精美界面设计</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">智能代码生成</div>
            </div>
          </div>
        </div>
        <div class="decorate-bg">
          <div class="bg-circle circle-1"></div>
          <div class="bg-circle circle-2"></div>
          <div class="bg-circle circle-3"></div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="register-form-container">
        <div class="register-form-wrapper">
          <div class="form-header">
            <h2 class="form-title">创建账号</h2>
            <p class="form-subtitle">加入 ZeroCode 开始创作</p>
          </div>

          <a-form
            ref="formRef"
            :model="formState"
            name="register"
            class="register-form"
            autocomplete="off"
            @finish="handleSubmit"
          >
            <a-form-item
              name="userAccount"
              :rules="[
                { required: true, message: '请输入账号' },
                { min: 4, message: '账号长度不能小于 4 位' },
                { max: 20, message: '账号长度不能超过 20 位' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线' },
              ]"
            >
              <a-input
                v-model:value="formState.userAccount"
                placeholder="请输入账号（4-20位字母、数字或下划线）"
                size="large"
                :prefix="h(UserOutlined)"
                allow-clear
              />
            </a-form-item>

            <a-form-item
              name="userPassword"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码长度不能小于 8 位' },
                { max: 20, message: '密码长度不能超过 20 位' },
              ]"
            >
              <a-input-password
                v-model:value="formState.userPassword"
                placeholder="请输入密码（至少8位）"
                size="large"
                :prefix="h(LockOutlined)"
              />
            </a-form-item>

            <a-form-item
              name="checkPassword"
              :rules="[
                { required: true, message: '请确认密码' },
                { validator: validatePassword },
              ]"
            >
              <a-input-password
                v-model:value="formState.checkPassword"
                placeholder="请再次输入密码"
                size="large"
                :prefix="h(SafetyOutlined)"
              />
            </a-form-item>

            <div class="form-tips">
              <span class="tip-icon">💡</span>
              <span>密码建议包含字母、数字和特殊字符</span>
            </div>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="submitting"
                block
              >
                {{ submitting ? '注册中...' : '注册' }}
              </a-button>
            </a-form-item>
          </a-form>

          <div class="form-footer">
            <span class="footer-text">已有账号？</span>
            <RouterLink to="/user/login" class="login-link">
              立即登录
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons-vue'
import { userRegister } from '@/api/user'
import { message } from 'ant-design-vue'
import { useErrorHandler } from '@/composables'
import type { FormInstance } from 'ant-design-vue'

const router = useRouter()
const { handleError } = useErrorHandler()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

// 密码确认验证
const validatePassword = (_rule: any, value: string) => {
  if (value !== formState.userPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

/**
 * 提交表单
 */
const handleSubmit = async (values: API.UserRegisterRequest) => {
  submitting.value = true
  try {
    const res = await userRegister(values)

    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功，即将跳转到登录页面')

      // 延迟跳转，让用户看到成功提示
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
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.register-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slide-in-up 0.6s ease-out;
}

/* 左侧装饰区域 */
.register-decorate {
  flex: 1;
  padding: 60px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.decorate-content {
  position: relative;
  z-index: 2;
}

.decorate-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 48px;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.decorate-slogan {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 60px;
}

.decorate-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(8px);
}

.feature-icon {
  font-size: 32px;
}

.feature-text {
  font-size: 16px;
  font-weight: 500;
}

.decorate-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 右侧表单区域 */
.register-form-container {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.register-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.register-form {
  margin-top: 32px;
}

.register-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.ant-input-affix-wrapper),
.register-form :deep(.ant-input) {
  border-radius: 8px;
  padding: 12px 16px;
}

.register-form :deep(.ant-input-prefix) {
  color: #94a3b8;
  margin-right: 12px;
}

.form-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  font-size: 13px;
  color: #0369a1;
}

.tip-icon {
  font-size: 16px;
}

.register-form :deep(.ant-btn-primary) {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.register-form :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.footer-text {
  color: #64748b;
  font-size: 14px;
}

.login-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: color 0.3s;
}

.login-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .register-decorate {
    padding: 40px 20px;
  }

  .decorate-features {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .feature-item {
    flex: 1;
    min-width: 200px;
  }

  .register-form-container {
    padding: 40px 20px;
  }
}
</style>
