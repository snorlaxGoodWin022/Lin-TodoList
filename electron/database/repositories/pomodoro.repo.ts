import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../init'

export interface PomodoroRecord {
  id: string
  task_id: string | null
  duration: number
  type: string
  started_at: string
  completed_at: string
}

export interface PomodoroStats {
  total_focus_minutes: number
  total_break_minutes: number
  daily_average: number
  streak_days: number
}

export interface PomodoroFilters {
  startDate?: string
  endDate?: string
  taskId?: string
  type?: string
}

export function setupPomodoroHandlers(): void {
  ipcMain.handle('pomodoro:save', handleSavePomodoro)
  ipcMain.handle('pomodoro:stats', handleGetPomodoroStats)
}

async function handleSavePomodoro(
  _event: Electron.IpcMainInvokeEvent,
  recordData: Partial<PomodoroRecord>
): Promise<PomodoroRecord> {
  const db = getDatabase()
  const id = uuidv4()

  const record: PomodoroRecord = {
    id,
    task_id: recordData.task_id || null,
    duration: recordData.duration || 25,
    type: recordData.type || 'focus',
    started_at: recordData.started_at || new Date().toISOString(),
    completed_at: recordData.completed_at || new Date().toISOString(),
  }

  const stmt = db.prepare(`
    INSERT INTO pomodoro_records (id, task_id, duration, type, started_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    record.id,
    record.task_id,
    record.duration,
    record.type,
    record.started_at,
    record.completed_at
  )

  return record
}

async function handleGetPomodoroStats(
  _event: Electron.IpcMainInvokeEvent,
  _range?: string
): Promise<PomodoroStats> {
  const db = getDatabase()

  // Default to last 30 days if no range specified
  let startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  const startDateStr = startDate.toISOString().split('T')[0]

  let sql = `
    SELECT
      SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as total_focus_minutes,
      SUM(CASE WHEN type = 'break' THEN duration ELSE 0 END) as total_break_minutes,
      COUNT(DISTINCT DATE(completed_at)) as days_with_records
    FROM pomodoro_records
    WHERE completed_at >= ?
  `
  const params: any[] = [startDateStr]

  const stmt = db.prepare(sql)
  const result = stmt.get(...params) as {
    total_focus_minutes: number | null
    total_break_minutes: number | null
    days_with_records: number
  }

  const totalFocus = result.total_focus_minutes || 0
  const totalBreak = result.total_break_minutes || 0
  const daysWithRecords = result.days_with_records || 1 // Avoid division by zero

  // Calculate daily average (focus minutes per day)
  const dailyAverage = Math.round(totalFocus / daysWithRecords)

  // Calculate streak (consecutive days with at least one focus session)
  const streakStmt = db.prepare(`
    WITH RECURSIVE dates(date) AS (
      SELECT DATE('now')
      UNION ALL
      SELECT DATE(date, '-1 day')
      FROM dates
      WHERE DATE(date, '-1 day') >= DATE('now', '-30 days')
    ),
    focus_days AS (
      SELECT DISTINCT DATE(completed_at) as date
      FROM pomodoro_records
      WHERE type = 'focus'
      AND completed_at >= DATE('now', '-30 days')
    )
    SELECT MAX(streak) as streak_days
    FROM (
      SELECT date,
             ROW_NUMBER() OVER (ORDER BY date DESC) -
             ROW_NUMBER() OVER (PARTITION BY focus_days.date IS NOT NULL ORDER BY date DESC) as streak_group
      FROM dates
      LEFT JOIN focus_days ON dates.date = focus_days.date
    )
    WHERE date IS NOT NULL
    GROUP BY streak_group
    ORDER BY COUNT(*) DESC
    LIMIT 1
  `)

  const streakResult = streakStmt.get() as { streak_days: number } | undefined
  const streakDays = streakResult?.streak_days || 0

  return {
    total_focus_minutes: totalFocus,
    total_break_minutes: totalBreak,
    daily_average: dailyAverage,
    streak_days: streakDays,
  }
}
