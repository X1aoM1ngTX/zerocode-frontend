<template>
  <ul class="vscode-file-tree" :class="{ root: level === 0 }">
    <li v-for="node in nodes" :key="node.path" class="tree-node">
      <button
        v-if="node.type === 'directory'"
        type="button"
        class="tree-row folder-row"
        :style="{ paddingLeft: `${level * 14 + 6}px` }"
        @click="toggleDirectory(node.path)"
      >
        <span class="chevron" :class="{ expanded: isExpanded(node.path) }"></span>
        <img class="tree-icon" :src="getFolderIcon(node, isExpanded(node.path))" alt="" />
        <span class="tree-label">{{ node.name }}</span>
      </button>

      <button
        v-else
        type="button"
        class="tree-row file-row"
        :class="{ active: activePath === node.path }"
        :style="{ paddingLeft: `${level * 14 + 24}px` }"
        @click="emit('select', node.path)"
      >
        <img class="tree-icon" :src="getFileIcon(node)" alt="" />
        <span class="tree-label">{{ node.name }}</span>
      </button>

      <AppFileTreeNode
        v-if="node.type === 'directory' && isExpanded(node.path)"
        :nodes="node.children || []"
        :active-path="activePath"
        :level="level + 1"
        @select="emit('select', $event)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import fileIcon from 'material-icon-theme/icons/file.svg?url'
import folderIcon from 'material-icon-theme/icons/folder.svg?url'
import folderOpenIcon from 'material-icon-theme/icons/folder-open.svg?url'
import folderApiIcon from 'material-icon-theme/icons/folder-api.svg?url'
import folderApiOpenIcon from 'material-icon-theme/icons/folder-api-open.svg?url'
import folderComponentsIcon from 'material-icon-theme/icons/folder-components.svg?url'
import folderComponentsOpenIcon from 'material-icon-theme/icons/folder-components-open.svg?url'
import folderConfigIcon from 'material-icon-theme/icons/folder-config.svg?url'
import folderConfigOpenIcon from 'material-icon-theme/icons/folder-config-open.svg?url'
import folderContextIcon from 'material-icon-theme/icons/folder-context.svg?url'
import folderContextOpenIcon from 'material-icon-theme/icons/folder-context-open.svg?url'
import folderCssIcon from 'material-icon-theme/icons/folder-css.svg?url'
import folderCssOpenIcon from 'material-icon-theme/icons/folder-css-open.svg?url'
import folderHookIcon from 'material-icon-theme/icons/folder-hook.svg?url'
import folderHookOpenIcon from 'material-icon-theme/icons/folder-hook-open.svg?url'
import folderImagesIcon from 'material-icon-theme/icons/folder-images.svg?url'
import folderImagesOpenIcon from 'material-icon-theme/icons/folder-images-open.svg?url'
import folderLayoutIcon from 'material-icon-theme/icons/folder-layout.svg?url'
import folderLayoutOpenIcon from 'material-icon-theme/icons/folder-layout-open.svg?url'
import folderLibIcon from 'material-icon-theme/icons/folder-lib.svg?url'
import folderLibOpenIcon from 'material-icon-theme/icons/folder-lib-open.svg?url'
import folderPublicIcon from 'material-icon-theme/icons/folder-public.svg?url'
import folderPublicOpenIcon from 'material-icon-theme/icons/folder-public-open.svg?url'
import folderReactComponentsIcon from 'material-icon-theme/icons/folder-react-components.svg?url'
import folderReactComponentsOpenIcon from 'material-icon-theme/icons/folder-react-components-open.svg?url'
import folderRoutesIcon from 'material-icon-theme/icons/folder-routes.svg?url'
import folderRoutesOpenIcon from 'material-icon-theme/icons/folder-routes-open.svg?url'
import folderSrcIcon from 'material-icon-theme/icons/folder-src.svg?url'
import folderSrcOpenIcon from 'material-icon-theme/icons/folder-src-open.svg?url'
import folderStoreIcon from 'material-icon-theme/icons/folder-store.svg?url'
import folderStoreOpenIcon from 'material-icon-theme/icons/folder-store-open.svg?url'
import folderTestIcon from 'material-icon-theme/icons/folder-test.svg?url'
import folderTestOpenIcon from 'material-icon-theme/icons/folder-test-open.svg?url'
import folderUtilsIcon from 'material-icon-theme/icons/folder-utils.svg?url'
import folderUtilsOpenIcon from 'material-icon-theme/icons/folder-utils-open.svg?url'
import folderViewsIcon from 'material-icon-theme/icons/folder-views.svg?url'
import folderViewsOpenIcon from 'material-icon-theme/icons/folder-views-open.svg?url'

