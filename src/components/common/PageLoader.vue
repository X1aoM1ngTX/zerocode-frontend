<template>
  <div class="page-loader">
    <div class="loader-content">
      <div class="spinner-wrapper">
        <a-spin size="large" :indicator="indicator" />
      </div>
      <div v-if="text" class="loader-text">{{ text }}</div>
      <div v-if="showProgress" class="loader-progress">
        <a-progress :percent="progress" :show-info="false" stroke-color="var(--color-primary)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue'

interface Props {
  text?: string
  showProgress?: boolean
  progress?: number
}

withDefaults(defineProps<Props>(), {
  text: '',
  showProgress: false,
  progress: 0,
})

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '48px',
    color: 'var(--color-primary)',
  },
  spin: true,
})
</script>

<style scoped>
.page-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fade-in 0.3s ease-out;
}

.loader-content {
  text-align: center;
  animation: scale-in 0.3s ease-out;
}

.spinner-wrapper {
  margin-bottom: var(--spacing-lg);
}

.loader-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-base);
}

.loader-progress {
  margin-top: var(--spacing-lg);
  width: 200px;
}

[data-theme='dark'] .page-loader {
  background: rgba(0, 0, 0, 0.9);
}
</style>
