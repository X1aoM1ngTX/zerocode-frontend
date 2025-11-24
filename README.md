# ZeroCode Frontend

ZeroCode 前端项目，基于 Vue 3 + TypeScript + Vite 构建的现代化前端应用。

## 技术栈

- **框架**: Vue 3.5.17
- **构建工具**: Vite 7.0.0
- **UI 库**: Ant Design Vue 4.2.6
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **HTTP 客户端**: Axios 1.13.2
- **语言**: TypeScript
- **代码规范**: ESLint + Prettier

## 项目结构

```
src/
├── api/                   # API 接口
│   ├── health.ts         # 健康检查接口
│   ├── index.ts          # API 入口文件
│   └── typings.d.ts      # 类型定义
├── assets/               # 静态资源
│   └── zerocode.png      # 项目图标
├── components/           # 通用组件
├── layouts/              # 布局组件
│   ├── BasicLayout.vue   # 基础布局
│   ├── GlobalFooter.vue  # 全局页脚
│   └── GlobalHeader.vue  # 全局头部
├── pages/                # 页面组件
│   └── HomePage.vue      # 首页
├── request/              # 请求封装
│   └── request.ts        # Axios 配置
├── router/               # 路由配置
│   └── index.ts          # 路由定义
├── stores/               # Pinia 状态管理
│   └── counter.ts        # 计数器示例
├── App.vue              # 根组件
├── main.ts              # 应用入口
├── env.d.ts             # 环境类型定义
└── assets/              # 静态资源
```

## 快速开始

### 环境要求
- Node.js 22+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run type-check` - 类型检查
- `npm run lint` - 代码检查和修复
- `npm run format` - 代码格式化
- `npm run generate-api` - 生成 API 类型定义

## 核心功能

### API 接口管理
项目使用 Axios 进行 HTTP 请求，并在 `src/request/request.ts` 中进行了统一配置：

```typescript
// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data;
  },
  (error) => {
    // 统一错误处理
    return Promise.reject(error);
  }
);
```

### 路由配置
使用 Vue Router 进行页面路由管理，配置文件位于 `src/router/index.ts`：

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('@/pages/HomePage.vue'),
  },
  // 更多路由配置...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

### 状态管理
使用 Pinia 进行状态管理，示例 store 位于 `src/stores/counter.ts`：

```typescript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

### 布局组件
项目提供了基础布局组件：
- `BasicLayout.vue` - 基础页面布局
- `GlobalHeader.vue` - 全局头部组件
- `GlobalFooter.vue` - 全局页脚组件

## 开发指南

### 添加新页面
1. 在 `src/pages/` 目录下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 如需在导航中显示，更新 `GlobalHeader.vue`

### 添加 API 接口
1. 在 `src/api/` 目录下创建接口文件
2. 使用 TypeScript 定义接口类型
3. 在组件中导入并使用

### 使用 Ant Design Vue
```vue
<template>
  <a-button type="primary" @click="handleClick">
    点击按钮
  </a-button>
  <a-modal v-model:open="visible" title="标题">
    <p>模态框内容</p>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);

const handleClick = () => {
  visible.value = true;
};
</script>
```

### 代码规范
项目使用 ESLint 和 Prettier 进行代码规范检查：
- 运行 `npm run lint` 检查代码
- 运行 `npm run format` 格式化代码

## 配置说明

### Vite 配置
主要配置文件 `vite.config.ts`：
- 开发服务器配置
- 构建优化配置
- 插件配置

### TypeScript 配置
- `tsconfig.json` - TypeScript 编译配置
- `tsconfig.app.json` - 应用特定配置
- `tsconfig.node.json` - Node.js 环境配置

### 环境变量
在项目根目录创建环境变量文件：
- `.env` - 默认环境变量
- `.env.development` - 开发环境变量
- `.env.production` - 生产环境变量

## API 类型生成

项目支持从 OpenAPI 规范自动生成 TypeScript 类型定义：

```bash
npm run generate-api
```

配置文件 `openapi2ts.config.ts`：
```typescript
export default {
  schema: 'http://localhost:8123/api/v3/api-docs',
  output: './src/api/typings.ts',
};
```

## 部署

### 构建生产版本
```bash
npm run build
```

构建产物将输出到 `dist/` 目录，可以部署到任何静态文件服务器。

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8123;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 常见问题

### 开发服务器启动失败
- 检查 Node.js 版本是否符合要求
- 删除 `node_modules` 和 `package-lock.json` 后重新安装依赖
- 检查端口是否被占用

### API 请求失败
- 确认后端服务是否正常运行
- 检查 API 基础路径配置
- 查看浏览器控制台错误信息

### 构建失败
- 运行 `npm run type-check` 检查类型错误
- 运行 `npm run lint` 检查代码规范问题

## 推荐开发工具

- **IDE**: VSCode
- **插件**: 
  - Vue - Official
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情
