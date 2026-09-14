# 家庭菜谱 - Web 版

基于 Vue 3 + Vite + Cloudflare Pages (Functions + D1) 的家庭菜谱 Web 应用。

从 uni-app 版本改造而来，保留了全部业务逻辑和 UI 风格。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 + Vue Router 4 |
| 构建工具 | Vite 5 |
| 后端 API | Cloudflare Pages Functions |
| 数据库 | Cloudflare D1 (SQLite) |
| 图片存储 | D1 (base64，客户端压缩后存储) |
| 部署平台 | Cloudflare Pages |

## 项目结构

```
家庭菜谱-web/
├── src/                        # 前端源码
│   ├── main.js                 # 入口
│   ├── App.vue                 # 根组件（含全局 Toast/Loading/Modal）
│   ├── router.js               # 路由配置
│   ├── styles/global.css       # 全局样式
│   ├── pages/                  # 页面组件
│   │   ├── Index.vue           # 首页（菜谱列表 + 今日推荐）
│   │   ├── Detail.vue          # 菜谱详情
│   │   ├── Admin.vue           # 菜谱管理
│   │   └── RecipeEdit.vue      # 新增/编辑菜谱
│   └── utils/                  # 工具模块
│       ├── recipe.js           # 菜谱 API 调用
│       ├── image.js            # 图片选择与压缩
│       ├── auth.js             # 管理员凭证
│       ├── recommend.js        # 今日推荐（localStorage）
│       └── ui.js               # Toast/Loading/Modal 状态
├── functions/                  # Cloudflare Pages Functions（后端 API）
│   ├── _middleware.js          # CORS 中间件
│   ├── _routes.json            # Functions 路由配置
│   ├── utils.js                # 后端工具函数
│   └── api/
│       ├── recipes.js          # GET /api/recipes（获取全部菜谱）
│       └── recipe/
│           ├── [id].js         # GET /api/recipe/:id（获取单条）
│           ├── save.js         # POST /api/recipe/save（新增/编辑）
│           └── delete.js       # POST /api/recipe/delete（删除）
├── public/                     # 静态资源
│   ├── favicon.svg
│   └── _redirects              # SPA 路由重定向
├── schema.sql                  # D1 数据库建表语句
├── wrangler.toml               # Cloudflare 配置
├── vite.config.js              # Vite 配置
├── index.html                  # HTML 模板
└── package.json
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化本地 D1 数据库

```bash
# 创建本地 D1 数据库并执行建表语句
npx wrangler d1 execute cookbook-db --local --file=./schema.sql
```

### 3. 启动开发服务器

方式一（推荐，一条命令同时启动前后端）：

```bash
npx wrangler pages dev -- npx vite
```

访问 `http://localhost:8788`，前后端 API 和 Vite HMR 同时工作。

方式二（分开启动）：

```bash
# 终端 1：启动 API + D1
npx wrangler pages dev --port 8788

# 终端 2：启动 Vite 前端（已配置 /api 代理到 8788）
npm run dev
```

访问 `http://localhost:5173`。

## 部署到 Cloudflare

### 1. 创建 D1 数据库

```bash
npx wrangler d1 create cookbook-db
```

将返回的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "cookbook-db"
database_id = "在这里粘贴你的 database_id"
```

### 2. 初始化数据库表结构

```bash
# 生产环境
npx wrangler d1 execute cookbook-db --file=./schema.sql

# 预览环境（如果有）
npx wrangler d1 execute cookbook-db --env preview --file=./schema.sql
```

### 3. 构建前端

```bash
npm run build
```

### 4. 部署到 Cloudflare Pages

方式一：通过 Wrangler CLI 部署

```bash
npx wrangler pages deploy dist
```

方式二：通过 Git 集成

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Dashboard → Pages → Create a project → Connect to Git
3. 设置构建配置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
4. 在 Pages 项目设置中添加 D1 绑定：
   - Settings → Functions → D1 database bindings
   - 变量名：`DB`，数据库：`cookbook-db`

### 5. 管理端入口

与原版一致，首页右上角有一个隐藏的 🍴 图标，**长按 0.6 秒**进入管理端。

管理员凭证：`admin / admin`（硬编码在 `functions/utils.js` 中）。

## 与原 uni-app 版本的对应关系

| uni-app | Web 版 | 说明 |
|---|---|---|
| `uniCloud.callFunction` | `fetch('/api/...')` | 云函数改为 Pages Functions |
| `uniCloud.database()` | `env.DB.prepare().bind()` | D1 (SQLite) 替代 uniCloud DB |
| `uniCloud.uploadFile` | Canvas 压缩 + base64 存储 | 图片直接存 D1，无需云存储 |
| `uni.getStorageSync` | `localStorage.getItem` | 推荐数据用 localStorage |
| `uni.showToast` | `ui.showToast()` | 自定义 Toast 组件 |
| `uni.showModal` | `ui.showConfirm()` | 自定义 Modal 组件 |
| `uni.showLoading` | `ui.showLoading()` | 自定义 Loading 组件 |
| `uni.navigateTo` | `router.push()` | Vue Router |
| `uni.navigateBack` | `router.back()` | Vue Router |
| `@longpress` | `pointerdown/pointerup` + 定时器 | 自定义长按 |
| `rpx` 单位 | `px` | rpx 值除以 2 转为 px |
| `<view>/<text>/<image>` | `<div>/<span>/<img>` | 标准 HTML 标签 |
