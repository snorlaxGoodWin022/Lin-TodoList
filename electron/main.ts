import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { initDatabase } from './database/init'
import { registerShortcuts } from './services/shortcut'
import { createTray } from './services/tray'
import { setupNotifications, setMainWindow } from './services/notification'

// Import repository handlers
import { setupTaskHandlers } from './database/repositories/task.repo'
import { setupListHandlers } from './database/repositories/list.repo'
import { setupHabitHandlers } from './database/repositories/habit.repo'
import { setupNoteHandlers } from './database/repositories/note.repo'
import { setupPomodoroHandlers } from './database/repositories/pomodoro.repo'
import { setupTagHandlers } from './database/repositories/tag.repo'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: true,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../electron/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Load the index.html of the app.
  if (import.meta.env.DEV) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.lin.todolist')
  ;(app as any).isQuitting = false

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('before-quit', () => {
    ;(app as any).isQuitting = true
  })

  // Initialize database
  await initDatabase()

  // Setup IPC handlers
  setupIPCHandlers()

  // Setup services
  registerShortcuts(mainWindow)
  createTray(mainWindow)
  setupNotifications()

  createWindow()
  setMainWindow(mainWindow)

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Setup all IPC handlers
function setupIPCHandlers(): void {
  setupTaskHandlers()
  setupListHandlers()
  setupHabitHandlers()
  setupNoteHandlers()
  setupPomodoroHandlers()
  setupTagHandlers()

  // System handlers
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:getPath', (_, name) => app.getPath(name))
}

// Export for use in other modules
export { mainWindow }