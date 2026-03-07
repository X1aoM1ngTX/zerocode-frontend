<template>
  <div id="appEditPage">
    <div class="page-header">
      <h1>编辑应用信息</h1>
    </div>

    <div class="edit-container">
      <a-card title="基本信息" :loading="loading">
        <a-form
          :model="formData"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
          ref="formRef"
        >
          <a-form-item label="应用名称" name="appName">
            <a-input
              v-model:value="formData.appName"
              placeholder="请输入应用名称"
              :maxlength="50"
              show-count
            />
          </a-form-item>

          <a-form-item
            v-if="isAdmin"
            label="应用封面"
            name="cover"
            extra="支持图片链接，建议尺寸：400x300"
          >
            <a-input v-model:value="formData.cover" placeholder="请输入封面图片链接" />
            <div v-if="formData.cover" class="cover-preview">
              <a-image
                :src="formData.cover"
                :width="200"
                :height="150"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            </div>
          </a-form-item>

          <a-form-item v-if="isAdmin" label="优先级" name="priority" extra="设置为99表示精选应用">
            <a-input-number
              v-model:value="formData.priority"
              :min="0"
              :max="99"
              style="width: 200px"
            />
          </a-form-item>

          <a-form-item label="初始提示词" name="initPrompt">
            <a-textarea
              v-model:value="formData.initPrompt"
              placeholder="请输入初始提示词"
              :rows="4"
              :maxlength="1000"
              show-count
              disabled
            />
            <div class="form-tip">初始提示词不可修改</div>
          </a-form-item>

          <a-form-item label="生成类型" name="codeGenType">
            <a-input
              :value="formatCodeGenType(formData.codeGenType)"
              placeholder="生成类型"
              disabled
            />
            <div class="form-tip">生成类型不可修改</div>
          </a-form-item>

          <a-form-item v-if="formData.deployKey" label="部署密钥" name="deployKey">
            <a-input v-model:value="formData.deployKey" placeholder="部署密钥" disabled />
            <div class="form-tip">部署密钥不可修改</div>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" :loading="submitting">
                保存修改
              </a-button>
              <a-button @click="resetForm">重置</a-button>
              <a-button type="link" @click="goToChat">进入对话</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 应用信息展示 -->
      <a-card title="应用信息" style="margin-top: 24px">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="应用ID">
            {{ appInfo?.id }}
          </a-descriptions-item>
          <a-descriptions-item label="创建者">
            <UserInfo :user="appInfo?.user" size="small" />
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatTime(appInfo?.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatTime(appInfo?.updateTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="部署时间">
            {{ appInfo?.deployedTime ? formatTime(appInfo.deployedTime) : '未部署' }}
          </a-descriptions-item>
          <a-descriptions-item label="访问链接">
            <a-button v-if="appInfo?.deployKey" type="link" @click="openPreview" size="small">
              查看预览
            </a-button>
            <span v-else>未部署</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { getAppVoById, updateApp, updateAppByAdmin } from '@/api/app'
import { formatCodeGenType } from '@/utils/codeGenTypes'
import { formatTime } from '@/utils/time'
import UserInfo from '@/components/UserInfo.vue'
import { getStaticPreviewUrl } from '@/config/env'
import type { FormInstance } from 'ant-design-vue'
import { logger } from '@/utils/logger'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  appName: '',
  cover: '',
  priority: 0,
  initPrompt: '',
  codeGenType: '',
  deployKey: '',
})

// 是否为管理员
const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 表单验证规则
const rules = {
  appName: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 1, max: 50, message: '应用名称长度在1-50个字符', trigger: 'blur' },
  ],
  cover: [{ type: 'url', message: '请输入有效的URL', trigger: 'blur' }],
  priority: [{ type: 'number', min: 0, max: 99, message: '优先级范围0-99', trigger: 'blur' }],
}

