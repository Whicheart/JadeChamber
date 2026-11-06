# JadeChamber

原神资料查询站点，基于 Vue 3 + Vite 构建，上游配套后端为 [Irminsul](https://github.com/Whicheart/Irminsul)。

当前提供角色、武器、圣遗物三套图鉴与详情，外加圣遗物计算器与公式大全。

## 功能

**角色图鉴**（`/avatars`）

- 按元素、武器类型、稀有度筛选，支持按名称搜索
- 桌面端竖版立绘，移动端方形头像 + 品质底图

**角色详情**（`/avatar/:avatarId`）

- 基础信息：稀有度、元素、武器类型、命之座、所属地区、生日、声优
- 属性与天赋：基础属性、突破加成、普攻 / 元素战技 / 元素爆发、固有天赋
- 命之座、衣装、角色故事、语音

**武器图鉴**（`/weapons`）

- 按武器类型、稀有度筛选
- 卡片图源用抽卡立绘（`_Gacha`）

**武器详情**（`/weapon/:weaponId`）

- 立绘在 40 级前后切换默认 / `_Awaken`（突破后）图标
- 属性成长滑块、精炼档位、突破材料与摩拉

**圣遗物图鉴**（`/artifacts`）

- 按套装最高星级筛选

**圣遗物详情**（`/artifact/:setId`）

- 套装部件切换查看故事，桌面端故事区与部件列表等高
- 主属性 / 副属性数值表，按星级切换档位

**圣遗物计算器**（`/arti-calc`）

- 背包：按套装、部位筛选，支持编辑与新增
- 潜力计算：给定副词条后按 5 次强化机会做蒙特卡洛模拟，输出双暴分布
- 侧栏另有「综合」「伤害计算」两个入口，目前为占位

**公式大全**（`/formulae`）

- 伤害、反应、精通等公式，KaTeX 渲染

**待开发**

- 卡池排期（`/banners`，视图保留为占位）

## 技术栈

| 类别       | 选型                  |
| ---------- | --------------------- |
| 框架       | Vue 3                 |
| 构建       | Vite 7                |
| 路由       | Vue Router 4          |
| 请求       | axios                 |
| 公式渲染   | KaTeX                 |
| 图表       | ECharts 6（按需引入） |
| 代码规范   | ESLint 9 + Prettier 3 |
| 单元测试   | node:test             |
| 组合式工具 | @vueuse/core          |

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`（见 `package.json` 的 `engines`）
- npm（随 Node.js 安装）

## 快速开始

```sh
npm install     # 安装依赖
npm run dev     # 启动开发服务器，默认 http://localhost:5173
```

开发服务器把 `/api` 代理到本机 `http://localhost:8080` 的后端；`server.host` 设为 `0.0.0.0`，同一局域网内的设备可以直接访问。

开发模式下还挂了一个**仅本地生效**的写入接口 `POST /__artifacts`，用于把计算器里新增的圣遗物写回 `src/assets/testJson/artiTest.json`。生产构建不包含它。

## 可用脚本

| 命令                   | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | 启动开发服务器                           |
| `npm run build`        | 生产构建，输出到 `dist/`                 |
| `npm run preview`      | 本地预览构建产物                         |
| `npm test`             | 跑 `tests/` 下的单元测试（node:test）    |
| `npm run lint`         | ESLint 检查（带缓存）                    |
| `npm run lint:fix`     | ESLint 自动修复                          |
| `npm run format`       | Prettier 格式化 `src/`                   |
| `npm run format:check` | 检查 `src/` 与根目录 js 的格式（不写入） |

## 配置

接口地址通过环境变量 `VITE_API_BASE` 注入，读取位置见 `src/utils/request.js`：

| 文件               | 用途     | 说明                                                |
| ------------------ | -------- | --------------------------------------------------- |
| `.env.development` | 开发环境 | 通常为 `/api`，交由 Vite 代理                       |
| `.env.production`  | 生产构建 | 需填部署环境真实接口地址；前后端同域托管时填 `/api` |

需要按机器覆盖时，使用 `.env.development.local` / `.env.production.local`，这类文件已被 `.gitignore` 忽略。

## 目录结构

```
├── index.html            页面入口
├── vite.config.js        构建配置（@ 别名、/api 代理、host、开发期测试数据接口）
├── tests/                node:test 单元测试
├── public/               静态资源（favicon、logo）
└── src/
    ├── main.js           应用入口
    ├── App.vue           根组件
    ├── components/       功能组件
    ├── css/              全局样式
    ├── router/           路由表
    ├── utils/            请求封装、图源解析、数值格式化、词条与武器/元素映射
    ├── views/            页面级组件
    └── assets/
        ├── fonts/        字体
        ├── testJson/     计算器用的本地测试数据
        └── img/          图片素材，按资源前缀分目录
```

## 素材约定

图片按「资源名前缀 = 目录名」存放，目录名就是文件名的前两段：

| 文件名示例                        | 所在目录         |
| --------------------------------- | ---------------- |
| `UI_AvatarIcon_Ayaka`             | `UI_AvatarIcon/` |
| `UI_Gacha_AvatarImg_Ayaka`        | `UI_Gacha/`      |
| `UI_EquipIcon_Bow_Alkonost`       | `UI_EquipIcon/`  |
| `UI_ItemIcon_104161`              | `UI_ItemIcon/`   |
| `UI_RelicIcon_15048_4`            | `UI_RelicIcon/`  |
| `UI_Talent_S_Ayaka_01`            | `UI_Talent/`     |
| `UI_Costume_AyakaCostumeFruhling` | `UI_Costume/`    |

只有两个家族不遵守这条规则：技能图标 `Skill_A_01` 放 `Skill/`，品质底图 `QUALITY_ORANGE` 放 `UI_QualityBg/`。例外集中在 `src/utils/getImage.js` 的 `DIR_BY_HEAD` 里。

组件不要自己拼路径，一律走 `asset(iconName)`；材料图标用 `materialIcon(item)`，它在 `iconName` 为空时按 `UI_ItemIcon_<道具 id>` 兜底。

素材已按需补齐，前端**不再探测文件是否存在**：图源为空或加载失败时由组件显示占位，不要引入额外的 HEAD 请求。

## 规范

```sh
npm run lint     # 提交前检查
npm run format   # 统一格式
npm test         # 改到 utils 时补跑
```
