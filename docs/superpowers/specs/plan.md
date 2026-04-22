# Lin TodoList - 桌面端任务管理应用设计文档

## 项目概述

仿照滴答清单（TickTick）开发的个人桌面端任务管理应用，使用 Vue 3 + Electron + pnpm 技术栈，数据纯本地存储（SQLite）。目标是将滴答清单的付费功能（完整日历视图、任务时间段设置等）免费实现，并包含番茄钟、便签、四象限等完整功能。

## 技术栈

| 类别     | 技术选型                | 说明                               |
| -------- | ----------------------- | ---------------------------------- |
| 框架     | Vue 3 + TypeScript      | Composition API + `<script setup>` |
| 构建     | Vite + electron-builder | 快速构建 + 跨平台打包              |
| 包管理   | pnpm                    | 高效依赖管理                       |
| 状态管理 | Pinia                   | Vue 3 官方推荐                     |
| 路由     | Vue Router 4            | SPA 路由管理                       |
| 数据库   | better-sqlite3          | 嵌入式 SQLite，同步 API，性能好    |
| UI 组件  | 自研组件                | 无第三方 UI 库，确保风格统一       |
| 样式     | CSS 变量 + Scoped CSS   | 绿色系主题，支持明暗切换           |
| 图标     | @iconify/vue            | 统一图标方案                       |
| 富文本   | 自研轻量编辑器          | 基于 contenteditable               |

## 应用架构

### 整体布局

```
┌──────────────────────────────────────────────────┐
│  ☰  Lin TodoList                      🔍  ⚙️    │
├──────────┬───────────────────────┬───────────────┤
│          │                       │               │
│ 📋 今天   │  内容区域               │  详情面板      │
│ 📅 日历   │  (列表/卡片/日历等)      │  (可折叠)      │
│ ✅ 清单   │                       │               │
│ 🍅 番茄钟 │                       │               │
│ 📝 便签   │                       │               │
│ 📊 四象限 │                       │               │
│ 🔖 习惯   │                       │               │
│          │                       │               │
│──────────│                       │               │
│ 📁 工作   │                       │               │
│ 📁 生活   │                       │               │
│ 📁 学习   │                       │               │
│          │  + 添加任务             │               │
└──────────┴───────────────────────┴───────────────┘
```

- 左侧导航栏：固定 220px，显示功能入口和清单列表
- 中间内容区：自适应宽度，根据当前视图展示不同内容
- 右侧详情面板：可折叠，选中任务时展开显示任务详情

### 目录结构