// 获取应用信息
const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('应用ID不存在')
    router.push('/')
    return
  }

  loading.value = true
  try {
    const res = await getAppVoById({ id: id as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data

      // 检查权限
      if (!isAdmin.value && appInfo.value.userId !== loginUserStore.loginUser.id) {
        message.error('您没有权限编辑此应用')
        router.push('/')
        return
      }

      // 填充表单数据
      formData.appName = appInfo.value.appName || ''
      formData.cover = appInfo.value.cover || ''
      formData.priority = appInfo.value.priority || 0
      formData.initPrompt = appInfo.value.initPrompt || ''
      formData.codeGenType = appInfo.value.codeGenType || ''
      formData.deployKey = appInfo.value.deployKey || ''
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    logger.error('获取应用信息失败：', error)
    message.error('获取应用信息失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!appInfo.value?.id) return

  submitting.value = true
  try {
    let res
    if (isAdmin.value) {
      // 管理员可以修改更多字段
      res = await updateAppByAdmin({
        id: appInfo.value.id,
        appName: formData.appName,
        cover: formData.cover,
        priority: formData.priority,
      })
    } else {
      // 普通用户只能修改应用名称
      res = await updateApp({
        id: appInfo.value.id,
        appName: formData.appName,
      })
    }

    if (res.data.code === 0) {
      message.success('修改成功')
      // 重新获取应用信息
      await fetchAppInfo()
    } else {
      message.error('修改失败：' + res.data.message)
    }
  } catch (error) {
    logger.error('修改失败：', error)
    message.error('修改失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (appInfo.value) {
    formData.appName = appInfo.value.appName || ''
    formData.cover = appInfo.value.cover || ''
    formData.priority = appInfo.value.priority || 0
  }
  formRef.value?.clearValidate()
}

// 进入对话页面
const goToChat = () => {
  if (appInfo.value?.id) {
    router.push(`/app/chat/${appInfo.value.id}`)
  }
}

// 打开预览
const openPreview = () => {
  if (appInfo.value?.codeGenType && appInfo.value?.id) {
    const url = getStaticPreviewUrl(appInfo.value.codeGenType, String(appInfo.value.id))
    window.open(url, '_blank')
  }
}

// 页面加载时获取应用信息
onMounted(() => {
  fetchAppInfo()
})
</script>

<style scoped>
#appEditPage {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  min-height: calc(100vh - var(--layout-header-height));
  /* AI 主题渐变背景 */
  background:
    radial-gradient(ellipse at 10% 20%, rgba(139, 92, 246, 0.08), transparent 40%),
    radial-gradient(ellipse at 90% 80%, rgba(6, 182, 212, 0.08), transparent 40%);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px 24px;
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-3);
}

.page-header h1 {
  margin: 0;
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-ai-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.edit-container {
  border-radius: var(--radius-xl);
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-3);
}

.cover-preview {
  margin-top: 16px;
  padding: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-container);
  transition: all var(--transition-base);
}

.cover-preview:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.form-tip {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

:deep(.ant-card-head) {
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border);
}

:deep(.ant-descriptions-item-label) {
  background: var(--color-bg-layout);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  padding: 12px 16px;
}

:deep(.ant-descriptions-item-content) {
  padding: 12px 16px;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label > label) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-base);
}

:deep(.ant-input),
:deep(.ant-input-number) {
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  transition: all var(--transition-base);
}

:deep(.ant-input:focus),
:deep(.ant-input-number:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

:deep(.ant-btn-primary) {
  background: var(--gradient-ai-primary);
  border: none;
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  transition: all var(--transition-base);
}

:deep(.ant-btn-primary:hover) {
  box-shadow: var(--shadow-glow-mixed);
  transform: translateY(-2px);
}

:deep(.ant-card) {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2);
  border: 1px solid var(--color-border);
}

/* 响应式设计 */
@media (max-width: 768px) {
  #appEditPage {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }

  .page-header h1 {
    font-size: var(--font-size-xl);
  }
}

/* 深色模式适配 */
[data-theme='dark'] #appEditPage {
  background:
    radial-gradient(ellipse at 10% 20%, rgba(139, 92, 246, 0.06), transparent 40%),
    radial-gradient(ellipse at 90% 80%, rgba(6, 182, 212, 0.06), transparent 40%);
}

[data-theme='dark'] .page-header,
[data-theme='dark'] .edit-container {
  background: var(--glass-bg-dark);
}

[data-theme='dark'] :deep(.ant-descriptions-item-label) {
  background: var(--color-bg-layout);
}
</style>
