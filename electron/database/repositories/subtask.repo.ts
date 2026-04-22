import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface Subtask {
  id: string
  parent_id: string
  title: string
  completed: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubtaskFilters {
  parentId?: string
}

export function setupSubtaskHandlers(): void {
  ipcMain.handle('subtask:list', handleListSubtasks)
  ipcMain.handle('subtask:create', handleCreateSubtask)
  ipcMain.handle('subtask:update', handleUpdateSubtask)
  ipcMain.handle('subtask:delete', handleDeleteSubtask)
}

async function handleListSubtasks(
  _event: Electron.IpcMainInvokeEvent,
  filters: SubtaskFilters = {}
): Promise<Subtask[]> {
  const db = getDatabase()

  let sql = 'SELECT * FROM subtasks WHERE 1=1'
  const params: any[] = []

  if (filters.parentId) {
    sql += ' AND parent_id = ?'
    params.push(filters.parentId)
  }

  sql += ' ORDER BY sort_order ASC, created_at DESC'

  const stmt = db.prepare(sql)
  return stmt.all(...params) as Subtask[]
}

async function handleCreateSubtask(
  _event: Electron.IpcMainInvokeEvent,
  data: Partial<Subtask>
): Promise<Subtask> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const subtask: Subtask = {
    id,
    parent_id: data.parent_id || '',
    title: data.title || '',
    completed: data.completed || 0,
    sort_order: data.sort_order || Date.now(),
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO subtasks (id, parent_id, title, completed, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    subtask.id,
    subtask.parent_id,
    subtask.title,
    subtask.completed,
    subtask.sort_order,
    subtask.created_at,
    subtask.updated_at
  )

  return subtask
}

async function handleUpdateSubtask(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<Subtask>
): Promise<boolean> {
  const db = getDatabase()

  const fields: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) {
    fields.push('title = ?')
    values.push(updates.title)
  }

  if (updates.completed !== undefined) {
    fields.push('completed = ?')
    values.push(updates.completed ? 1 : 0)
  }

  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(updates.sort_order)
  }

  // Always update updated_at
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())

  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE subtasks SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteSubtask(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<boolean> {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM subtasks WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}