```
Lin-TodoList/
├── electron/                     # Electron 主进程
│   ├── main.ts                   # 主进程入口（窗口管理、生命周期）
│   ├── preload.ts                # 预加载脚本（IPC 桥接）
│   ├── database/
│   │   ├── init.ts               # 数据库初始化、表创建、迁移
│   │   ├── repositories/
│   │   │   ├── task.repo.ts      # 任务数据操作
│   │   │   ├── list.repo.ts      # 清单数据操作
│   │   │   ├── habit.repo.ts     # 习惯数据操作
│   │   │   ├── note.repo.ts      # 便签数据操作
│   │   │   ├── pomodoro.repo.ts  # 番茄钟数据操作
│   │   │   └── tag.repo.ts       # 标签数据操作
│   │   └── migrations/           # 数据库迁移脚本
│   └── services/
│       ├── notification.ts       # 系统通知服务
│       ├── shortcut.ts           # 全局快捷键注册
│       └── tray.ts               # 系统托盘管理
├── src/                          # Vue 3 渲染进程
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.css     # CSS 变量（颜色、间距、圆角）
│   │   │   ├── global.css        # 全局样式、重置样式
│   │   │   └── animations.css    # 动画、过渡效果
│   │   └── sounds/               # 白噪音音频文件
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue    # 左侧导航栏
│   │   │   ├── AppHeader.vue     # 顶部栏
│   │   │   ├── AppContent.vue    # 内容容器
│   │   │   └── DetailPanel.vue   # 右侧详情面板
│   │   ├── common/
│   │   │   ├── TaskItem.vue      # 任务条目组件（复用）
│   │   │   ├── TaskEditor.vue    # 任务编辑器（复用）
│   │   │   ├── DatePicker.vue    # 日期/时间选择器
│   │   │   ├── TimeRange.vue     # 时间段选择器（开始-结束）
│   │   │   ├── PriorityBadge.vue # 优先级标记
│   │   │   ├── TagInput.vue      # 标签输入
│   │   │   ├── ConfirmDialog.vue # 确认对话框
│   │   │   └── EmptyState.vue    # 空状态占位
│   │   ├── task/
│   │   │   ├── TaskList.vue      # 任务列表视图
│   │   │   ├── TaskAdd.vue       # 快速添加任务
│   │   │   └── TaskDetail.vue    # 任务详情面板内容
│   │   ├── calendar/
│   │   │   ├── CalendarView.vue  # 日历主容器
│   │   │   ├── MonthView.vue     # 月视图
│   │   │   ├── WeekView.vue      # 周视图（时间轴）
│   │   │   ├── DayView.vue       # 日视图（24h 时间线）
│   │   │   └── MultiDayView.vue  # 多日视图
│   │   ├── quadrant/
│   │   │   ├── QuadrantView.vue  # 四象限主视图
│   │   │   └── QuadrantCard.vue  # 象限中的任务卡片
│   │   ├── pomodoro/
│   │   │   ├── PomodoroTimer.vue # 计时器主界面
│   │   │   ├── PomodoroStats.vue # 专注统计
│   │   │   └── PomodoroMini.vue  # 迷你浮动窗口
│   │   ├── habit/
│   │   │   ├── HabitList.vue     # 习惯列表
│   │   │   ├── HabitCard.vue     # 习惯打卡卡片
│   │   │   └── HabitHeatmap.vue  # 热力图
│   │   └── note/
│   │       ├── NoteList.vue      # 便签列表
│   │       └── NoteEditor.vue    # 便签编辑器
│   ├── composables/
│   │   ├── useTask.ts            # 任务操作逻辑
│   │   ├── useCalendar.ts        # 日历计算逻辑
│   │   ├── usePomodoro.ts        # 番茄钟计时逻辑
│   │   ├── useHabit.ts           # 习惯打卡逻辑
│   │   ├── useReminder.ts        # 提醒调度逻辑
│   │   └── useKeyboard.ts        # 快捷键处理
│   ├── stores/
│   │   ├── task.store.ts         # 任务状态
│   │   ├── list.store.ts         # 清单状态
│   │   ├── calendar.store.ts     # 日历视图状态
│   │   ├── pomodoro.store.ts     # 番茄钟状态
│   │   ├── habit.store.ts        # 习惯状态
│   │   ├── note.store.ts         # 便签状态
│   │   └── app.store.ts          # 全局应用状态（主题、侧边栏等）
│   ├── views/
│   │   ├── TodayView.vue         # 今天视图
│   │   ├── CalendarPage.vue      # 日历页
│   │   ├── ListView.vue          # 清单详情页
│   │   ├── QuadrantPage.vue      # 四象限页
│   │   ├── PomodoroPage.vue      # 番茄专注页
│   │   ├── HabitPage.vue         # 习惯打卡页
│   │   └── NotePage.vue          # 便签页
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── types/
│   │   └── index.ts              # 全局 TypeScript 类型
│   ├── utils/
│   │   ├── date.ts               # 日期工具函数
│   │   ├── ipc.ts                # IPC 通信封装
│   │   └── smart-parse.ts        # 智能识别日期文本
│   ├── App.vue
│   └── main.ts
├── package.json
├── electron-builder.yml
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 数据库设计（SQLite）

### tasks 表

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- UUID
  title TEXT NOT NULL,              -- 标题
  description TEXT DEFAULT '',      -- 描述（富文本 HTML）
  priority INTEGER DEFAULT 0,       -- 0=无, 1=低, 2=中, 3=高
  start_time TEXT,                  -- 开始时间 ISO8601
  end_time TEXT,                    -- 结束时间 ISO8601
  due_date TEXT,                    -- 截止日期 YYYY-MM-DD
  repeat_rule TEXT,                 -- JSON: { "type": "daily|weekly|monthly|yearly", "interval": 1, "weekdays": [1,3,5] }
  list_id TEXT NOT NULL,            -- 所属清单
  tags TEXT DEFAULT '[]',           -- JSON 数组: ["tag1", "tag2"]
  quadrant INTEGER DEFAULT 0,       -- 0=未分类, 1=重要紧急, 2=重要不紧急, 3=紧急不重要, 4=不重要不紧急
  completed INTEGER DEFAULT 0,      -- 0=未完成, 1=已完成
  completed_at TEXT,                -- 完成时间
  sort_order REAL DEFAULT 0,        -- 排序权重
  remind_at TEXT,                   -- 提醒时间
  remind_advance INTEGER DEFAULT 0, -- 提前提醒分钟数
  remind_persistent INTEGER DEFAULT 0, -- 是否持续提醒
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);
```

### lists 表

