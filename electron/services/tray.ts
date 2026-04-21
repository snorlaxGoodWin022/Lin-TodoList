import { BrowserWindow, Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'

let tray: Tray | null = null
let isQuitting = false

export function createTray(mainWindow: BrowserWindow | null): void {
  // Create tray icon
  const iconPath = join(__dirname, '../../resources/icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  // Fallback to a generic icon if the file doesn't exist
  if (icon.isEmpty()) {
    console.warn('Tray icon not found, using default icon')
    // Create a simple green circle as fallback
    const fallbackIcon = nativeImage.createFromBuffer(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#10B981"/></svg>'
      )
    )
    tray = new Tray(fallbackIcon)
  } else {
    tray = new Tray(icon)
  }

  tray.setToolTip('Lin TodoList')

  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) return
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '新建任务',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('shortcut:new-task')
        }
      }
    },
    {
      label: '开始番茄钟',
      accelerator: 'CmdOrCtrl+Shift+P',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('shortcut:pomodoro')
        }
      }
    },
    { type: 'separator' },
    {
      label: '关于',
      click: () => {
        // TODO: Show about dialog
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('app:show-about')
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // Single click to show/hide window (Windows/Linux)
  tray.on('click', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Handle window close event (minimize to tray)
  if (mainWindow) {
    mainWindow.on('close', (event) => {
      // Prevent actual close, minimize to tray
      if (!isQuitting) {
        event.preventDefault()
        mainWindow?.hide()
        return false
      }
      return true
    })
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}