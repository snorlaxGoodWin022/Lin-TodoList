# Lin-TodoList 功能测试方案

## 测试环境

- **应用**: Lin-TodoList (Vue 3 + Electron + SQLite)
- **测试方式**: CDP (Chrome DevTools Protocol) 自动化测试
- **调试端口**: 9222
- **页面 ID**: 通过 `http://localhost:9222/json` 获取

---

## 测试功能清单

### P0/P1/P2/P3 已完成功能

| #   | 功能模块        | 测试优先级 |
| --- | --------------- | ---------- |
| 1   | 任务管理 (CRUD) | P0         |
| 2   | 列表管理        | P1         |
| 3   | 习惯追踪        | P1         |
| 4   | 笔记            | P1         |
| 5   | 番茄钟          | P1         |
| 6   | 标签管理        | P2         |
| 7   | 过滤器预设      | P2         |
| 8   | 子任务          | P2         |
| 9   | 今日视图        | P1         |
| 10  | 日历视图        | P1         |
| 11  | 四象限视图      | P2         |
| 12  | 列表视图        | P1         |

---

## 功能测试用例

### 1. 任务管理 (Task CRUD)

#### 1.1 创建任务

```javascript
window.electronAPI.createTask({
  title: '测试任务',
  priority: 1,
  due_date: '2026-04-25',
  list_id: 'inbox',
})
```

**验证点**:

- 返回完整任务对象
- 包含自动生成的 ID
- 时间戳正确

#### 1.2 获取任务列表

```javascript
window.electronAPI.getTasks({})
```

**验证点**:

- 返回数组
- 任务包含所有字段 (id, title, priority, completed, due_date, list_id)

#### 1.3 更新任务

```javascript
window.electronAPI.updateTask(taskId, {
  title: '更新后的标题',
  priority: 2,
  completed: true,
})
```

**验证点**:

- 返回 true 表示成功
- 数据库中值已更新

#### 1.4 切换任务完成状态

```javascript
window.electronAPI.toggleTaskCompletion(taskId, true)
```

**验证点**:

- 返回 true
- `completed_at` 时间戳被设置

#### 1.5 删除任务

```javascript
window.electronAPI.deleteTask(taskId)
```

**验证点**:

- 返回 true
- 任务从列表中消失

#### 1.6 按过滤器获取任务

```javascript
window.electronAPI.getTasks({
  listId: 'inbox',
  priority: 1,
  completed: false,
})
```

**验证点**:

- 只返回匹配条件的任务

---

### 2. 列表管理 (List Management)

#### 2.1 获取所有列表

```javascript
window.electronAPI.getLists()
```

**验证点**:

- 返回数组
- 包含默认的 "Inbox" 列表

#### 2.2 创建列表

```javascript
window.electronAPI.createList({
  name: '工作',
  color: '#10b981',
  icon: 'briefcase',
})
```

**验证点**:

- 返回新列表对象
- ID 自动生成

#### 2.3 更新列表

```javascript
window.electronAPI.updateList(listId, {
  name: '新名称',
  color: '#ef4444',
})
```

**验证点**:

- 返回 true
- 更新生效

#### 2.4 删除列表

```javascript
window.electronAPI.deleteList(listId)
```

**验证点**:

- 返回 true
- 列表消失

#### 2.5 列表分组管理

```javascript
window.electronAPI.getListGroups()
window.electronAPI.createListGroup({ name: '个人' })
window.electronAPI.updateListGroup(groupId, { name: '工作' })
window.electronAPI.deleteListGroup(groupId)
```

---

### 3. 习惯追踪 (Habit Tracking)

#### 3.1 获取所有习惯

```javascript
window.electronAPI.getHabits()
```

**验证点**:

- 返回习惯数组
- 包含 habit_records 关联

#### 3.2 创建习惯

```javascript
window.electronAPI.createHabit({
  name: '每日阅读',
  frequency: 'daily',
  color: '#3b82f6',
})
```

