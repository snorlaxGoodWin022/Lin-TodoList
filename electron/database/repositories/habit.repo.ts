import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface Habit {
  id: string
  name: string
  icon: string
  frequency: string
  target_days: string
  remind_at: string | null
  sort_order: number
  archived: number
  created_at: string
  updated_at: string
}

export interface HabitRecord {
  id: string
  habit_id: string
  date: string
  completed: number
  created_at: string
}

export interface HabitFilters {
  archived?: boolean
}

export function setupHabitHandlers(): void {
  ipcMain.handle('habit:all', handleGetAllHabits)
  ipcMain.handle('habit:create', handleCreateHabit)
  ipcMain.handle('habit:update', handleUpdateHabit)
  ipcMain.handle('habit:delete', handleDeleteHabit)
  ipcMain.handle('habit:toggle', handleToggleHabitRecord)
  ipcMain.handle('habit:records', handleGetHabitRecords)
}

async function handleGetAllHabits(
  _event: Electron.IpcMainInvokeEvent,
  filters: HabitFilters = {}
): Promise<Habit[]> {
  const db = getDatabase()

  let sql = 'SELECT * FROM habits WHERE 1=1'
  const params: any[] = []

  if (filters.archived !== undefined) {
    sql += ' AND archived = ?'
    params.push(filters.archived ? 1 : 0)
  }

  sql += ' ORDER BY sort_order ASC, created_at DESC'

  const stmt = db.prepare(sql)
  return stmt.all(...params) as Habit[]
}

async function handleCreateHabit(
  _event: Electron.IpcMainInvokeEvent,
  habitData: Partial<Habit>
): Promise<Habit> {
  const db = getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()

  const habit: Habit = {
    id,
    name: habitData.name || '',
    icon: habitData.icon || 'check',
    frequency: habitData.frequency || 'daily',
    target_days: habitData.target_days || '[]',
    remind_at: habitData.remind_at || null,
    sort_order: habitData.sort_order || Date.now(),
    archived: 0,
    created_at: now,
    updated_at: now,
  }

  const stmt = db.prepare(`
    INSERT INTO habits (
      id, name, icon, frequency, target_days, remind_at,
      sort_order, archived, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    habit.id,
    habit.name,
    habit.icon,
    habit.frequency,
    habit.target_days,
    habit.remind_at,
    habit.sort_order,
    habit.archived,
    habit.created_at,
    habit.updated_at
  )

  return habit
}

async function handleUpdateHabit(
  _event: Electron.IpcMainInvokeEvent,
  id: string,
  updates: Partial<Habit>
): Promise<boolean> {
  const db = getDatabase()

  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }

  if (updates.icon !== undefined) {
    fields.push('icon = ?')
    values.push(updates.icon)
  }

  if (updates.frequency !== undefined) {
    fields.push('frequency = ?')
    values.push(updates.frequency)
  }

  if (updates.target_days !== undefined) {
    fields.push('target_days = ?')
    values.push(updates.target_days)
  }

  if (updates.remind_at !== undefined) {
    fields.push('remind_at = ?')
    values.push(updates.remind_at)
  }

  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(updates.sort_order)
  }

  if (updates.archived !== undefined) {
    fields.push('archived = ?')
    values.push(updates.archived ? 1 : 0)
  }

  // Always update updated_at
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())

  // Add id to values
  values.push(id)

  if (fields.length === 0) {
    return false
  }

  const sql = `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`
  const stmt = db.prepare(sql)
  const result = stmt.run(...values)

  return result.changes > 0
}

async function handleDeleteHabit(
  _event: Electron.IpcMainInvokeEvent,
  id: string
): Promise<boolean> {
  const db = getDatabase()
  // habit_records has foreign key constraint with ON DELETE CASCADE
  const stmt = db.prepare('DELETE FROM habits WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

async function handleToggleHabitRecord(
  _event: Electron.IpcMainInvokeEvent,
  habitId: string,
  date: string
): Promise<boolean> {
  const db = getDatabase()
  const now = new Date().toISOString()

  // Check if record exists
  const existing = db
    .prepare('SELECT * FROM habit_records WHERE habit_id = ? AND date = ?')
    .get(habitId, date) as HabitRecord | undefined

  if (existing) {
    // Toggle completion
    const stmt = db.prepare(`
      UPDATE habit_records
      SET completed = ?, created_at = ?
      WHERE habit_id = ? AND date = ?
    `)
    const result = stmt.run(existing.completed === 1 ? 0 : 1, now, habitId, date)
    return result.changes > 0
  } else {
    // Create new record with completed = 1
    const id = uuidv4()
    const stmt = db.prepare(`
      INSERT INTO habit_records (id, habit_id, date, completed, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    const result = stmt.run(id, habitId, date, 1, now)
    return result.changes > 0
  }
}

async function handleGetHabitRecords(
  _event: Electron.IpcMainInvokeEvent,
  habitId: string,
  month?: string
): Promise<HabitRecord[]> {
  const db = getDatabase()

  let sql = 'SELECT * FROM habit_records WHERE habit_id = ?'
  const params: any[] = [habitId]

  if (month) {
    // Filter by month (YYYY-MM format)
    sql += ' AND date LIKE ?'
    params.push(`${month}%`)
  }

  sql += ' ORDER BY date DESC'

  const stmt = db.prepare(sql)
  return stmt.all(...params) as HabitRecord[]
}
