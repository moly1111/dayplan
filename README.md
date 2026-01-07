# Dayplan / 计划表

- 一个纯前端、零后端、无账号的每日计划表工具，所有数据仅存浏览器 `localStorage`。主站是经典极简待办，`xkm` 为带 AI 预估时间的个人定制版。
- 已部署至：https://www.dayplan.me 与 https://www.dayplan.me/xkm
- 免费访问使用

## 功能总览（主站）
- 日历导航：点击日期快速切换当天计划
- 任务管理：添加 / 完成 / 编辑 / 删除；已完成默认折叠
- 状态标记：日历点颜色区分未完成、过期、已完成
- 完成特效：可选动画与音效
- 设置：Light/Dark 主题、本地存储提醒、数据导入导出

## 子站与版本
- `xkm/`：个人定制版，新增顶部时钟、AI 预估完成时间、总用时提示（API Key 本地存储，详见 `xkm/README.md`）
- `pro/`：工具实验区（如 focus-timer、discipline-path-map 等）
- `next/`：Next.js 技术栈的演示版本

## 项目结构（简）
```
.
├── index.html            # 主站
├── assets/               # 公共静态资源
├── app/                  # 主站核心逻辑（calendar/main/storage/settings）
├── xkm/                  # xkm 定制版（AI 预估、时钟等）
├── pro/                  # 实验/工具
└── next/                 # Next.js 版本示例
```

## 运行与预览
> 推荐使用本地静态服务器访问，避免 file:// 路径差异。

```bash
# 在项目根目录
python -m http.server 8000
# 或
npx http-server .
```
- 主站：`http://localhost:8000/`
- xkm 版：`http://localhost:8000/xkm/`（进入设置填入 DeepSeek API Key 后可用 AI 预估）

## 部署
- 直接静态托管即可（GitHub Pages / Netlify / Vercel / 任意静态服务器）。
- 注意：API Key 仅保存在浏览器，仓库不包含任何密钥。

## 数据安全
- 数据只存浏览器 `localStorage`，清理浏览器或更换设备会导致数据丢失。
- 建议定期使用右上角的「备份」导出 JSON。

## 许可证
开源，随意使用与修改。数据丢失不可恢复，请及时备份。