#### 3.3 切换习惯记录

```javascript
window.electronAPI.toggleHabit(habitId, '2026-04-22')
```

**验证点**:

- 返回 true
- 记录被创建或删除

#### 3.4 获取习惯记录

```javascript
window.electronAPI.getHabitRecords(habitId, '2026-04')
```

**验证点**:

- 返回指定月份记录

---

### 4. 笔记 (Notes)

#### 4.1 获取所有笔记

```javascript
window.electronAPI.getNotes()
```

#### 4.2 创建笔记

```javascript
window.electronAPI.createNote({
  title: '会议记录',
  content: '今天讨论了...',
  color: '#fef08a',
})
```

#### 4.3 更新笔记

```javascript
window.electronAPI.updateNote(noteId, {
  content: '更新后的内容',
  pinned: true,
})
```

#### 4.4 删除笔记

```javascript
window.electronAPI.deleteNote(noteId)
```

---

### 5. 番茄钟 (Pomodoro)

#### 5.1 保存番茄记录

```javascript
window.electronAPI.savePomodoro({
  duration: 25,
  type: 'focus',
  task_id: taskId,
})
```

**验证点**:

- 返回记录对象

#### 5.2 获取统计

```javascript
window.electronAPI.getPomodoroStats('week')
```

**验证点**:

- 返回统计对象 (total, focus_time, break_time)

---

### 6. 标签管理 (Tags)

#### 6.1 获取所有标签

```javascript
window.electronAPI.getTags()
```

#### 6.2 创建标签

```javascript
window.electronAPI.createTag({
  name: '紧急',
  color: '#ef4444',
})
```

#### 6.3 更新/删除标签

```javascript
window.electronAPI.updateTag(tagId, { name: '重要' })
window.electronAPI.deleteTag(tagId)
```

---

### 7. 过滤器预设 (Filter Presets)

#### 7.1 获取预设

```javascript
window.electronAPI.getFilterPresets()
```

#### 7.2 创建预设

```javascript
window.electronAPI.createFilterPreset({
  name: '我的高优先级',
  filters: { priority: 3, completed: false },
})
```

#### 7.3 保存/删除预设

```javascript
window.electronAPI.deleteFilterPreset(presetId)
```

---

### 8. 子任务 (Subtasks)

#### 8.1 获取子任务

```javascript
window.electronAPI.getSubtasks({ parentId: taskId })
```

#### 8.2 创建子任务

```javascript
window.electronAPI.createSubtask({
  parent_id: taskId,
  title: '子任务 1',
  completed: false,
})
```

#### 8.3 更新子任务

```javascript
window.electronAPI.updateSubtask(subtaskId, {
  completed: true,
})
```

#### 8.4 删除子任务

```javascript
window.electronAPI.deleteSubtask(subtaskId)
```

---

## 视图功能测试

### 1. 今日视图 (Today View)

- URL: `http://localhost:5173/#/today`
- 验证: 显示今日任务和过期任务

### 2. 日历视图 (Calendar View)

- URL: `http://localhost:5173/#/calendar`
- 验证: 显示月/周/日视图

### 3. 四象限视图 (Quadrant View)

- URL: `http://localhost:5173/#/quadrant`
- 验证: 2x2 网格布局

### 4. 列表视图 (List View)

- URL: `http://localhost:5173/#/list`
- 验证: 按列表分组显示任务

### 5. 习惯视图 (Habit View)

- URL: `http://localhost:5173/#/habit`
- 验证: 习惯卡片和进度条

### 6. 番茄钟视图 (Pomodoro View)

- URL: `http://localhost:5173/#/pomodoro`
- 验证: 倒计时显示

### 7. 笔记视图 (Note View)

- URL: `http://localhost:5173/#/note`
- 验证: 瀑布流布局

---

## 测试执行方式

### CDP 测试脚本模板