import cssIcon from 'material-icon-theme/icons/css.svg?url'
import eslintIcon from 'material-icon-theme/icons/eslint.svg?url'
import fontIcon from 'material-icon-theme/icons/font.svg?url'
import htmlIcon from 'material-icon-theme/icons/html.svg?url'
import imageIcon from 'material-icon-theme/icons/image.svg?url'
import javascriptIcon from 'material-icon-theme/icons/javascript.svg?url'
import jsonIcon from 'material-icon-theme/icons/json.svg?url'
import lessIcon from 'material-icon-theme/icons/less.svg?url'
import lockIcon from 'material-icon-theme/icons/lock.svg?url'
import markdownIcon from 'material-icon-theme/icons/markdown.svg?url'
import npmIcon from 'material-icon-theme/icons/npm.svg?url'
import prettierIcon from 'material-icon-theme/icons/prettier.svg?url'
import reactIcon from 'material-icon-theme/icons/react.svg?url'
import reactTsIcon from 'material-icon-theme/icons/react_ts.svg?url'
import readmeIcon from 'material-icon-theme/icons/readme.svg?url'
import sassIcon from 'material-icon-theme/icons/sass.svg?url'
import svgIcon from 'material-icon-theme/icons/svg.svg?url'
import tailwindIcon from 'material-icon-theme/icons/tailwindcss.svg?url'
import typescriptIcon from 'material-icon-theme/icons/typescript.svg?url'
import typescriptDefIcon from 'material-icon-theme/icons/typescript-def.svg?url'
import viteIcon from 'material-icon-theme/icons/vite.svg?url'
import vueIcon from 'material-icon-theme/icons/vue.svg?url'
import yarnIcon from 'material-icon-theme/icons/yarn.svg?url'

defineOptions({
  name: 'AppFileTreeNode',
})

interface AppFileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  language?: string
  status?: string
  children?: AppFileNode[]
}

withDefaults(
  defineProps<{
    nodes: AppFileNode[]
    activePath: string
    level?: number
  }>(),
  {
    level: 0,
  },
)

const emit = defineEmits<{
  select: [path: string]
}>()

const directoryState = ref<Record<string, boolean>>({})

const isExpanded = (path: string) => {
  return directoryState.value[path] !== false
}

const toggleDirectory = (path: string) => {
  directoryState.value[path] = !isExpanded(path)
}

type FolderIconPair = {
  closed: string
  open: string
}

const folderIconMap: Record<string, FolderIconPair> = {
  api: { closed: folderApiIcon, open: folderApiOpenIcon },
  apis: { closed: folderApiIcon, open: folderApiOpenIcon },
  assets: { closed: folderImagesIcon, open: folderImagesOpenIcon },
  components: { closed: folderComponentsIcon, open: folderComponentsOpenIcon },
  config: { closed: folderConfigIcon, open: folderConfigOpenIcon },
  configs: { closed: folderConfigIcon, open: folderConfigOpenIcon },
  context: { closed: folderContextIcon, open: folderContextOpenIcon },
  contexts: { closed: folderContextIcon, open: folderContextOpenIcon },
  css: { closed: folderCssIcon, open: folderCssOpenIcon },
  hooks: { closed: folderHookIcon, open: folderHookOpenIcon },
  images: { closed: folderImagesIcon, open: folderImagesOpenIcon },
  img: { closed: folderImagesIcon, open: folderImagesOpenIcon },
  layouts: { closed: folderLayoutIcon, open: folderLayoutOpenIcon },
  lib: { closed: folderLibIcon, open: folderLibOpenIcon },
  libs: { closed: folderLibIcon, open: folderLibOpenIcon },
  pages: { closed: folderViewsIcon, open: folderViewsOpenIcon },
  public: { closed: folderPublicIcon, open: folderPublicOpenIcon },
  routes: { closed: folderRoutesIcon, open: folderRoutesOpenIcon },
  router: { closed: folderRoutesIcon, open: folderRoutesOpenIcon },
  src: { closed: folderSrcIcon, open: folderSrcOpenIcon },
  store: { closed: folderStoreIcon, open: folderStoreOpenIcon },
  stores: { closed: folderStoreIcon, open: folderStoreOpenIcon },
  styles: { closed: folderCssIcon, open: folderCssOpenIcon },
  test: { closed: folderTestIcon, open: folderTestOpenIcon },
  tests: { closed: folderTestIcon, open: folderTestOpenIcon },
  utils: { closed: folderUtilsIcon, open: folderUtilsOpenIcon },
  views: { closed: folderViewsIcon, open: folderViewsOpenIcon },
}

