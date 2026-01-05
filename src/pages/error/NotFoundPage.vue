<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <div class="error-title">页面不存在</div>
        <div class="error-description">
          抱歉，您访问的页面不存在或已被移除
        </div>
        <div class="error-actions">
          <a-button type="primary" size="large" @click="goHome">
            <template #icon>
              <HomeOutlined />
            </template>
            返回首页
          </a-button>
          <a-button size="large" @click="goBack">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
            返回上页
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f5f9fc 0%, #e8f4f8 100%);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  position: relative;
  text-align: center;
  padding: 60px 40px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #1565c0;
  margin-bottom: 16px;
}

.error-description {
  font-size: 16px;
  color: #546e7a;
  margin-bottom: 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