```javascript
// 连接到 Electron 的 CDP
const WebSocket = require('ws')
const pageId = '你的页面ID'

const ws = new WebSocket('ws://localhost:9222/devtools/page/' + pageId)

ws.on('open', () => {
  // 启用 Runtime 域
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }))

  // 执行测试
  ws.send(
    JSON.stringify({
      id: 2,
      method: 'Runtime.evaluate',
      params: {
        expression: 'window.electronAPI.getTasks({})',
        awaitPromise: true,
        returnByValue: true,
      },
    })
  )
})

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString())
  if (msg.id === 2) {
    console.log('Result:', JSON.stringify(msg.result, null, 2))
    ws.close()
  }
})
```

---

## 测试结果记录

| 功能         | 测试时间   | 结果   | 备注                            |
| ------------ | ---------- | ------ | ------------------------------- |
| 任务创建     | 2026-04-22 | ✓ 通过 | ID生成、字段正确                |
| 任务查询     | 2026-04-22 | ✓ 通过 | 返回数组、包含必填字段          |
| 任务更新     | 2026-04-22 | ✓ 通过 | 返回true                        |
| 任务切换完成 | 2026-04-22 | ✓ 通过 | completed和completed_at正确更新 |
| 任务删除     | 2026-04-22 | ✓ 通过 | 任务从列表中消失                |
| 列表管理     | 2026-04-22 | ✓ 通过 | CRUD全部正常                    |
| 习惯追踪     | 2026-04-22 | ✓ 通过 | CRUD+记录切换正常               |
| 笔记         | 2026-04-22 | ✓ 通过 | CRUD全部正常                    |
| 番茄钟       | 2026-04-22 | ✓ 通过 | 保存正常，统计返回有效对象      |
| 标签         | 2026-04-22 | ✓ 通过 | CRUD全部正常                    |
| 过滤器预设   | 2026-04-22 | ✓ 修复 | handler名称修复后正常           |
| 子任务       | 2026-04-22 | ✓ 修复 | handler名称修复后正常           |

---

## 发现的问题

### 问题1: 过滤器预设 API 失效 (已修复)

- **严重程度**: 高
- **症状**: `getFilterPresets()` 返回 `undefined`
- **根因**: handler 名称不匹配 - preload 调用 `filterPreset:all`，handler 注册的是 `filterPreset:list`
- **修复**: 修改 `filterPreset.repo.ts` 第19行：`filterPreset:list` → `filterPreset:all`
- **状态**: ✓ 已修复

### 问题2: getSubtasks 返回 undefined (已修复)

- **严重程度**: 中
- **症状**: `getSubtasks()` 返回 `undefined`
- **根因**: handler 名称不匹配 - preload 调用 `subtask:all`，handler 注册的是 `subtask:list`
- **修复**: 修改 `subtask.repo.ts` 第20行：`subtask:list` → `subtask:all`
- **状态**: ✓ 已修复

### 问题3: getPomodoroStats 返回空对象 (已修复)

- **严重程度**: 低
- **症状**: `getPomodoroStats("week")` 返回 `{}`
- **根因**: SQL 查询返回 undefined 时未处理
- **修复**: 在 `pomodoro.repo.ts` 添加防御性检查，当结果为 undefined 时返回默认对象
- **状态**: ✓ 已修复

### 附注: filters 参数类型

- **问题**: `createFilterPreset({filters: {priority: 1}})` 传入对象会失败
- **原因**: 数据库 `filters` 字段是 TEXT 类型，需要 JSON 字符串
- **解决**: 传入 `filters: JSON.stringify({priority: 1})` 或 `filters: "{}"`

---

## 预期问题

1. **Port 5173 被占用**: 先 `taskkill /F /IM node.exe`
2. **Electron 启动失败**: 使用 `--no-sandbox` 参数
3. **Preload 未加载**: 检查 `contextIsolation: true` 和 `nodeIntegration: false`
4. **数据库锁定**: 确认只有一个 Electron 实例在运行