```sql
CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#10B981',     -- 清单颜色
  icon TEXT DEFAULT 'folder',       -- 图标名称
  sort_order REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### habits 表

```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'check',
  frequency TEXT DEFAULT 'daily',   -- daily | weekly
  target_days TEXT DEFAULT '[]',    -- JSON: 周几目标 [1,2,3,4,5,6,7]
  remind_at TEXT,                   -- 提醒时间 HH:mm
  sort_order REAL DEFAULT 0,
  archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### habit_records 表

```sql
CREATE TABLE habit_records (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,               -- YYYY-MM-DD
  completed INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE(habit_id, date)
);
```

### notes 表

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',          -- 富文本 HTML
  color TEXT DEFAULT '#FFFFFF',     -- 便签背景色
  pinned INTEGER DEFAULT 0,
  sort_order REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### pomodoro_records 表

```sql
CREATE TABLE pomodoro_records (
  id TEXT PRIMARY KEY,
  task_id TEXT,                     -- 关联任务（可选）
  duration INTEGER NOT NULL,        -- 专注时长（秒）
  type TEXT DEFAULT 'focus',        -- focus | break
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

### tags 表

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10B981',
  created_at TEXT NOT NULL
);
```

### 默认数据

应用首次启动时插入默认清单：

- 收集箱（id: 'inbox', icon: 'inbox'）
- 默认清单由用户创建

## 模块详细设计

### 1. 今天视图（TodayView）

**入口**: 侧边栏 "今天" 按钮，默认首页

**功能**:

- 显示今天到期的所有任务 + 已过期的未完成任务
- 按优先级分组显示（高 → 中 → 低 → 无）
- 快速添加任务（底部输入框，回车创建）
- 点击任务展开右侧详情面板
- 顶部显示日期和星期
- 支持拖拽调整任务顺序

**交互**:

- 左键点击任务 → 右侧展开详情面板
- 复选框点击 → 标记完成（划线动画后移入已完成区）
- 右键 → 上下文菜单（编辑/删除/设置优先级/移到清单/设为重复）
- 底部输入框 → 输入文本智能识别日期

### 2. 清单管理

**入口**: 侧边栏底部清单列表

**功能**:

- 点击清单名称 → 进入该清单的任务列表
- 支持创建/删除/重命名/排序清单
- 每个清单可设置颜色和图标
- 清单内任务按 sort_order 排序，支持拖拽调整

### 3. 日历视图（CalendarPage）

**入口**: 侧边栏 "日历" 按钮

**四种视图**:

#### 月视图 (MonthView)

- 顶部：月份切换（左右箭头）+ 年月显示 + "今天" 按钮
- 主体：7 列（周一至周日）的日历网格
- 每个日期格子显示：任务数量小圆点（按优先级着色）
- 点击日期 → 弹出该日任务列表弹窗
- 有任务的日期显示最多 2 个任务标题预览

#### 周视图 (WeekView)

- 顶部：周切换 + 日期范围显示
- 左侧：0-24 小时时间轴刻度
- 主体：7 列时间网格，任务以色块显示在对应时间段
- 任务色块宽度 = 时间段长度，颜色 = 清单颜色
- 支持拖拽调整任务时间

#### 日视图 (DayView)

- 顶部：日期切换
- 左侧：0-24 小时时间轴（大刻度）
- 主体：任务以时间块展示，显示标题和时间段
- 时间段任务（有 start_time 和 end_time）精确定位在时间轴上
- 无时间段任务显示在顶部"全天任务"区域

#### 多日视图 (MultiDayView)

- 顶部：可自由选择天数（1-7 天）
- 结合日视图的时间轴 + 多列展示
- 适合查看连续几天的安排

### 4. 四象限（QuadrantPage）

**入口**: 侧边栏 "四象限" 按钮

**布局**: 2x2 网格，每个象限是一个可滚动的任务列表

```
┌─────────────────────┬─────────────────────┐
│  重要 & 紧急          │  重要 & 不紧急        │
│  (Q1 - 立即做)        │  (Q2 - 安排做)       │
│                     │                     │
│  · 完成项目报告       │  · 学习 Vue3         │
│  · 修复线上 bug      │  · 健身锻炼           │
├─────────────────────┼─────────────────────┤
│  不重要 & 紧急        │  不重要 & 不紧急      │
│  (Q3 - 委托做)        │  (Q4 - 考虑删除)     │
│                     │                     │
│  · 回复日常邮件       │  · 刷短视频           │
└─────────────────────┴─────────────────────┘
```

**功能**:

- 任务自动根据优先级（高=重要）+ 是否过期/今日到期（=紧急）归入象限
- 支持手动拖拽在象限间移动（修改 quadrant 值）
- 每个象限可添加新任务（自动继承象限的优先级设置）
- 空象限显示提示文案

### 5. 番茄专注（PomodoroPage）

**入口**: 侧边栏 "番茄钟" 按钮

**主界面布局**:

```
┌─────────────────────────────────────┐
│           番茄专注                    │
│                                     │
│          ╭─────────╮               │
│          │  25:00   │               │
│          ╰─────────╯               │
│                                     │
│     ◀ 休息5分钟    工作25分钟 ▶      │
│                                     │
│     关联任务: [选择任务 ▾]           │
│                                     │
│     背景音: 🔇 🔊🌧 ☕🌿             │
│                                     │
│        [▶ 开始专注]                  │
│                                     │
│  ─── 今日统计 ───                    │
│  专注时长: 1h 30m  |  完成: 3 个     │
└─────────────────────────────────────┘
```

**功能**:

- 圆形计时器，动画显示倒计时进度
- 可配置：专注时长（默认 25min）、短休息（5min）、长休息（15min）、长休息间隔（每 4 个番茄）
- 工作模式：倒计时 / 正计时
- 关联任务选择器：下拉选择当前正在做的任务
- 白噪音选择：静音、雨声、咖啡厅、森林、海浪
- 专注完成时播放提示音
- 底部统计：今日/本周专注时长和次数
- 迷你模式：点击按钮切换为小浮动窗口（始终置顶）

### 6. 习惯打卡（HabitPage）

**入口**: 侧边栏 "习惯" 按钮

**布局**:

```
┌──────────────────────────────────────┐
│  习惯打卡                    + 新习惯  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 💧 每天喝水 8 杯              │   │
│  │ ████████░░ 80%    🔥 连续 12天 │   │
│  │ [周一][周二][周三][周四][周五]  │   │
│  │  ✓    ✓    ✓    ✓    ·      │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📖 每天阅读 30 分钟           │   │
│  │ ██████░░░░ 60%    🔥 连续 5天  │   │
│  └──────────────────────────────┘   │
│                                      │
│  ─── 本月热力图 ───                   │
│  ░░█░░█░░█░░░█░░█░░█░░░█░░█░       │
│  (绿色深浅表示完成率)                  │
└──────────────────────────────────────┘
```

**功能**:

- 习惯卡片：显示名称、图标、本周进度条、连续天数
- 打卡：点击圆形按钮完成今日打卡
- 习惯创建：名称、图标选择、频率（每日/每周几）
- 热力图：展示当月每天的完成情况（深绿=全部完成，浅绿=部分，灰=未完成）
- 统计：完成率、最长连续天数、总打卡天数

### 7. 桌面便签（NotePage）

**入口**: 侧边栏 "便签" 按钮

**布局**: 瀑布流卡片布局

```
┌──────────────────────────────────────┐
│  便签                     + 新便签    │
│                                      │
│  ┌────────────┐ ┌────────────────┐  │
│  │📌 会议笔记   │ │ 读书笔记        │  │
│  │             │ │                 │  │
│  │ 讨论了Q2    │ │ 《原子习惯》    │  │
│  │ 的目标设定   │ │ 核心观点：      │  │
│  │ ...         │ │ 习惯是自我      │  │
│  │             │ │ 提升的复利...   │  │
│  └────────────┘ └────────────────┘  │
│  ┌────────────────┐                  │
│  │ 购物清单        │                  │
│  │ • 牛奶          │                  │
│  │ • 面包          │                  │
│  │ • 鸡蛋          │                  │
│  └────────────────┘                  │
└──────────────────────────────────────┘
```

**功能**:

- 瀑布流布局展示所有便签
- 支持设置便签背景色（黄/绿/蓝/粉/白）
- 置顶便签显示在最前面
- 富文本编辑：加粗、斜体、列表、颜色
- 支持搜索便签内容
- 全局快捷键快速创建新便签

### 8. 提醒系统

**实现方式**:

- Electron 主进程维护一个定时器队列
- 每分钟检查一次是否有需要触发的提醒
- 触发时通过 Electron Notification API 发送系统通知
- 应用最小化到托盘时，通过托盘气泡提醒

**提醒类型**:

- 一次性提醒：设定具体时间点
- 重复提醒：每天/每周/每月/自定义
- 提前提醒：任务开始前 N 分钟
- 持续提醒：每 5 分钟重复一次，直到用户处理

### 9. 全局快捷键

