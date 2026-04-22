import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface Task {
  id: string
  title: string
  description: string
  priority: number
  start_time: string | null
  end_time: string | null
  due_date: string | null
  repeat_rule: string | null
  list_id: string
  tags: string
  quadrant: number
  completed: number
  completed_at: string | null
  sort_order: number
  remind_at: string | null
  remind_advance: number
  remind_persistent: number
  created_at: string
  updated_at: string
}

export interface TaskFilters {
  listId?: string
  dueDate?: string
  completed?: boolean
  priority?: number
  quadrant?: number
  tags?: string[]
  search?: string
}

export function setupTaskHandlers(): void {
  ipcMain.handle('task:list', handleListTasks)
  ipcMain.handle('task:create', handleCreateTask)
  ipcMain.handle('task:update', handleUpdateTask)
  ipcMain.handle('task:delete', handleDeleteTask)
  ipcMain.handle('task:toggle', handleToggleTask)
}

async function handleListTasks(
  _event: Electron.IpcMainInvokeEvent,
  filters: TaskFilters = {}
): Promise<Task[]> {
  const db = getDatabase()

  let sql = 'SELECT * FROM tasks WHERE 1=1'
  const params: any[] = []

  if (filters.listId) {
    sql += ' AND list_id = ?'
    params.push(filters.listId)
  }

  if (filters.dueDate) {
    sql += ' AND due_date = ?'
    params.push(filters.dueDate)
  }

  if (filters.completed !== undefined) {
    sql += ' AND completed = ?'
    params.push(filters.completed ? 1 : 0)
  }

  if (filters.priority !== undefined) {
    sql += ' AND priority = ?'
    params.push(filters.priority)
  }

  if (filters.quadrant !== undefined) {
    sql += ' AND quadrant = ?'
    params.push(filters.quadrant)
  }

  if (filters.search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)'
    const searchTerm = `%${filters.search}%`
    params.push(searchTerm, searchTerm)
  }

  sql += ' ORDER BY sort_order ASC, created_at DESC'

  const stmt = db.prepare(sql)
  return stmt.all(...params) as Task[]
}

async function handleCreateTask(
  _event: Electron.IpcMainInvokeEvent,
  taskData: Partial<Task>
): Promise<Task> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const task: Task = {
    id,
    title: taskData.title || '',
    description: taskData.description || '',
    priority: taskData.priority || 0,
    start_time: taskData.start_time || null,
    end_time: taskData.end_time || null,
    due_date: taskData.due_date || null,
    repeat_rule: taskData.repeat_rule || null,
    list_id: taskData.list_id || 'inbox',
    tags: taskData.tags || '[]',
    quadrant: taskData.quadrant || 0,
    completed: 0,
    completed_at: null,
    sort_order: taskData.sort_order || Date.now(),
    remind_at: taskData.remind_at || null,
    remind_advance: taskData.remind_advance || 0,
    remind_persistent: taskData.remind_persistent || 0,
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (
      id, title, description, priority, start_time, end_time, due_date,
      repeat_rule, list_id, tags, quadrant, completed, completed_at,
      sort_order, remind_at, remind_advance, remind_persistent,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)

  stmt.run(
    task.id,
    task.title,
    task.description,
    task.priority,
    task.start_time,
    task.end_time,
    task.due_date,
    task.repeat_rule,
    task.list_id,
    task.tags,
    task.quadrant,
    task.completed,
    task.completed_at,
    task.sort_order,
    task.remind_at,
    task.remind_advance,
    task.remind_persistent,
    task.created_at,
    task.updated_at
  )

  return task
}

async function handleUpdateTask(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<Task>
): Promise<boolean> {
  const db = getDatabase()

  // Build dynamic update query
  const fields: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) {
    fields.push('title = ?')
    values.push(updates.title)
  }

  if (updates.description !== undefined) {
    fields.push('description = ?')
    values.push(updates.description)
  }

  if (updates.priority !== undefined) {
    fields.push('priority = ?')
    values.push(updates.priority)
  }

  if (updates.start_time !== undefined) {
    fields.push('start_time = ?')
    values.push(updates.start_time)
  }

  if (updates.end_time !== undefined) {
    fields.push('end_time = ?')
    values.push(updates.end_time)
  }

  if (updates.due_date !== undefined) {
    fields.push('due_date = ?')
    values.push(updates.due_date)
  }

  if (updates.repeat_rule !== undefined) {
    fields.push('repeat_rule = ?')
    values.push(updates.repeat_rule)
  }

  if (updates.list_id !== undefined) {
    fields.push('list_id = ?')
    values.push(updates.list_id)
  }

  if (updates.tags !== undefined) {
    fields.push('tags = ?')
    values.push(updates.tags)
  }

  if (updates.quadrant !== undefined) {
    fields.push('quadrant = ?')
    values.push(updates.quadrant)
  }

  if (updates.completed !== undefined) {
    fields.push('completed = ?')
    values.push(updates.completed ? 1 : 0)
    if (updates.completed) {
      fields.push('completed_at = ?')
      values.push(new Date().toISOString())
    } else {
      fields.push('completed_at = NULL')
    }
  }

  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(updates.sort_order)
  }

  if (updates.remind_at !== undefined) {
    fields.push('remind_at = ?')
    values.push(updates.remind_at)
  }

  if (updates.remind_advance !== undefined) {
    fields.push('remind_advance = ?')
    values.push(updates.remind_advance)
  }

  if (updates.remind_persistent !== undefined) {
    fields.push('remind_persistent = ?')
    values.push(updates.remind_persistent)
  }

  // Always update updated_at
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())

  // Add id to values
  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteTask(_event: Electron.IpcMainInvokeEvent, id: string): Promise<boolean> {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

async function handleToggleTask(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  completed: boolean
): Promise<boolean> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    UPDATE tasks
    SET completed = ?, completed_at = ?, updated_at = ?
    WHERE id = ?
  `)

  const result = stmt.run(completed ? 1 : 0, completed ? now : null, now, id)

  return result.changes > 0
}
