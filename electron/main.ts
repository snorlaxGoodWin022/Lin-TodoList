import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { initDatabase } from './database/init'
import { registerShortcuts } from './services/shortcut'
import { createTray, setIsQuitting } from './services/tray'
import { setupNotifications, setMainWindow } from './services/notification'

// Import repository handlers
import { setupTaskHandlers } from './database/repositories/task.repo'
import { setupListHandlers } from './database/repositories/list.repo'
import { setupHabitHandlers } from './database/repositories/habit.repo'
import { setupNoteHandlers } from './database/repositories/note.repo'
import { setupPomodoroHandlers } from './database/repositories/pomodoro.repo'
import { setupTagHandlers } from './database/repositories/tag.repo'

// Window state storage
interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

const getConfigPath = () => {
  const configDir = join(app.getPath('userData'), 'config')
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  return join(configDir, 'window-state.json')
}

const loadWindowState = (): WindowState => {
  try {
    const configPath = getConfigPath()
    if (existsSync(configPath)) {
      const data = readFileSync(configPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load window state:', e)
  }
  return { width: 1200, height: 800, isMaximized: false }
}

const saveWindowState = (window: BrowserWindow) => {
  try {
    const bounds = window.getBounds()
    const state: WindowState = {
      ...bounds,
      isMaximized: window.isMaximized()
    }
    const configPath = getConfigPath()
    writeFileSync(configPath, JSON.stringify(state, null, 2))
  } catch (e) {
    console.error('Failed to save window state:', e)
  }
}

let mainWindow: BrowserWindow | null = null
let miniWindow: BrowserWindow | null = null

function createWindow(): void {
  const windowState = loadWindowState()

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
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

  // Restore maximized state
  if (windowState.isMaximized) {
    mainWindow.maximize()
  }

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

  // Save window state on close
  mainWindow.on('close', () => {
    if (mainWindow) {
      saveWindowState(mainWindow)
    }
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // Handle mini window close
  mainWindow.on('closed', () => {
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.close()
    }
    mainWindow = null
  })
}

function createMiniWindow(): void {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.show()
    miniWindow.focus()
    return
  }

  miniWindow = new BrowserWindow({
    width: 200,
    height: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../electron/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (import.meta.env.DEV) {
    miniWindow.loadURL('http://localhost:5173/mini.html')
  } else {
    miniWindow.loadFile(join(__dirname, '../dist/mini.html'))
  }

  miniWindow.on('ready-to-show', () => {
    miniWindow?.show()
  })

  miniWindow.on('closed', () => {
    miniWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.lin.todolist')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('before-quit', () => {
    setIsQuitting(true)
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

  // Mini window handlers
  ipcMain.handle('mini-window:create', () => {
    createMiniWindow()
  })

  ipcMain.on('mini-window:close', () => {
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.close()
    }
  })

  // Pomodoro tick from mini window
  ipcMain.on('pomodoro:tick', (event, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('pomodoro:tick', data)
    }
  })

  ipcMain.on('pomodoro:complete', (event, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('pomodoro:complete', data)
    }
  })
}

// Export for use in other modules
export { mainWindow, miniWindow }