import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export function setupTagHandlers(): void {
  ipcMain.handle('tag:all', handleGetAllTags)
  ipcMain.handle('tag:create', handleCreateTag)
  ipcMain.handle('tag:update', handleUpdateTag)
  ipcMain.handle('tag:delete', handleDeleteTag)
}

async function handleGetAllTags(): Promise<Tag[]> {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM tags ORDER BY name ASC')
  return stmt.all() as Tag[]
}

async function handleCreateTag(
  _event: Electron.IpcMainInvokeEvent,
  tagData: Partial<Tag>
): Promise<Tag> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const tag: Tag = {
    id,
    name: tagData.name || '',
    color: tagData.color || '#10B981',
    created_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO tags (id, name, color, created_at)
    VALUES (?, ?, ?, ?)
  `)

  stmt.run(tag.id, tag.name, tag.color, tag.created_at)

  return tag
}

async function handleUpdateTag(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<Tag>
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

  // Add id to values
  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE tags SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteTag(_event: Electron.IpcMainInvokeEvent, id: string): Promise<boolean> {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM tags WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}
