import { BrowserWindow, globalShortcut, ipcMain } from 'electron'

export function registerShortcuts(mainWindow: BrowserWindow | null): void {
  if (!mainWindow) return

  // Register global shortcuts
  const shortcuts = [
    { accelerator: 'CmdOrCtrl+N', action: 'shortcut:new-task' },
    { accelerator: 'CmdOrCtrl+Shift+N', action: 'shortcut:new-note' },
    { accelerator: 'CmdOrCtrl+F', action: 'shortcut:search' },
    { accelerator: 'CmdOrCtrl+,', action: 'shortcut:settings' },
    { accelerator: 'CmdOrCtrl+Q', action: 'shortcut:quit' },
    { accelerator: 'CmdOrCtrl+Shift+P', action: 'shortcut:pomodoro' }
  ]

  // View switching shortcuts (Ctrl+1~7)
  for (let i = 1; i <= 7; i++) {
    shortcuts.push({
      accelerator: `CmdOrCtrl+${i}`,
      action: `shortcut:switch-view:${i}`
    })
  }

  // Register all shortcuts
  shortcuts.forEach(({ accelerator, action }) => {
    const ret = globalShortcut.register(accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(action)
      }
    })

    if (!ret) {
      console.warn(`Failed to register shortcut: ${accelerator}`)
    }
  })

  // Handle quit shortcut separately (Ctrl+Q)
  const quitShortcut = 'CmdOrCtrl+Q'
  globalShortcut.register(quitShortcut, () => {
    // This will trigger the app to quit
    ipcMain.emit('app:quit')
  })

  // Cleanup on app quit
  const cleanup = () => {
    globalShortcut.unregisterAll()
  }

  mainWindow.on('closed', cleanup)
  mainWindow.on('close', cleanup)
}

// Unregister all shortcuts (call before app quit)
export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll()
}