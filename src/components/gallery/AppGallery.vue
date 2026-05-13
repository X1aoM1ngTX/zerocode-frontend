<template>
  <section class="app-gallery">
    <div class="gallery-header">
      <div>
        <p v-if="eyebrow" class="gallery-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <a-button type="link" :loading="loading" @click="$emit('refresh')">
        <template #icon>
          <ReloadOutlined />
        </template>
        刷新
      </a-button>
    </div>

    <SkeletonLoader v-if="loading" type="card" :count="6" />
    <EmptyState v-else-if="apps.length === 0" type="noData" :title="emptyTitle" :description="emptyDescription">
      <template #action>
        <slot name="emptyAction" />
      </template>
    </EmptyState>
    <template v-else>
      <div class="gallery-grid">
        <AppCard
          v-for="app in apps"
          :key="app.id"
          :app="app"
          :featured="featured"
          @view-chat="$emit('viewChat', $event)"
          @view-work="$emit('viewWork', $event)"
        />
      </div>
      <div v-if="total > pageSize" class="gallery-pagination">
        <a-pagination
          :current="current"
          :page-size="pageSize"
          :total="total"
          :show-size-changer="false"
          :show-total="(value: number) => `共 ${value} 个应用`"
          @change="(page: number) => $emit('pageChange', page)"
        />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ReloadOutlined } from '@ant-design/icons-vue'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

defineProps<{
  apps: API.AppVO[]
  current: number
  description: string
  emptyDescription: string
  emptyTitle: string
  loading: boolean
  pageSize: number
  title: string
  total: number
  eyebrow?: string
  featured?: boolean
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'pageChange', page: number): void
  (e: 'viewChat', appId: string | number | undefined): void
  (e: 'viewWork', app: API.AppVO): void
}>()
</script>

<style scoped>
.app-gallery {
  min-height: calc(100vh - var(--layout-header-height));
  padding: 52px 24px 72px;
  background:
    radial-gradient(circle at 80% 0%, rgba(83, 121, 255, 0.12), transparent 32%),
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
}

.gallery-header {
  width: min(100%, 1180px);
  margin: 0 auto 28px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.gallery-eyebrow {
  margin: 0 0 8px;
  color: #315cff;
  font-size: 14px;
  font-weight: 700;
}

.gallery-header h1 {
  margin: 0;
  color: #172033;
  font-size: 28px;
  font-weight: 800;
}

.gallery-header p {
  margin: 10px 0 0;
  color: #61708a;
  font-size: 14px;
}

.gallery-grid {
  width: min(100%, 1180px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.gallery-pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .app-gallery {
    padding: 32px 16px 56px;
  }

  .gallery-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
