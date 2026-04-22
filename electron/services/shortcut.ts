import { BrowserWindow, globalShortcut } from 'electron'

export function registerShortcuts(mainWindow: BrowserWindow | null): void {
  if (!mainWindow) return

  // Register global shortcuts
  const shortcuts = [
    { accelerator: 'CmdOrCtrl+N', action: 'shortcut:new-task' },
    { accelerator: 'CmdOrCtrl+Shift+N', action: 'shortcut:new-note' },
    { accelerator: 'CmdOrCtrl+F', action: 'shortcut:search' },
    { accelerator: 'CmdOrCtrl+Shift+P', action: 'shortcut:pomodoro' },
  ]

  // View switching shortcuts (Ctrl+1~6)
  for (let i = 1; i <= 6; i++) {
    shortcuts.push({
      accelerator: `CmdOrCtrl+${i}`,
      action: `shortcut:switch-view:${i}`,
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
