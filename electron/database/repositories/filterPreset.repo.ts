import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface FilterPreset {
  id: string
  name: string
  filters: string // JSON stringified TaskFilters
  is_default: number
  created_at: string
  updated_at: string
}

export interface FilterPresetFilters {
  is_default?: boolean
}

export function setupFilterPresetHandlers(): void {
  ipcMain.handle('filterPreset:all', handleListFilterPresets)
  ipcMain.handle('filterPreset:create', handleCreateFilterPreset)
  ipcMain.handle('filterPreset:update', handleUpdateFilterPreset)
  ipcMain.handle('filterPreset:delete', handleDeleteFilterPreset)
}

async function handleListFilterPresets(
  _event: Electron.IpcMainInvokeEvent,
  filters: FilterPresetFilters = {}
): Promise<FilterPreset[]> {
  const db = getDatabase()

  let sql = 'SELECT * FROM filter_presets WHERE 1=1'
  const params: any[] = []

  if (filters.is_default !== undefined) {
    sql += ' AND is_default = ?'
    params.push(filters.is_default ? 1 : 0)
  }

  sql += ' ORDER BY created_at DESC'

  const stmt = db.prepare(sql)
  return stmt.all(...params) as FilterPreset[]
}

async function handleCreateFilterPreset(
  _event: Electron.IpcMainInvokeEvent,
  data: Partial<FilterPreset>
): Promise<FilterPreset> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const preset: FilterPreset = {
    id,
    name: data.name || '未命名筛选',
    filters: data.filters || '{}',
    is_default: data.is_default || 0,
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO filter_presets (id, name, filters, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    preset.id,
    preset.name,
    preset.filters,
    preset.is_default,
    preset.created_at,
    preset.updated_at
  )

  return preset
}

async function handleUpdateFilterPreset(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<FilterPreset>
): Promise<boolean> {
  const db = getDatabase()

  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }

  if (updates.filters !== undefined) {
    fields.push('filters = ?')
    values.push(updates.filters)
  }

  if (updates.is_default !== undefined) {
    fields.push('is_default = ?')
    values.push(updates.is_default)
  }

  // Always update updated_at
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())

  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE filter_presets SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteFilterPreset(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<boolean> {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM filter_presets WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}
