<template>
  <div class="skeleton-loader">
    <!-- 卡片骨架屏 -->
    <template v-if="type === 'card'">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton skeleton-card-image"></div>
        <div class="skeleton skeleton-card-title"></div>
        <div class="skeleton skeleton-card-text"></div>
        <div class="skeleton skeleton-card-text short"></div>
      </div>
    </template>

    <!-- 列表骨架屏 -->
    <template v-else-if="type === 'list'">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton skeleton-list-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton skeleton-list-title"></div>
          <div class="skeleton skeleton-list-text"></div>
        </div>
      </div>
    </template>

    <!-- 表格骨架屏 -->
    <template v-else-if="type === 'table'">
      <div class="skeleton-table">
        <div class="skeleton-table-header">
          <div v-for="col in columns" :key="col" class="skeleton skeleton-table-cell"></div>
        </div>
        <div v-for="row in rows" :key="row" class="skeleton-table-row">
          <div v-for="col in columns" :key="col" class="skeleton skeleton-table-cell"></div>
        </div>
      </div>
    </template>

    <!-- 表单骨架屏 -->
    <template v-else-if="type === 'form'">
      <div class="skeleton-form">
        <div class="skeleton skeleton-form-label"></div>
        <div class="skeleton skeleton-form-input"></div>
        <div class="skeleton skeleton-form-label"></div>
        <div class="skeleton skeleton-form-input"></div>
        <div class="skeleton skeleton-form-label"></div>
        <div class="skeleton skeleton-form-input"></div>
        <div class="skeleton skeleton-form-button"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'list' | 'table' | 'form'
  count?: number
  columns?: number
  rows?: number
}

withDefaults(defineProps<Props>(), {
  type: 'card',
  count: 3,
  columns: 4,
  rows: 5,
})
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

/* 卡片骨架屏 */
.skeleton-card {
  background: var(--color-bg-container);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-base);
}

.skeleton-card-image {
  height: 200px;
  margin-bottom: var(--spacing-base);
  border-radius: var(--radius-base);
}

.skeleton-card-title {
  height: 24px;
  width: 60%;
  margin-bottom: var(--spacing-base);
}

.skeleton-card-text {
  height: 16px;
  margin-bottom: var(--spacing-sm);
}

.skeleton-card-text.short {
  width: 40%;
}

/* 列表骨架屏 */
.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border-light);
}

.skeleton-list-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  margin-right: var(--spacing-base);
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-list-title {
  height: 18px;
  width: 40%;
  margin-bottom: var(--spacing-sm);
}

.skeleton-list-text {
  height: 14px;
  width: 70%;
}

/* 表格骨架屏 */
.skeleton-table {
  width: 100%;
}

.skeleton-table-header {
  display: flex;
  padding: var(--spacing-base);
  background: var(--color-bg-layout);
  border-radius: var(--radius-base) var(--radius-base) 0 0;
  gap: var(--spacing-base);
}

.skeleton-table-row {
  display: flex;
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border-light);
  gap: var(--spacing-base);
}

.skeleton-table-cell {
  height: 16px;
  flex: 1;
}

/* 表单骨架屏 */
.skeleton-form {
  max-width: 500px;
  padding: var(--spacing-lg);
}

.skeleton-form-label {
  height: 16px;
  width: 80px;
  margin-bottom: var(--spacing-sm);
}

.skeleton-form-input {
  height: 40px;
  margin-bottom: var(--spacing-lg);
}

.skeleton-form-button {
  height: 40px;
  width: 120px;
  margin-top: var(--spacing-base);
}

/* 骨架屏基础样式 */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-layout) 0%,
    var(--color-border-light) 50%,
    var(--color-bg-layout) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-base);
}
</style>
