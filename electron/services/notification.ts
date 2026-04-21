import { Notification, ipcMain, BrowserWindow } from 'electron'
import { getDatabase } from '../database/init'

let reminderInterval: NodeJS.Timeout | null = null
let mainWindow: BrowserWindow | null = null

export interface NotificationOptions {
  title: string
  body: string
  subtitle?: string
  silent?: boolean
  icon?: string
  data?: any
}

export function setupNotifications(): void {
  // IPC handler for showing notifications
  ipcMain.handle('notification:show', (_event, options: NotificationOptions) => {
    showNotification(options)
  })

  // Start reminder scheduler
  startReminderScheduler()
}

export function setMainWindow(window: BrowserWindow | null): void {
  mainWindow = window
}

export function showNotification(options: NotificationOptions): void {
  const { title, body, subtitle, silent = false, icon, data } = options

  const notification = new Notification({
    title,
    body,
    subtitle,
    silent,
    icon,
    hasReply: false,
    timeoutType: 'default'
  })

  notification.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  notification.show()
}

export function startReminderScheduler(): void {
  // Check for due reminders every minute
  reminderInterval = setInterval(() => {
    checkDueReminders()
  }, 60 * 1000)

  // Initial check after 5 seconds (allow app to fully start)
  setTimeout(() => {
    checkDueReminders()
  }, 5000)
}

export function stopReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
  }
}

async function checkDueReminders(): Promise<void> {
  try {
    const db = getDatabase()
    const now = new Date()
    const nowStr = now.toISOString()
    const todayStr = nowStr.split('T')[0]

    // Find tasks with due reminders (existing code)
    const stmt = db.prepare(`
      SELECT id, title, description, remind_at, remind_persistent
      FROM tasks
      WHERE completed = 0
        AND remind_at IS NOT NULL
        AND remind_at <= ?
      ORDER BY remind_at ASC
    `)

    const dueTasks = stmt.all(nowStr) as Array<{
      id: string
      title: string
      description: string
      remind_at: string
      remind_persistent: number
    }>

    for (const task of dueTasks) {
      showNotification({
        title: '任务提醒',
        body: task.title,
        subtitle: task.description || '点击查看详情',
        silent: false
      })

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('reminder:trigger', {
          taskId: task.id,
          title: task.title,
          remindAt: task.remind_at
        })
      }

      if (task.remind_persistent === 0) {
        const updateStmt = db.prepare(`
          UPDATE tasks SET remind_at = NULL, updated_at = ? WHERE id = ?
        `)
        updateStmt.run(new Date().toISOString(), task.id)
      }
    }

    // Check for habit reminders
    const habitStmt = db.prepare(`
      SELECT id, name, icon, remind_at, frequency
      FROM habits
      WHERE archived = 0
        AND remind_at IS NOT NULL
      ORDER BY remind_at ASC
    `)

    const habitsWithReminders = habitStmt.all() as Array<{
      id: string
      name: string
      icon: string
      remind_at: string
      frequency: string
    }>

    for (const habit of habitsWithReminders) {
      const remindTime = new Date(habit.remind_at)
      // Check if the reminder time has passed today
      if (now >= remindTime) {
        // Check if the habit was already completed today
        const recordStmt = db.prepare(`
          SELECT completed FROM habit_records
          WHERE habit_id = ? AND date = ?
        `)
        const record = recordStmt.get(habit.id, todayStr) as { completed: number } | undefined

        if (!record || record.completed === 0) {
          showNotification({
            title: '习惯提醒',
            body: `${habit.icon} ${habit.name}`,
            subtitle: '今天还没完成，记得打卡哦！',
            silent: false
          })

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('habit-reminder:trigger', {
              habitId: habit.id,
              name: habit.name,
              remindAt: habit.remind_at
            })
          }
        }
      }
    }

    // Also check for tasks with due_date and remind_advance (existing code)
    const dueDateStmt = db.prepare(`
      SELECT id, title, description, due_date, remind_advance
      FROM tasks
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND remind_advance > 0
        AND datetime(due_date) <= datetime(?, '+' || remind_advance || ' minutes')
    `)

    const dueDateTasks = dueDateStmt.all(nowStr) as Array<{
      id: string
      title: string
      description: string
      due_date: string
      remind_advance: number
    }>

    for (const task of dueDateTasks) {
      showNotification({
        title: '任务即将到期',
        body: `${task.title} (${task.remind_advance}分钟前提醒)`,
        subtitle: `截止时间: ${task.due_date}`,
        silent: false
      })

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('reminder:trigger', {
          taskId: task.id,
          title: task.title,
          dueDate: task.due_date,
          remindAdvance: task.remind_advance
        })
      }
    }
  } catch (error) {
    console.error('Error checking due reminders:', error)
  }
}