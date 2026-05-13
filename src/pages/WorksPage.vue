<template>
  <AppGallery
    eyebrow="我的作品"
    title="我的作品"
    description="管理你创建过的应用，继续对话、预览或查看已经部署的作品。"
    empty-title="还没有创建任何应用"
    empty-description="从首页输入你的想法，创建第一个 Vexor 应用。"
    :apps="apps"
    :current="page.current"
    :page-size="page.pageSize"
    :total="page.total"
    :loading="loading"
    @refresh="loadApps"
    @page-change="handlePageChange"
    @view-chat="viewChat"
    @view-work="viewWork"
  >
    <template #emptyAction>
      <a-button type="primary" @click="router.push('/')">开始创建</a-button>
    </template>
  </AppGallery>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppGallery from '@/components/gallery/AppGallery.vue'
import { listMyAppVoByPage } from '@/api/app'
import { getDeployUrl } from '@/config/env'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const apps = ref<API.AppVO[]>([])
const loading = ref(false)
const page = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const loadApps = async () => {
  if (!loginUserStore.loginUser.id) {
    await router.push('/user/login?redirect=/works')
    return
  }
  loading.value = true
  try {
    const res = await listMyAppVoByPage({
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
