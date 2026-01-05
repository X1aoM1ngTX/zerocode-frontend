<template>
  <div class="empty-state">
    <div class="empty-icon">
      <component :is="iconComponent" />
    </div>
    <div class="empty-title">{{ title }}</div>
    <div v-if="description" class="empty-description">{{ description }}</div>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  FileSearchOutlined,
  InboxOutlined,
  SearchOutlined,
  WifiOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue'

interface Props {
  type?: 'noData' | 'noResult' | 'noNetwork' | 'noHistory' | 'custom'
  title?: string
  description?: string
  icon?: Component
}

const props = withDefaults(defineProps<Props>(), {
  type: 'noData',
  title: '',
  description: '',
})

const iconComponent = computed(() => {
  if (props.icon) return props.icon

  const iconMap = {
    noData: InboxOutlined,
    noResult: SearchOutlined,
    noNetwork: WifiOutlined,
    noHistory: ClockCircleOutlined,
    custom: FileSearchOutlined,
  }

  return iconMap[props.type] || FileSearchOutlined
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
  text-align: center;
  animation: fade-in 0.3s ease-out;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-quaternary);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
  transition: all var(--transition-base);
}

.empty-state:hover .empty-icon {
  opacity: 0.8;
  transform: scale(1.1);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  max-width: 400px;
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-lg);
}

.empty-action {
  margin-top: var(--spacing-base);
}
</style>
