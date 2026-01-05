<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"><GlobalHeader /></a-layout-header>
      <a-layout-content class="content-full-width">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="route.meta.transition || 'fade'" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </a-layout-content>
      <a-layout-footer class="footer"><GlobalFooter /></a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"
import GlobalHeader from "./GlobalHeader.vue"
import GlobalFooter from "./GlobalFooter.vue"
</script>

<style scoped>
#basicLayout {
  min-height: 100vh;
}

.header {
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  z-index: var(--z-fixed);
  background-color: var(--color-bg-container);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.header:hover {
  box-shadow: var(--shadow-2);
}

.content-full-width {
  /* 使用更明确的背景色 */
  background: #f8fafc;
  margin-left: 0;
  margin-top: var(--layout-header-height);
  min-height: calc(100vh - var(--layout-header-height) - var(--layout-footer-height));
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all var(--transition-base);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--transition-base);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all var(--transition-base);
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .content-full-width {
    padding: 0;
  }
}

.footer {
  padding: 24px 0;
  text-align: center;
  background-color: var(--color-bg-container);
  border-top: 1px solid var(--color-border-light);
}
</style>
