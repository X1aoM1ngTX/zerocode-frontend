<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decorate">
        <div class="decorate-content">
          <div class="decorate-logo">
            <span class="logo-icon">✨</span>
            <h1 class="logo-title">ZeroCode</h1>
          </div>
          <p class="decorate-slogan">AI 驱动的零代码应用生成平台</p>
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
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录到 ZeroCode 开始创作</p>
          </div>

          <a-form
            :model="formState"
            name="login"
            class="login-form"
            autocomplete="off"
            @finish="handleSubmit"
          >
            <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
              <a-input
                v-model:value="formState.userAccount"
                placeholder="请输入账号"
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
              ]"
            >
              <a-input-password
                v-model:value="formState.userPassword"
                placeholder="请输入密码"
                size="large"
                :prefix="h(LockOutlined)"
              />
            </a-form-item>

            <div class="form-actions">
              <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
              <a class="forgot-link" @click="handleForgotPassword">忘记密码？</a>
            </div>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="submitting"
                block
              >
                {{ submitting ? '登录中...' : '登录' }}
              </a-button>
            </a-form-item>
          </a-form>

          <div class="form-footer">
            <span class="footer-text">还没有账号？</span>
            <RouterLink to="/user/register" class="register-link">
              立即注册
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLogin } from '@/api/user'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { useErrorHandler } from '@/composables'

const route = useRoute()
const loginUserStore = useLoginUserStore()
const { handleError } = useErrorHandler()

const submitting = ref(false)
const rememberMe = ref(false)

// 表单数据
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

/**
 * 提交表单
 */
const handleSubmit = async (values: API.UserLoginRequest) => {
  submitting.value = true
  try {
    const res = await userLogin(values)

    if (res.data.code === 0 && res.data.data) {
      // 保存登录态
      loginUserStore.setLoginUser(res.data.data)

      // 根据记住我选项决定是否保存到 localStorage
      if (rememberMe.value) {
        localStorage.setItem('login-user', JSON.stringify(res.data.data))
      } else {
        sessionStorage.setItem('login-user', JSON.stringify(res.data.data))
      }

      message.success('登录成功')

      // 获取重定向地址
      const redirect = route.query.redirect as string
      const targetUrl = redirect || '/'

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        window.location.href = targetUrl
      }, 300)
    } else {
      message.error('登录失败，' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    handleError(error, { defaultMessage: '登录失败，请重试' })
  } finally {
    submitting.value = false
  }
}

/**
 * 忘记密码处理
 */
const handleForgotPassword = () => {
  // 显示提示信息
  message.info('忘记密码功能正在开发中，请联系管理员重置密码')
  // TODO: 实现忘记密码功能
  // 1. 跳转到忘记密码页面
  // 2. 或者打开忘记密码弹窗
  // 3. 发送重置密码邮件
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 简化背景，使用纯色替代复杂渐变 */
  background: #667eea;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 移除伪元素，减少重绘 */
.login-page::before {
  display: none;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  /* 使用纯色背景，移除模糊效果 */
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slide-in-up 0.6s ease-out;
}

/* 左侧装饰区域 */
.login-decorate {
  flex: 1;
  padding: 60px 40px;
  /* 简化渐变背景 */
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
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
.login-form-container {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.login-form-wrapper {
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

.login-form {
  margin-top: 32px;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.ant-input-affix-wrapper),
.login-form :deep(.ant-input) {
  border-radius: 8px;
  padding: 12px 16px;
}

.login-form :deep(.ant-input-prefix) {
  color: #94a3b8;
  margin-right: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.forgot-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  cursor: pointer;
}

.forgot-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.login-form :deep(.ant-btn-primary) {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.login-form :deep(.ant-btn-primary:hover) {
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

.register-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: color 0.3s;
}

.register-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-decorate {
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

  .login-form-container {
    padding: 40px 20px;
  }
}
</style>
