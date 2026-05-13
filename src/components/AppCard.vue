<template>
  <div class="app-card" :class="{ 'app-card--featured': featured }" @click="handleCardClick">
    <div class="app-preview">
      <img
        v-if="app.cover"
        :src="app.cover"
        :alt="app.appName"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <div v-else class="app-placeholder">
        <CodepenOutlined class="placeholder-icon" />
        <span class="placeholder-text">暂无封面</span>
      </div>
      <div v-if="featured" class="featured-badge">
        <FireOutlined />
        <span>精选</span>
      </div>
      <div class="app-overlay">
        <a-space :size="8">
          <a-button type="primary" size="small" @click.stop="handleViewChat">
            <template #icon>
              <MessageOutlined />
            </template>
            查看对话
          </a-button>
          <a-button v-if="app.deployKey" type="default" size="small" @click.stop="handleViewWork">
            <template #icon>
              <RocketOutlined />
            </template>
            查看作品
          </a-button>
          <a-tooltip title="复制应用ID">
            <a-button type="text" size="small" class="copy-btn" @click.stop="handleCopyId">
              <template #icon>
                <CopyOutlined />
              </template>
            </a-button>
          </a-tooltip>
        </a-space>
      </div>
      <div v-if="imageLoading" class="image-loading">
        <LoadingOutlined />
      </div>
    </div>
    <div class="app-info">
      <div class="app-info-left">
        <a-avatar :src="app.user?.userAvatar" :size="40">
          {{ app.user?.userName?.charAt(0) || 'U' }}
        </a-avatar>
      </div>
      <div class="app-info-right">
        <h3 class="app-title" :title="app.appName || '未命名应用'">
          {{ app.appName || '未命名应用' }}
        </h3>
        <p class="app-author">
          <UserOutlined />
          {{ app.user?.userName || (featured ? 'Vexor 官方' : '未知用户') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  CodepenOutlined,
  MessageOutlined,
  RocketOutlined,
  CopyOutlined,
  UserOutlined,
  FireOutlined,
  LoadingOutlined,
} from '@ant-design/icons-vue'
import { useCopy } from '@/composables'

interface Props {
  app: API.AppVO
  featured?: boolean
}

interface Emits {
  (e: 'view-chat', appId: string | number | undefined): void
  (e: 'view-work', app: API.AppVO): void
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const emit = defineEmits<Emits>()
const { copy } = useCopy()

const imageLoading = ref(false)
const imageError = ref(false)

const handleViewChat = () => {
  emit('view-chat', props.app.id)
}

const handleViewWork = () => {
  emit('view-work', props.app)
}

const handleCardClick = () => {
  handleViewChat()
}

const handleCopyId = async () => {
  const appId = String(props.app.id)
  await copy(appId, '应用ID已复制')
}

const handleImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

const handleImageError = () => {
  imageLoading.value = false
  imageError.value = true
}
</script>

<style scoped>
.app-card {
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-3);
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  border: 1px solid var(--color-border);
}

.app-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-ai-primary);
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 10;
}

.app-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-glow-mixed);
  border-color: rgba(139, 92, 246, 0.3);
}

.app-card:hover::before {
  opacity: 1;
}

.app-card--featured {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--color-bg-container), var(--color-bg-container)) padding-box,
    var(--gradient-ai-primary) border-box;
}

.app-card--featured::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-ai-card);
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.app-preview {
  height: 220px;
  background: var(--color-bg-layout);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.app-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.app-card:hover .app-preview img {
  transform: scale(1.08);
}

.app-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-base);
  color: var(--color-text-quaternary);
  background: var(--gradient-ai-card);
}

.placeholder-icon {
  font-size: 48px;
  opacity: 0.6;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
}

.placeholder-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.featured-badge {
  position: absolute;
  top: var(--spacing-base);
  left: var(--spacing-base);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--gradient-ai-glow);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.4);
  z-index: 2;
  animation: glow-pulse 2s ease-in-out infinite;
}

.app-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 1;
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-layout);
  z-index: 0;
}

.image-loading .anticon {
  font-size: 32px;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5));
}

.app-info {
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  position: relative;
  z-index: 1;
  background: var(--color-bg-container);
}

.app-info-left {
  flex-shrink: 0;
}

.app-info-left .ant-avatar {
  background: var(--gradient-ai-primary);
  border: 2px solid var(--color-bg-container);
  box-shadow: var(--shadow-glow-purple);
}

.app-info-right {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 6px 0;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-author {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-author .anticon {
  font-size: 12px;
  color: var(--color-primary);
}

.app-meta {
  display: flex;
  gap: var(--spacing-base);
  margin-top: var(--spacing-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.meta-item .anticon {
  font-size: 12px;
}

.copy-btn {
  color: var(--color-primary) !important;
}

.copy-btn:hover {
  color: var(--color-primary-light) !important;
  background: rgba(139, 92, 246, 0.15) !important;
}

@media (max-width: 640px) {
  .app-preview {
    height: 180px;
  }

  .app-overlay {
    opacity: 1;
    background: rgba(15, 23, 42, 0.5);
  }

  .app-overlay .ant-space {
    flex-direction: column;
  }
}

/* 深色模式适配 */
[data-theme='dark'] .app-card {
  background: var(--glass-bg-dark);
}

[data-theme='dark'] .app-info {
  background: var(--color-bg-container);
}

[data-theme='dark'] .app-placeholder {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
}
</style>
