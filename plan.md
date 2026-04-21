# Lin TodoList 开发计划

## 已实现功能

### 核心架构
- [x] Vue 3 + TypeScript 项目结构
- [x] Electron 主进程 + 渲染进程分离
- [x] Vite 构建配置
- [x] Pinia 状态管理
- [x] Vue Router 路由
- [x] IPC 通信桥接
- [x] SQLite 数据库层 (better-sqlite3)
- [x] 数据库 Schema (tasks, lists, habits, notes, pomodoro_records, tags)
- [x] UI 设计系统 (CSS 变量, 暗色模式)
- [x] ESLint 配置

### 视图页面
- [x] TodayView - 今日视图 (过期任务/今日到期/已完成)
- [x] CalendarPage - 日历视图 (月/周/日视图)
- [x] ListView - 清单视图 (按清单分组显示任务)
- [x] QuadrantView - 艾森豪威尔矩阵 (2x2 任务分类)
- [x] PomodoroView - 番茄钟 (计时器/统计/白噪音/迷你窗口)
- [x] HabitView - 习惯追踪 (周进度条/月度热力图)
- [x] NoteView - 便签视图 (瀑布流/富文本/颜色标签)

### 组件
- [x] AppHeader - 顶部导航 (搜索/快捷添加)
- [x] AppSidebar - 侧边栏 (导航/清单列表)
- [x] AppContent - 内容区域
- [x] DetailPanel - 详情面板
- [x] TaskCard - 任务卡片
- [x] TaskEditor - 任务编辑器弹窗
- [x] ListEditor - 清单编辑器弹窗
- [x] HabitEditor - 习惯编辑器弹窗
- [x] NoteEditor - 便签编辑器弹窗

### Store 层
- [x] app.store - 全局状态 (主题/侧边栏/currentView)
- [x] task.store - 任务管理 (CRUD/搜索/编辑器状态)
- [x] list.store - 清单管理 (CRUD/编辑器状态)
- [x] habit.store - 习惯管理 (CRUD/编辑器状态)
- [x] note.store - 便签管理 (CRUD/编辑器状态)
- [x] pomodoro.store - 番茄钟管理
- [x] tag.store - 标签管理

### Composables
- [x] useTask - 任务操作
- [x] useList - 清单操作
- [x] useCalendar - 日历操作
- [x] useHabit - 习惯操作
- [x] useNote - 便签操作
- [x] usePomodoro - 番茄钟操作
- [x] useTag - 标签操作
- [x] useShortcuts - 全局快捷键

### Electron 服务
- [x] notification.ts - 系统通知/提醒检查
- [x] shortcut.ts - 全局快捷键 (Ctrl+N/Shift+P等)
- [x] tray.ts - 系统托盘
- [x] 窗口状态记忆 - 自动保存/恢复窗口大小位置

### 数据库层
- [x] task.repo.ts - 任务 CRUD
- [x] list.repo.ts - 清单 CRUD
- [x] habit.repo.ts - 习惯 CRUD
- [x] note.repo.ts - 便签 CRUD
- [x] pomodoro.repo.ts - 番茄钟记录
- [x] tag.repo.ts - 标签 CRUD
- [x] init.ts - 数据库初始化/迁移/备份

---

## 待实现功能

### P0 核心体验 (已完成)
- [x] 路由完善 (所有视图页面)
- [x] 任务/清单/习惯/便签编辑器弹窗
- [x] Electron主进程数据库初始化
- [x] IPC通信打通

### P1 主要功能 (已完成)
- [x] 拖拽排序 (vuedraggable)
- [x] 图标/颜色选择器 (编辑器内)
- [x] 番茄钟白噪音 (雨声/森林/海浪/篝火/风声)
- [x] 番茄钟迷你窗口 (悬浮计时器)
- [x] 全局快捷键 (Ctrl+N新任务等)

### P2 交互优化 (已完成)
- [x] 窗口状态记忆 (跨会话恢复)
- [x] 搜索筛选功能 (顶部搜索栏)
- [x] 统计图表 (番茄钟周统计柱状图)

### P3 完善功能 (已完成)
- [x] 任务批量操作
- [x] 任务重复规则设置
- [x] 任务时间范围设置 (start_time/end_time)
- [x] 内置特殊清单 (今天/明天/本周/所有任务)
- [x] 习惯提醒设置
- [x] 习惯统计详情
- [x] 富文本编辑器完善
- [x] 便签拖拽排序/归档
- [x] 番茄钟与任务关联
- [x] 数据备份/自动更新

---

## 项目状态

**已完成 P0、P1、P2、P3 所有任务！**

核心功能已完整实现：
- 7个视图页面全部可访问
- 完整的任务/清单/习惯/便签 CRUD
- 番茄钟计时器 + 白噪音 + 迷你窗口
- 全局快捷键支持
- 窗口状态自动记忆
- 数据库完整初始化
- IPC 通信正常
- 任务批量操作
- 任务重复规则
- 内置特殊清单 (今天/明天/本周/所有任务)
- 习惯提醒
- 便签拖拽排序
- 番茄钟与任务关联
- 数据备份 (自动保留最近7个备份)

可以启动开发服务器进行测试：
```bash
pnpm dev
```
