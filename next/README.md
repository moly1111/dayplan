# dayplan Next.js 版本

这是 dayplan 项目的 Next.js 版本，目前仍在开发中。

## 开发环境设置

1. 进入 `next` 目录：
   ```bash
   cd next
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
next/
├── app/              # Next.js App Router 页面和布局
│   ├── layout.jsx   # 根布局
│   ├── globals.css  # 全局样式
│   ├── page.jsx     # 首页 (/)
│   ├── xkm/         # XKM 个人空间 (/xkm)
│   └── pro/         # Pro 工具区 (/pro)
├── public/          # 静态资源
│   ├── assets/      # 图片、字体等资源
│   └── audio/       # 音效文件
├── package.json     # 项目配置
├── next.config.mjs  # Next.js 配置
└── jsconfig.json    # JavaScript 路径别名配置
```

## 构建和部署

- 构建生产版本：`npm run build`
- 启动生产服务器：`npm start`
- 代码检查：`npm run lint`

## 注意事项

- 当前版本只是项目骨架，功能尚未迁移
- 根目录的静态站（`index.html`）仍然可以正常使用
- 后续会逐步将静态站的逻辑迁移到 Next.js 版本

