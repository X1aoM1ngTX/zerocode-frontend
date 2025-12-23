import request from '@/request'

/** 生成图像 生成图像 POST /image/generate */
export async function generateImage(body: API.ImageGenerateRequest, options?: Record<string, unknown>) {
  return request<API.BaseResponseImageGenerateResponse>('/image/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
