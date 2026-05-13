<template>
  <div class="auth-card">
    <router-link to="/" class="auth-logo" aria-label="返回首页">
      <img src="@/assets/vexor-argb.png" alt="Vexor" />
    </router-link>
    <div class="auth-heading">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<style scoped>
.auth-card {
  width: min(100%, 420px);
  padding: 36px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(196, 207, 230, 0.72);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(42, 66, 130, 0.14);
}

.auth-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
}

.auth-logo img {
  width: 112px;
  height: auto;
  object-fit: contain;
}

.auth-heading {
  text-align: center;
  margin-bottom: 28px;
}

.auth-heading h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.auth-heading p {
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 28px 20px;
  }
}
</style>
