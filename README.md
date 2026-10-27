# JadeChamber

原神资料查询站点，基于 Vue 3 + Vite 构建，上游配套后端为[Irminsul](https://github.com/Whicheart/Irminsul)

当前提供角色图鉴、角色详情与公式大全三块内容。

## 功能

**角色图鉴**（`/avatars`）

- 按元素、武器类型筛选，支持按名称搜索

**角色详情**（`/avatar/:avatarId`）

- 基础信息：稀有度、元素、武器类型、命之座、所属地区、生日、声优
- 属性面板：基础属性、突破加成、各等级属性
- 天赋：普攻 / 元素战技 / 元素爆发、固有天赋
- 命之座与角色故事、语音

**公式大全**（`/formulae`）

- 伤害、反应、精通等公式

**待开发**

- 武器图鉴 / 武器详情
- 圣遗物图鉴 / 圣遗物详情
- 卡池排期

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3 |
| 构建 | Vite 7 |
| 路由 | Vue Router 4 |
| 请求 | axios |
| 公式渲染 | KaTeX |
| 代码规范 | ESLint 9 + Prettier 3 |
| 组合式工具 | @vueuse/core |

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`（见 `package.json` 的 `engines`）
- npm（随 Node.js 安装）

## 快速开始

```sh
npm install     # 安装依赖
npm run dev     # 启动开发服务器，默认 http://localhost:5173
```

开发服务器已配置 `/api` 代理，指向本机 `http://localhost:8080` 的后端；`vite.config.js` 中 `server.host` 设为 `0.0.0.0`，如需在局域网其他设备调试可直接访问。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run lint` | ESLint 检查（带缓存） |
| `npm run lint:fix` | ESLint 自动修复 |
| `npm run format` | Prettier 格式化 `src/` |
| `npm run format:check` | 检查格式 |

## 配置

接口地址通过环境变量 `VITE_API_BASE` 注入：

| 文件 | 用途 | 取值 |
| --- | --- | --- |
| `.env.development` | 开发环境 | `/api`，走 Vite 代理 |
| `.env.production` | 生产构建 | 目前为 `http://localhost:8080`，部署前需改为真实接口地址（同域托管时为 `/api`） |

需要按机器覆盖时，使用 `.env.development.local` / `.env.production.local`，这类文件已被 `.gitignore` 忽略。

## 目录结构

```
├── index.html            页面入口
├── vite.config.js        构建配置（@ 别名、/api 代理、host）
├── public/               静态资源（favicon、logo）
└── src/
    ├── main.js           应用入口
    ├── App.vue           根组件
    ├── api/              数据接口请求
    ├── components/       功能组件
    ├── css/              全局样式
    ├── router/           路由表
    ├── utils/            请求封装、图片地址、数值格式化、资源探测
    ├── views/            页面级组件
    └── assets/img/       图片素材
```

## 素材约定

- 角色图标统一为 `src/assets/img/avatar/<角色>/UI_AvatarIcon_<角色>_<类型>.webp`
- 类型包括 `Splash`、`Gacha`、`Card`、`Side`、`Forward`、`Passive_<n>`、`Constellation_<n>`、`Talent_NormalAttack`、`Talent_ElementSkill`、`Talent_ElementBurst`
- 素材按需补充、缺失属常态：前端先用 `src/utils/hasImage.js` 探测文件是否真实存在，再决定渲染图标还是占位，不要假定素材一定存在

## 规范

```sh
npm run lint     # 提交前检查
npm run format   # 统一格式
```
