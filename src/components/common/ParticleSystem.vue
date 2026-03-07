<template>
  <div class="particle-system" ref="containerRef">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: particle.x + '%',
        animationDelay: particle.delay + 's',
        animationDuration: particle.duration + 's',
        width: particle.size + 'px',
        height: particle.size + 'px',
        background: particle.color,
        boxShadow: particle.glow,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Particle {
  id: number
  x: number
  delay: number
  duration: number
  size: number
  color: string
  glow: string
}

const containerRef = ref<HTMLElement>()
const particles = ref<Particle[]>([])

// AI主题颜色
const aiColors = [
  'rgba(139, 92, 246, 0.6)',   // 紫色
  'rgba(6, 182, 212, 0.6)',     // 青色
  'rgba(236, 72, 153, 0.4)',     // 洋红
  'rgba(59, 130, 246, 0.5)',     // 蓝色
]

const aiGlows = [
  '0 0 10px rgba(139, 92, 246, 0.8)',
  '0 0 10px rgba(6, 182, 212, 0.8)',
  '0 0 10px rgba(236, 72, 153, 0.6)',
  '0 0 10px rgba(59, 130, 246, 0.6)',
]

const createParticles = (count: number) => {
  const newParticles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const colorIndex = Math.floor(Math.random() * aiColors.length)
    newParticles.push({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 10,
      size: 2 + Math.random() * 3,
      color: aiColors[colorIndex],
      glow: aiGlows[colorIndex],
    })
  }
  particles.value = newParticles
}

onMounted(() => {
  // 检查用户是否偏好减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersReducedMotion) {
    createParticles(30)
  }
})

onUnmounted(() => {
  particles.value = []
})
</script>

<style scoped>
.particle-system {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: var(--z-particles);
}

.particle {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  animation: particle-rise linear infinite;
}

@keyframes particle-rise {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-120vh) translateX(var(--drift, 0px)) rotate(720deg);
    opacity: 0;
  }
}

/* 响应式：移动端减少粒子数量 */
@media (max-width: 768px) {
  .particle {
    display: none;
  }
}

/* 减弱动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .particle {
    display: none;
  }
}
</style>
