<template>
  <div class="image-gen-page">
    <div class="container">
      <div class="content-wrapper">
        <!-- 左侧输入区域 -->
        <div class="input-section">
          <h2 class="section-title">图像生成</h2>

          <!-- 正向提示词 -->
          <div class="form-item">
            <label class="form-label">正向提示词</label>
            <a-textarea
              v-model:value="form.userPrompt"
              placeholder="描述你想要生成的图像内容..."
              :rows="6"
              :maxlength="800"
              show-count
              class="prompt-textarea"
            />
          </div>

          <!-- 负向提示词 -->
          <div class="form-item">
            <label class="form-label">负向提示词</label>
            <a-textarea
              v-model:value="form.negativePrompt"
              placeholder="描述你不希望在图像中出现的元素..."
              :rows="3"
              :maxlength="500"
              show-count
              class="prompt-textarea"
            />
          </div>

          <!-- 分辨率 -->
          <div class="form-item">
            <label class="form-label">分辨率</label>
            <a-select
              v-model:value="form.size"
              placeholder="选择分辨率"
              class="size-select"
            >
              <a-select-option value="1024*1024">1024 x 1024 (1:1)</a-select-option>
              <a-select-option value="832*1248">832 x 1248 (2:3)</a-select-option>
              <a-select-option value="1248*832">1248 x 832 (3:2)</a-select-option>
              <a-select-option value="864*1152">864 x 1152 (3:4)</a-select-option>
              <a-select-option value="1152*864">1152 x 864 (4:3)</a-select-option>
              <a-select-option value="896*1152">896 x 1152 (7:9)</a-select-option>
              <a-select-option value="1152*896">1152 x 896 (9:7)</a-select-option>
              <a-select-option value="720*1280">720 x 1280 (9:16)</a-select-option>
              <a-select-option value="1280*720">1280 x 720 (16:9)</a-select-option>
              <a-select-option value="1024*1536">1024 x 1536 (2:3 推荐)</a-select-option>
              <a-select-option value="1536*1024">1536 x 1024 (3:2 推荐)</a-select-option>
            </a-select>
          </div>

          <!-- 随机种子 -->
          <div class="form-item">
            <label class="form-label">随机种子</label>
            <a-input-number
              v-model:value="form.seed"
              :min="0"
              :max="2147483647"
              placeholder="留空则随机生成"
              class="seed-input"
              style="width: 100%"
            />
            <div class="form-hint">使用相同的种子值可以获得相似的生成结果</div>
          </div>

          <!-- 智能改写 -->
          <div class="form-item">
            <label class="form-label">智能提示词改写</label>
            <a-switch
              v-model:checked="form.promptExtend"
              checked-children="开启"
              un-checked-children="关闭"
              class="extend-switch"
            />
            <div class="form-hint">开启后会使用大模型优化提示词，但会增加响应时间和费用</div>
          </div>

          <!-- 生成按钮 -->
          <a-button
            type="primary"
            size="large"
            :loading="generating"
            :disabled="!form.userPrompt"
            @click="handleGenerate"
            class="generate-btn"
          >
            <template #icon>
              <PictureOutlined />
            </template>
            生成图像
          </a-button>
        </div>

        <!-- 右侧展示区域 -->
        <div class="output-section">
          <!-- 输入的提示词 -->
          <div class="prompt-display">
            <h3 class="display-title">当前提示词</h3>
            <div class="prompt-content">
              <div v-if="form.userPrompt" class="prompt-text">
                {{ form.userPrompt }}
              </div>
              <div v-else class="prompt-empty">
                请输入提示词...
              </div>
            </div>
          </div>

          <!-- 生成的图像 -->
          <div class="image-display">
            <h3 class="display-title">生成结果</h3>
            <div v-if="generating" class="loading-wrapper">
              <a-spin size="large" tip="正在生成图像，请稍候..." />
            </div>
            <div v-else-if="result" class="result-wrapper">
              <img
                :src="result.imageUrl"
                :alt="result.text"
                class="generated-image"
              />
              <div class="result-info">
                <div class="info-item">
                  <span class="info-label">尺寸:</span>
                  <span class="info-value">{{ result.width }} x {{ result.height }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">请求ID:</span>
                  <span class="info-value">{{ result.requestId }}</span>
                </div>
                <a-button
                  type="link"
                  size="small"
                  @click="downloadImage"
                  class="download-btn"
                >
                  <DownloadOutlined />
                  下载图像
                </a-button>
              </div>
              <!-- 改写后的提示词 -->
              <div v-if="form.promptExtend && result.text" class="rewritten-prompt">
                <div class="rewritten-title">改写后的提示词:</div>
                <div class="rewritten-text">{{ result.text }}</div>
              </div>
              <!-- 思考过程 -->
              <div v-if="form.promptExtend && result.reasoningContent" class="reasoning-content">
                <div class="reasoning-title">思考过程:</div>
                <div class="reasoning-text">{{ result.reasoningContent }}</div>
              </div>
            </div>
            <div v-else class="empty-result">
              <PictureOutlined class="empty-icon" />
              <p>生成的图像将显示在这里</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PictureOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { generateImage } from '@/api/image'
import { logger } from '@/utils/logger'

// 表单数据
const form = reactive<API.ImageGenerateRequest>({
  userPrompt: '',
  negativePrompt: '',
  size: '1024*1536',
  promptExtend: false,
  seed: undefined,
})

// 生成状态
const generating = ref(false)

// 生成结果
const result = ref<API.ImageGenerateResponse | null>(null)

// 生成图像
const handleGenerate = async () => {
  if (!form.userPrompt) {
    message.warning('请输入提示词')
    return
  }

  generating.value = true
  result.value = null

  try {
    const res = await generateImage({
      userPrompt: form.userPrompt,
      negativePrompt: form.negativePrompt?.trim() || undefined,
      size: form.size,
      promptExtend: form.promptExtend,
      seed: form.seed,
    })

    if (res.data.code === 0 && res.data.data) {
      result.value = res.data.data
      message.success('图像生成成功')
    } else {
      message.error('生成失败：' + res.data.message)
    }
  } catch (error) {
    logger.error('生成图像失败：', error)
    message.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 下载图像
const downloadImage = () => {
  if (result.value?.imageUrl) {
    const link = document.createElement('a')
    link.href = result.value.imageUrl
    link.download = `generated-image-${Date.now()}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.image-gen-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e2e8f0 100%);
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧输入区域 */
.input-section {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px;
  color: #1e293b;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.prompt-textarea {
  width: 100%;
  border-radius: 8px;
}

.size-select {
  width: 100%;
}

.seed-input {
  width: 100%;
}

.extend-switch {
  display: block;
}

.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 6px;
}

.generate-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 8px;
}

/* 右侧展示区域 */
.output-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.prompt-display,
.image-display {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.display-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #1e293b;
}

.prompt-content {
  min-height: 80px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.prompt-text {
  color: #475569;
  line-height: 1.6;
  word-break: break-word;
}

.prompt-empty {
  color: #8c8c8c;
  font-style: italic;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.result-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.generated-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.info-label {
  color: #8c8c8c;
}

.info-value {
  color: #475569;
  font-weight: 500;
}

.download-btn {
  margin-left: auto;
}

.rewritten-prompt,
.reasoning-content {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.rewritten-title,
.reasoning-title {
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.rewritten-text,
.reasoning-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .input-section,
  .output-section {
    flex: none;
    width: 100%;
  }
}
</style>