| 快捷键         | 功能            |
| -------------- | --------------- |
| `Ctrl+N`       | 快速添加任务    |
| `Ctrl+Shift+N` | 新建便签        |
| `Ctrl+1~7`     | 切换侧边栏视图  |
| `Ctrl+F`       | 搜索            |
| `Ctrl+,`       | 设置            |
| `Ctrl+Q`       | 退出            |
| `Ctrl+Shift+P` | 开始/暂停番茄钟 |

## UI 设计规范

### 颜色系统

```css
:root {
  /* 主色 - 翡翠绿 */
  --color-primary: #10b981;
  --color-primary-hover: #059669;
  --color-primary-light: #d1fae5;
  --color-primary-bg: #ecfdf5;

  /* 背景 */
  --color-bg: #f9fafb;
  --color-bg-white: #ffffff;
  --color-bg-sidebar: #f3f4f6;

  /* 文字 */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;

  /* 优先级 */
  --color-priority-high: #ef4444;
  --color-priority-medium: #f59e0b;
  --color-priority-low: #3b82f6;
  --color-priority-none: #d1d5db;

  /* 边框 */
  --color-border: #e5e7eb;
  --color-border-hover: #d1d5db;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* 动画 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
}
```

### 暗色主题

```css
[data-theme='dark'] {
  --color-bg: #111827;
  --color-bg-white: #1f2937;
  --color-bg-sidebar: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #374151;
}
```

### 组件风格

- 所有卡片白底 + 1px 边框 + `shadow-sm`，hover 时 `shadow-md`
- 按钮分为：主要按钮（绿色填充）、次要按钮（灰色边框）、文字按钮（无背景）
- 输入框：白底 + 圆角 + focus 时绿色边框
- 滚动条：自定义细窄滚动条
- 侧边栏选中态：绿色左边框 + 浅绿背景

## IPC 通信设计

渲染进程通过 `window.electronAPI` 与主进程通信，所有数据库操作在主进程中完成。

```typescript
// preload.ts 暴露的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 任务
  getTasks: (filters) => ipcRenderer.invoke('task:list', filters),
  createTask: (data) => ipcRenderer.invoke('task:create', data),
  updateTask: (id, data) => ipcRenderer.invoke('task:update', id, data),
  deleteTask: (id) => ipcRenderer.invoke('task:delete', id),

  // 清单
  getLists: () => ipcRenderer.invoke('list:all'),
  createList: (data) => ipcRenderer.invoke('list:create', data),
  updateList: (id, data) => ipcRenderer.invoke('list:update', id, data),
  deleteList: (id) => ipcRenderer.invoke('list:delete', id),

  // 习惯
  getHabits: () => ipcRenderer.invoke('habit:all'),
  createHabit: (data) => ipcRenderer.invoke('habit:create', data),
  toggleHabit: (id, date) => ipcRenderer.invoke('habit:toggle', id, date),
  getHabitRecords: (habitId, month) => ipcRenderer.invoke('habit:records', habitId, month),

  // 便签
  getNotes: () => ipcRenderer.invoke('note:all'),
  createNote: (data) => ipcRenderer.invoke('note:create', data),
  updateNote: (id, data) => ipcRenderer.invoke('note:update', id, data),
  deleteNote: (id) => ipcRenderer.invoke('note:delete', id),

  // 番茄钟
  savePomodoro: (data) => ipcRenderer.invoke('pomodoro:save', data),
  getPomodoroStats: (range) => ipcRenderer.invoke('pomodoro:stats', range),

  // 标签
  getTags: () => ipcRenderer.invoke('tag:all'),
  createTag: (data) => ipcRenderer.invoke('tag:create', data),

  // 系统
  showNotification: (options) => ipcRenderer.invoke('notification:show', options),
  onReminder: (callback) => ipcRenderer.on('reminder:trigger', (_, data) => callback(data)),
})
```

## 非功能需求

- **启动速度**: 冷启动 < 2 秒
- **数据安全**: SQLite WAL 模式，定期自动备份到 backup 目录
- **窗口记忆**: 记住窗口大小和位置
- **最小化到托盘**: 关闭窗口时最小化到系统托盘而非退出
- **自动更新**: 集成 electron-updater（预留，后续可接入）

## 项目范围边界

**本次包含**:

- 上述所有 7 大模块的完整功能
- 绿色系 UI 主题（含暗色模式）
- 本地 SQLite 数据存储
- 系统级通知和提醒
- 全局快捷键

**不包含（后续迭代）**:

- 云同步 / 多设备同步
- 多用户 / 协作功能
- 移动端适配
- 外部日历订阅（Google Calendar 等）
- 语音输入
- 小组件 / Widget
- 数据导入导出（基础版先不做）
