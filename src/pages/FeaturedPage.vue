<template>
  <AppGallery
    eyebrow="精选案例"
    title="精选案例"
    description="浏览社区中的优秀应用案例，寻找下一个创作灵感。"
    empty-title="暂无精选案例"
    empty-description="精选应用发布后会展示在这里。"
    featured
    :apps="apps"
    :current="page.current"
    :page-size="page.pageSize"
    :total="page.total"
    :loading="loading"
    @refresh="loadApps"
    @page-change="handlePageChange"
    @view-chat="viewChat"
    @view-work="viewWork"
  />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppGallery from '@/components/gallery/AppGallery.vue'
import { listGoodAppVoByPage } from '@/api/app'
import { getDeployUrl } from '@/config/env'

const router = useRouter()
const apps = ref<API.AppVO[]>([])
const loading = ref(false)
const page = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const loadApps = async () => {
  loading.value = true
  try {
    const res = await listGoodAppVoByPage({
      current: page.current,
      pageSize: page.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })
    if (res.data.code === 0 && res.data.data) {
      apps.value = res.data.data.records || []
      page.total = res.data.data.totalRow || 0
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (current: number) => {
  page.current = current
  loadApps()
}

const viewChat = (appId: string | number | undefined) => {
  if (appId) router.push(`/app/chat/${appId}?view=1`)
}

const viewWork = (app: API.AppVO) => {
  if (app.deployKey) window.open(getDeployUrl(app.deployKey), '_blank')
}

onMounted(loadApps)
</script>
