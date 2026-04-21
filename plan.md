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
- [x] PomodoroView - 番茄钟 (计时器/统计/设置)
- [x] HabitView - 习惯追踪 (周进度条/月度热力图)
- [x] NoteView - 便签视图 (瀑布流/富文本/颜色标签)

### 组件
- [x] AppHeader - 顶部导航
- [x] AppSidebar - 侧边栏
- [x] AppContent - 内容区域
- [x] DetailPanel - 详情面板
- [x] TaskCard - 任务卡片

### Store 层
- [x] app.store - 全局状态 (主题/侧边栏)
- [x] task.store - 任务管理
- [x] list.store - 清单管理
- [x] habit.store - 习惯管理
- [x] note.store - 便签管理
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

### Electron 服务
- [x] notification.ts - 系统通知
- [x] shortcut.ts - 全局快捷键
- [x] tray.ts - 系统托盘

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

### 路由完善
- [ ] 路由: /quadrant (艾森豪威尔矩阵)
- [ ] 路由: /pomodoro (番茄钟)
- [ ] 路由: /habits (习惯追踪)
- [ ] 路由: /notes (便签)
- [ ] 侧边栏导航完善 - 添加所有视图入口

### 任务功能
- [ ] 任务创建/编辑弹窗 (TaskEditor)
- [ ] 任务详情面板 (任务描述/子任务/评论)
- [ ] 任务拖拽排序
- [ ] 任务批量操作
- [ ] 任务搜索和筛选
- [ ] 任务重复规则设置
- [ ] 任务时间范围设置 (start_time/end_time)

### 清单功能
- [ ] 清单创建/编辑弹窗
- [ ] 清单图标选择器
- [ ] 清单颜色选择器
- [ ] 清单拖拽排序
- [ ] 内置特殊清单 (今天/明天/本周/所有任务)

### 习惯功能
- [ ] 习惯创建/编辑弹窗
- [ ] 习惯提醒设置
- [ ] 习惯统计详情

### 便签功能
- [ ] 便签创建/编辑弹窗
- [ ] 富文本编辑器完善
- [ ] 便签颜色选择器
- [ ] 便签拖拽排序
- [ ] 便签归档

### 番茄钟功能
- [ ] 白噪音选择
- [ ] 迷你悬浮窗口
- [ ] 番茄钟与任务关联
- [ ] 番茄钟统计图表

### 系统功能
- [ ] 全局快捷键注册 (Ctrl+N 新任务等)
- [ ] 系统托盘完善 (菜单/徽章)
- [ ] 桌面通知完善 (提醒/到期)
- [ ] 自动备份机制
- [ ] 窗口状态记忆

### 组件完善
- [ ] TaskEditor - 任务编辑器弹窗
- [ ] ListEditor - 清单编辑器弹窗
- [ ] HabitEditor - 习惯编辑器弹窗
- [ ] NoteEditor - 便签编辑器弹窗
- [ ] ReminderPicker - 提醒时间选择器
- [ ] RepeatRulePicker - 重复规则选择器
- [ ] IconPicker - 图标选择器
- [ ] ColorPicker - 颜色选择器
- [ ] TagInput - 标签输入组件

### 数据持久化
- [ ] Electron 主进程数据库初始化调用
- [ ] IPC 处理器注册
- [ ] 渲染进程数据加载

### 构建发布
- [ ] 应用图标设置
- [ ] Windows 安装包构建
- [ ] macOS 构建配置
- [ ] Linux 构建配置
- [ ] 自动更新机制

---

## 优先级排序

### P0 - 核心体验
1. 路由完善 (让所有页面可访问)
2. 任务编辑器弹窗 (核心 CRUD)
3. 数据持久化 (Electron 启动数据库)
4. IPC 通信打通

### P1 - 主要功能
5. 清单编辑器
6. 习惯编辑器
7. 便签编辑器
8. 番茄钟完善

### P2 - 交互优化
9. 拖拽排序
10. 全局快捷键
11. 桌面通知
12. 窗口状态记忆

### P3 - 完善功能
13. 搜索筛选
14. 统计图表
15. 数据备份
16. 自动更新
