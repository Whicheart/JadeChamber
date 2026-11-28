# JadeChamber

原神（Genshin Impact）百科与工具前端项目。

## 主要功能

- 角色列表：以卡片展示角色立绘与名称。
- 武器列表：以卡片展示武器卡图与名称。
- 圣遗物列表：以卡片展示圣遗物套装图标与名称。
- 敌对生物列表：以卡片展示怪物图标与名称。
- 名称搜索：按名称筛选，支持清空与回车立即查询。
- 条件筛选：武器按类型与星级、圣遗物按星级、怪物按类型筛选，支持多选组合。
- 响应式布局：适配桌面端与移动端。

## 技术栈

- Vue 3（Composition API）
- Vite
- TypeScript（strict）
- SCSS
- Vue Router
- Pinia
- Axios
- ESLint + Prettier
- Vitest + Vue Test Utils

## 环境要求

- Node.js LTS（`^22.18.0 || >=24.12.0`）
- npm

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查并构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run type-check` | 执行 TypeScript 类型检查 |
| `npm run lint` | 使用 ESLint 检查 `src/` |
| `npm run test:unit` | 运行单元测试 |
| `npm run format` | 使用 Prettier 格式化 `src/` |

## 后端接口

开发前需确认后端已启动：

- Swagger UI：<http://localhost:8080/swagger-ui/index.html>
- OpenAPI JSON：<http://localhost:8080/v3/api-docs>

## 目录结构

```text
src/
├── api/          # HTTP 请求与接口封装
├── assets/       # 静态资源
├── components/   # 通用组件
├── composables/  # 组合式逻辑
├── layouts/      # 页面级布局
├── router/       # 路由
├── stores/       # Pinia Store
├── styles/       # 全局样式与设计变量
├── types/        # TypeScript 类型
├── utils/        # 通用工具
├── views/        # 页面级组件
├── App.vue
└── main.ts
```
