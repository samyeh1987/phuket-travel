# 泰嗨了 - 普吉旅行

普吉旅行预订网站，提供定制旅行、深潜、跳岛一日游、秀场预订服务。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **后端**: Supabase (Database + Auth + Storage)
- **国际化**: next-intl
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入 Supabase 配置：

```bash
cp .env.local.example .env.local
```

### 3. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase/schema.sql`
3. 获取项目 URL 和 anon key 填入 `.env.local`

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
phuket-travel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (client)/           # 客户端页面
│   │   │   ├── custom-trip/    # 定制旅行
│   │   │   ├── diving/          # 深潜
│   │   │   ├── island-tour/    # 跳岛游
│   │   │   └── show/           # 秀场
│   │   ├── admin/              # 后台管理
│   │   └── api/                # API 路由
│   ├── components/             # React 组件
│   │   ├── layout/             # 布局组件
│   │   ├── ui/                 # UI 组件
│   │   ├── client/             # 客户端组件
│   │   └── admin/              # 后台组件
│   └── lib/                    # 工具库
│       └── supabase.ts         # Supabase 客户端
├── i18n/                        # 国际化配置
│   └── dictionaries/           # 语言文件
├── supabase/
│   └── schema.sql             # 数据库结构
└── public/                    # 静态资源
```

## 功能模块

### 客户端

- [x] 首页 + 导航
- [ ] 定制旅行表单
- [ ] 深潜预订（体验/考证）
- [ ] 跳岛一日游（皇帝岛/皮皮岛/斯米兰）
- [ ] 秀场预订（天皇秀/西蒙秀）
- [ ] 付款确认页

### 后台管理

- [ ] 登录认证
- [ ] 深潜套餐管理
- [ ] 岛屿/船只管理
- [ ] 秀场/套餐管理
- [ ] 订单管理
- [ ] Banner 管理
- [ ] 系统设置

## 部署

### Vercel

1. Fork 此仓库
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

## 开发说明

### i18n 预留

当前默认语言为中文 (zh-CN)，已预留英文 (en) 和泰文 (th) 结构。

### 图片资源

演示图片使用 Unsplash，正式上线请替换为实际素材。

## License

MIT
