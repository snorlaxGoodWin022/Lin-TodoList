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
    const now = new Date().toISOString()

    // Find tasks with due reminders
    // Conditions:
    // 1. Task is not completed (completed = 0)
    // 2. remind_at is not null and remind_at <= now
    // 3. If remind_persistent = 0, we should clear remind_at after sending
    const stmt = db.prepare(`
      SELECT id, title, description, remind_at, remind_persistent
      FROM tasks
      WHERE completed = 0
        AND remind_at IS NOT NULL
        AND remind_at <= ?
      ORDER BY remind_at ASC
    `)

    const dueTasks = stmt.all(now) as Array<{
      id: string
      title: string
      description: string
      remind_at: string
      remind_persistent: number
    }>

    for (const task of dueTasks) {
      // Send notification
      showNotification({
        title: '任务提醒',
        body: task.title,
        subtitle: task.description || '点击查看详情',
        silent: false
      })

      // Send IPC event to renderer for real-time updates
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('reminder:trigger', {
          taskId: task.id,
          title: task.title,
          remindAt: task.remind_at
        })
      }

      // If not persistent, clear the reminder
      if (task.remind_persistent === 0) {
        const updateStmt = db.prepare(`
          UPDATE tasks SET remind_at = NULL, updated_at = ? WHERE id = ?
        `)
        updateStmt.run(new Date().toISOString(), task.id)
      } else {
        // For persistent reminders, we could schedule the next reminder
        // For now, we just keep the remind_at as is (will trigger again next minute)
        // In a real implementation, you might want to advance the remind_at by some interval
      }
    }

    // Also check for tasks with due_date and remind_advance
    // This is a simplified implementation - in a real app you'd need more sophisticated logic
    const dueDateStmt = db.prepare(`
      SELECT id, title, description, due_date, remind_advance
      FROM tasks
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND remind_advance > 0
        AND datetime(due_date) <= datetime(?, '+' || remind_advance || ' minutes')
    `)

    const dueDateTasks = dueDateStmt.all(now) as Array<{
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

      // Send IPC event
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