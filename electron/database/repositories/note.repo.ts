import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface NoteFilters {
  pinned?: boolean
  search?: string
}

export function setupNoteHandlers(): void {
  ipcMain.handle('note:all', handleGetAllNotes)
  ipcMain.handle('note:create', handleCreateNote)
  ipcMain.handle('note:update', handleUpdateNote)
  ipcMain.handle('note:delete', handleDeleteNote)
}

async function handleGetAllNotes(
  _event: Electron.IpcMainInvokeEvent,
  filters: NoteFilters = {}
): Promise<Note[]> {
  const db = getDatabase()

  let sql = 'SELECT * FROM notes WHERE 1=1'
  const params: any[] = []

  if (filters.pinned !== undefined) {
    sql += ' AND pinned = ?'
    params.push(filters.pinned ? 1 : 0)
  }

  if (filters.search) {
    sql += ' AND (title LIKE ? OR content LIKE ?)'
    const searchTerm = `%${filters.search}%`
    params.push(searchTerm, searchTerm)
  }

  sql += ' ORDER BY pinned DESC, sort_order ASC, created_at DESC'

  const stmt = db.prepare(sql)
  return stmt.all(...params) as Note[]
}

async function handleCreateNote(
  _event: Electron.IpcMainInvokeEvent,
  noteData: Partial<Note>
): Promise<Note> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const note: Note = {
    id,
    title: noteData.title || '',
    content: noteData.content || '',
    color: noteData.color || '#FFFFFF',
    pinned: noteData.pinned || 0,
    sort_order: noteData.sort_order || Date.now(),
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO notes (id, title, content, color, pinned, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    note.id,
    note.title,
    note.content,
    note.color,
    note.pinned,
    note.sort_order,
    note.created_at,
    note.updated_at
  )

  return note
}

async function handleUpdateNote(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<Note>
): Promise<boolean> {
  const db = getDatabase()

  const fields: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) {
    fields.push('title = ?')
    values.push(updates.title)
  }

  if (updates.content !== undefined) {
    fields.push('content = ?')
    values.push(updates.content)
  }

  if (updates.color !== undefined) {
    fields.push('color = ?')
    values.push(updates.color)
  }

  if (updates.pinned !== undefined) {
    fields.push('pinned = ?')
    values.push(updates.pinned ? 1 : 0)
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

  const sql = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteNote(_event: Electron.IpcMainInvokeEvent, id: string): Promise<boolean> {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}