const fileNameIconMap: Record<string, string> = {
  'package.json': npmIcon,
  'package-lock.json': npmIcon,
  'pnpm-lock.yaml': lockIcon,
  'yarn.lock': yarnIcon,
  'vite.config.js': viteIcon,
  'vite.config.mjs': viteIcon,
  'vite.config.ts': viteIcon,
  'tsconfig.json': typescriptIcon,
  'tsconfig.app.json': typescriptIcon,
  'tsconfig.node.json': typescriptIcon,
  'tailwind.config.js': tailwindIcon,
  'tailwind.config.ts': tailwindIcon,
  '.eslintrc': eslintIcon,
  '.eslintrc.js': eslintIcon,
  '.eslintrc.cjs': eslintIcon,
  '.eslintrc.json': eslintIcon,
  'eslint.config.js': eslintIcon,
  'eslint.config.ts': eslintIcon,
  '.prettierrc': prettierIcon,
  '.prettierrc.json': prettierIcon,
  'prettier.config.js': prettierIcon,
  'readme.md': readmeIcon,
}

const extensionIconMap: Record<string, string> = {
  css: cssIcon,
  gif: imageIcon,
  html: htmlIcon,
  jpeg: imageIcon,
  jpg: imageIcon,
  js: javascriptIcon,
  json: jsonIcon,
  jsx: reactIcon,
  less: lessIcon,
  md: markdownIcon,
  mjs: javascriptIcon,
  png: imageIcon,
  sass: sassIcon,
  scss: sassIcon,
  svg: svgIcon,
  ts: typescriptIcon,
  tsx: reactTsIcon,
  ttf: fontIcon,
  vue: vueIcon,
  woff: fontIcon,
  woff2: fontIcon,
}

const getFolderIcon = (node: AppFileNode, expanded: boolean) => {
  const normalizedName = node.name.toLowerCase()
  const iconPair = folderIconMap[normalizedName] || getPatternFolderIcon(normalizedName)
  return expanded ? iconPair.open : iconPair.closed
}

const getPatternFolderIcon = (name: string): FolderIconPair => {
  if (name.includes('component')) {
    return { closed: folderReactComponentsIcon, open: folderReactComponentsOpenIcon }
  }
  if (name.includes('hook')) {
    return { closed: folderHookIcon, open: folderHookOpenIcon }
  }
  if (name.includes('style') || name.includes('css')) {
    return { closed: folderCssIcon, open: folderCssOpenIcon }
  }
  return { closed: folderIcon, open: folderOpenIcon }
}

const getFileIcon = (node: AppFileNode) => {
  const normalizedName = node.name.toLowerCase()
  if (fileNameIconMap[normalizedName]) {
    return fileNameIconMap[normalizedName]
  }
  if (normalizedName.endsWith('.d.ts')) {
    return typescriptDefIcon
  }
  const extension = normalizedName.includes('.') ? normalizedName.split('.').pop() || '' : ''
  return extensionIconMap[extension] || fileIcon
}
</script>

<style scoped>
.vscode-file-tree {
  margin: 0;
  padding: 0;
  list-style: none;
}

.vscode-file-tree.root {
  padding: 4px 0;
}

.tree-node {
  margin: 0;
  padding: 0;
}

.tree-row {
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  line-height: 28px;
  text-align: left;
  white-space: nowrap;
}

.tree-row:hover {
  background: #eef3ff;
}

.tree-row.active {
  background: #dfe8ff;
  color: #194bfb;
}

.chevron {
  width: 12px;
  height: 12px;
  display: inline-block;
  flex: 0 0 12px;
  position: relative;
}

.chevron::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 5px solid #64748b;
  transition: transform 0.12s ease;
}

.chevron.expanded::before {
  transform: rotate(90deg);
}

.tree-icon {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  object-fit: contain;
}

.tree-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
