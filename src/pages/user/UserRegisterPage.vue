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
  /* AI 主题渐变背景 */
  background:
    radial-gradient(ellipse at 20% 20%, rgba(6, 182, 212, 0.3), transparent 40%),
    radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.3), transparent 40%),
    linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(236, 72, 153, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.register-container {
  width: 100%;
  max-width: 1100px;
  display: flex;
  background: var(--glass-bg-light);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), var(--shadow-glow-mixed);
  overflow: hidden;
  animation: slide-in-up 0.6s ease-out;
  position: relative;
  z-index: 1;
}

/* 左侧装饰区域 */
.register-decorate {
  flex: 1;
  padding: 60px 40px;
  background: var(--gradient-ai-dark);
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-decorate::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(6, 182, 212, 0.3), transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.2), transparent 50%);
  pointer-events: none;
}

.decorate-content {
  position: relative;
  z-index: 2;
}

.decorate-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 48px;
  filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.8));
}

.logo-title {
  font-family: var(--font-family-heading);
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  margin: 0;
  background: var(--gradient-ai-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.decorate-slogan {
  font-family: var(--font-family-body);
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: 60px;
  color: rgba(248, 250, 252, 0.8);
}

.decorate-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(6, 182, 212, 0.4);
  transform: translateX(8px);
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
}

.feature-icon {
  font-size: 32px;
}

.feature-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: rgba(248, 250, 252, 0.9);
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
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%);
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent 70%);
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 12s ease-in-out infinite;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 70%);
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
  background: var(--color-bg-container);
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
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-base);
  margin: 0 0 12px 0;
}

.form-subtitle {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  transition: all var(--transition-base);
}

.register-form :deep(.ant-input-affix-wrapper:focus),
.register-form :deep(.ant-input-affix-wrapper-focused),
.register-form :deep(.ant-input:focus) {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
}

.register-form :deep(.ant-input-prefix) {
  color: var(--color-secondary);
  margin-right: 12px;
}

.form-tips {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  color: var(--color-secondary-dark);
}

.tip-icon {
  font-size: 16px;
}

.register-form :deep(.ant-btn-primary) {
  height: 50px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  background: var(--gradient-ai-primary);
  border: none;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.register-form :deep(.ant-btn-primary:hover) {
  box-shadow: var(--shadow-glow-mixed);
  transform: translateY(-2px);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.footer-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  margin-left: 8px;
  transition: color var(--transition-base);
}

.login-link:hover {
  color: var(--color-primary-dark);
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

  .form-title {
    font-size: 24px;
  }
}
</style>
