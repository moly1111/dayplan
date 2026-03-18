# XKM 版本说明

[English Version](#english-version)

`xkm/` 是 Dayplan 的个人定制版，在主站基础上增加：

- 顶部实时时钟（Light/Dark 主题自适应）
- **目标网址**：单击时间在新标签页跳转，双击时间弹出输入框编辑 URL
- **Focus 专注区**：独立的单任务专注区域，支持拖拽移入/移出、双击创建、完成后自动折叠
- 任务"预期完成时间"按钮（调用 DeepSeek AI）
- 总用时汇总（超出当天剩余时间时标红）
- 快捷任务（常用任务一键添加，自动继承预估时间；按钮可自定义为符号如 ✦）
- **任务拖拽排序**：长按任务可拖拽调整顺序，左右拖拽可移动到昨天/明天
- **双击日历跳回今天**：双击日历区域快速返回今天
- **多语言支持**：支持中文/英文界面切换
- 本地存储的 DeepSeek API Key（不上传、不出现在仓库）

## 使用步骤

### 基础设置
1. 本地或线上打开 `http://your-host/xkm/`
2. 右上角进入「设置」→ AI 区域，填入你的 **DeepSeek API Key**
3. 返回任务列表，点击每个任务右侧的「预期完成时间」按钮获取 AI 预估（分钟）
4. 总用时会自动累加，超出今日剩余时间时会标红提示

### 语言切换
1. 右上角进入「设置」→ 语言 / Language
2. 选择「中文」或「English」
3. 界面会立即切换到所选语言

### 目标网址
1. **双击**顶部时间，在弹窗中输入或修改目标 URL，确定后保存（仅存本地）
2. **单击**顶部时间，在新标签页打开当前设置的目标网址；未设置则无跳转

### Focus 专注区
Focus 是一个独立的单任务专注区域，帮助你聚焦当前最重要的任务：

1. **拖拽移入**：长按任务拖动到 Focus 区域（Focus 为空且展开时可拖入）
2. **双击创建**：Focus 为空时，双击虚框区域可直接输入创建 Focus 任务
3. **拖拽移出**：长按 Focus 中的任务拖回普通任务列表
4. **完成任务**：Focus 任务完成后，Focus 区域自动折叠并显示 🎉 图标
5. **手动折叠**：点击 Focus 标题可手动展开/折叠（折叠时不显示 🎉）
6. **星标标记**：Focus 任务完成后，在 Completed 列表中显示 ⭐ 前缀

**注意**：Focus 只能容纳一个任务，已有任务时无法拖入新任务；折叠状态下也无法拖入。

### 任务拖拽排序
- 长按任务 300ms 后可拖拽调整顺序
- 拖拽时任务会略微缩小，其他任务会平滑移动
- 支持在普通任务列表内排序，也支持与 Focus 区域互换
- **右拖移到明天**：向右拖动超过 200px，任务移到明天（绿色提示）
- **左拖移到昨天**：向左拖动超过 200px，任务移到昨天（橙色提示）
- 移到其他天的任务会保留预估时间等所有信息

### 双击日历跳回今天
- 双击日历区域（包括空白部分）可快速跳回今天

### 快捷任务功能
1. 点击「Today」标题右侧的快捷任务按钮（默认文案或符号如 ✦）
2. 在面板中输入任务内容并点击「添加」，系统会自动调用 AI 预估时间
3. 下次使用该快捷任务时，会直接使用保存的预估时间，无需重新预估
4. 快捷任务支持编辑、删除操作

### 编辑预估时间
- **普通任务**：双击任务右侧的预估时间（绿色框），可手动修改分钟数
- **快捷任务**：双击快捷任务列表中的时间标签，可手动修改分钟数
- 修改后会自动更新总用时和快捷任务数据

## 路径与运行
- 需通过 HTTP 访问，推荐本地静态服务器：
  ```bash
  # 项目根目录
  python -m http.server 8000
  # 或
  npx http-server .
  ```
  访问 `http://localhost:8000/xkm/`

- 已使用 **绝对路径** `/xkm/...` 引用本目录资源，适配 Vercel 等线上部署。使用 file:// 打开会 404，请务必用静态服务器。

## 数据与隐私
- 所有数据仅存浏览器 `localStorage`，API Key 也只保存在本地，不上传服务器。
- 清理浏览器数据会导致任务、快捷任务与 Key 丢失，请定期在设置里备份 JSON。

---
数据丢失不可恢复，请定期备份。

---

# English Version

`xkm/` is a personalized version of Dayplan with additional features:

- Real-time clock at the top (Light/Dark theme adaptive)
- **Target URL**: Click time to open in new tab, double-click to edit URL
- **Focus Area**: Dedicated single-task focus zone with drag support, double-click creation, auto-collapse on completion
- "Estimate Time" button for tasks (powered by DeepSeek AI)
- Total time summary (turns red when exceeding remaining time today)
- Quick Tasks (one-click add common tasks, auto-inherit estimated time)
- **Task Drag & Drop**: Long-press to reorder, drag left/right to move to yesterday/tomorrow
- **Double-click Calendar**: Return to today instantly
- **Multi-language Support**: Switch between Chinese/English interface
- Local storage for DeepSeek API Key (never uploaded)

## Getting Started

### Basic Setup
1. Open `http://your-host/xkm/` locally or online
2. Go to Settings (top right) → AI section, enter your **DeepSeek API Key**
3. Click "Estimate Time" button on each task to get AI estimation (in minutes)
4. Total time auto-updates; turns red when exceeding today's remaining time

### Language Switch
1. Go to Settings (top right) → 语言 / Language
2. Select "中文" or "English"
3. Interface switches immediately

### Target URL
1. **Double-click** the top clock to edit target URL in popup (saved locally)
2. **Single-click** the top clock to open the URL in a new tab; no action if not set

### Focus Area
Focus is a dedicated single-task zone to help you concentrate on your most important task:

1. **Drag to Enter**: Long-press a task and drag to Focus area (when empty and expanded)
2. **Double-click to Create**: When Focus is empty, double-click the placeholder to create a task
3. **Drag to Exit**: Long-press Focus task and drag back to regular list
4. **Complete Task**: When Focus task is completed, area auto-collapses with 🎉 icon
5. **Manual Toggle**: Click Focus title to expand/collapse (no 🎉 when manually collapsed)
6. **Star Mark**: Completed Focus tasks show ⭐ prefix in Completed list

**Note**: Focus can only hold one task. Cannot drag in when occupied or collapsed.

### Task Drag & Drop
- Long-press task for 300ms to start dragging
- Task shrinks slightly while dragging, others move smoothly
- Works within task list and with Focus area
- **Drag Right → Tomorrow**: Drag right 200px+ to move task to tomorrow (green indicator)
- **Drag Left → Yesterday**: Drag left 200px+ to move task to yesterday (orange indicator)
- Moved tasks retain all info (estimated time, etc.)

### Double-click Calendar
- Double-click anywhere in calendar area (including empty space) to jump to today

### Quick Tasks
1. Click the quick tasks button next to "Today" title (✦ symbol)
2. Enter task content and click "Add"; AI auto-estimates time
3. Next time you use this quick task, saved estimate is used directly
4. Quick tasks support edit and delete operations

### Edit Estimated Time
- **Regular Tasks**: Double-click the estimated time (green box) to manually edit
- **Quick Tasks**: Double-click the time badge in quick task list to edit
- Changes auto-update total time and quick task data

## Running the App
- Requires HTTP access. Recommended local server:
  ```bash
  # From project root
  python -m http.server 8000
  # or
  npx http-server .
  ```
  Visit `http://localhost:8000/xkm/`

- Uses **absolute paths** `/xkm/...` for resources, compatible with Vercel deployment. Opening via file:// will cause 404 errors.

## Data & Privacy
- All data stored in browser `localStorage` only. API Key saved locally, never uploaded.
- Clearing browser data will lose tasks, quick tasks, and API Key. Please backup JSON regularly in Settings.

---
Data loss is unrecoverable. Please backup regularly.
