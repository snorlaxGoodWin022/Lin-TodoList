import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface List {
  id: string
  name: string
  color: string
  icon: string
  group_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ListGroup {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export function setupListHandlers(): void {
  ipcMain.handle('list:all', handleGetAllLists)
  ipcMain.handle('list:create', handleCreateList)
  ipcMain.handle('list:update', handleUpdateList)
  ipcMain.handle('list:delete', handleDeleteList)

  // List group handlers
  ipcMain.handle('listGroup:all', handleGetAllListGroups)
  ipcMain.handle('listGroup:create', handleCreateListGroup)
  ipcMain.handle('listGroup:update', handleUpdateListGroup)
  ipcMain.handle('listGroup:delete', handleDeleteListGroup)
}

async function handleGetAllLists(): Promise<List[]> {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM lists ORDER BY sort_order ASC, created_at DESC')
  return stmt.all() as List[]
}

async function handleGetAllListGroups(): Promise<ListGroup[]> {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM list_groups ORDER BY sort_order ASC, created_at DESC')
  return stmt.all() as ListGroup[]
}

async function handleCreateList(
  _event: Electron.IpcMainInvokeEvent,
  listData: Partial<List>
): Promise<List> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const list: List = {
    id,
    name: listData.name || '',
    color: listData.color || '#10B981',
    icon: listData.icon || 'folder',
    group_id: listData.group_id || null,
    sort_order: listData.sort_order || Date.now(),
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO lists (id, name, color, icon, group_id, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    list.id,
    list.name,
    list.color,
    list.icon,
    list.group_id,
    list.sort_order,
    list.created_at,
    list.updated_at
  )

  return list
}

async function handleCreateListGroup(
  _event: Electron.IpcMainInvokeEvent,
  groupData: Partial<ListGroup>
): Promise<ListGroup> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const group: ListGroup = {
    id,
    name: groupData.name || '',
    color: groupData.color || '#10B981',
    sort_order: groupData.sort_order || Date.now(),
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO list_groups (id, name, color, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(group.id, group.name, group.color, group.sort_order, group.created_at, group.updated_at)

  return group
}

async function handleUpdateList(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<List>
): Promise<boolean> {
  const db = getDatabase()

  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }

  if (updates.color !== undefined) {
    fields.push('color = ?')
    values.push(updates.color)
  }

  if (updates.icon !== undefined) {
    fields.push('icon = ?')
    values.push(updates.icon)
  }

  if (updates.group_id !== undefined) {
    fields.push('group_id = ?')
    values.push(updates.group_id)
  }

  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(updates.sort_order)
  }

  // Always update updated_at
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())

  // Add id to values
  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE lists SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleUpdateListGroup(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<ListGroup>
): Promise<boolean> {
  const db = getDatabase()

  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }

  if (updates.color !== undefined) {
    fields.push('color = ?')
    values.push(updates.color)
  }

  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(updates.sort_order)
  }

  // Always update updated_at
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())

  // Add id to values
  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE list_groups SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteList(_event: Electron.IpcMainInvokeEvent, id: string): Promise<boolean> {
  const db = getDatabase()
  // Note: tasks table has foreign key constraint with ON DELETE CASCADE
  const stmt = db.prepare('DELETE FROM lists WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

async function handleDeleteListGroup(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<boolean> {
  const db = getDatabase()
  // Set group_id to null for lists in this group before deleting
  db.prepare('UPDATE lists SET group_id = NULL WHERE group_id = ?').run(id)
  const stmt = db.prepare('DELETE FROM list_groups WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}
