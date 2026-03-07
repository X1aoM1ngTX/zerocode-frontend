<template>
  <a-layout-footer class="global-footer">
    <div class="footer-content">
      <div class="footer-text">
        <span class="copyright">© 2025 ZeroCode. All rights reserved.</span>
        <span class="divider">|</span>
        <span
          >Powered by
          <a
            href="https://www.antdv.com/components/overview-cn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ant Design Vue
          </a>
        </span>
        <span class="divider">|</span>
        <span class="icp-number">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            粤ICP备2025471762号-1
          </a>
        </span>
      </div>
      <div class="footer-links">
        <a-tooltip title="访问 GitHub">
          <a
            href="https://github.com/X1aoM1ngTX"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
          >
            <GithubOutlined />
          </a>
        </a-tooltip>
      </div>
    </div>
  </a-layout-footer>
</template>

<script lang="ts" setup>
import { GithubOutlined } from "@ant-design/icons-vue";
</script>

<style scoped>
.global-footer {
  background: var(--glass-bg-light);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  padding: 20px 50px;
  margin-top: auto;
  position: relative;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.copyright {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-base);
}

.divider {
  margin: 0 16px;
  color: var(--color-border);
}

.footer-text a {
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--transition-base);
  font-weight: var(--font-weight-medium);
}

.footer-text a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.icp-number {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.icp-number a {
  color: var(--color-text-tertiary);
  text-decoration: none;
}

.icp-number a:hover {
  color: var(--color-primary);
}

.footer-links {
  display: flex;
  align-items: center;
}

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--glass-bg-light);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 18px;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-2);
}

.github-link:hover {
  background: var(--gradient-ai-primary);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-purple);
}

@media (max-width: 768px) {
  .global-footer {
    padding: 24px 20px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .divider {
    display: none;
  }

  .footer-text {
    flex-direction: column;
    gap: 8px;
  }

  .github-link {
    width: 36px;
    height: 36px;
  }
}

/* 深色模式适配 */
[data-theme='dark'] .global-footer {
  background: var(--glass-bg-dark);
  border-top-color: rgba(139, 92, 246, 0.2);
}

[data-theme='dark'] .github-link {
  background: var(--color-bg-container);
  border-color: rgba(139, 92, 246, 0.3);
}

[data-theme='dark'] .copyright {
  color: var(--color-text-base);
}
</style>
