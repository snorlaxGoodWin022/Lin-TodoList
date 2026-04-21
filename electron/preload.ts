import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Task, TaskFilters } from './database/repositories/task.repo'
import type { List } from './database/repositories/list.repo'
import type { Habit, HabitRecord, HabitFilters } from './database/repositories/habit.repo'
import type { Note, NoteFilters } from './database/repositories/note.repo'
import type { PomodoroRecord, PomodoroStats } from './database/repositories/pomodoro.repo'
import type { Tag } from './database/repositories/tag.repo'
import type { NotificationOptions } from './services/notification'

// Custom APIs for renderer
const api = {
  // Task operations
  getTasks: (filters: TaskFilters) => ipcRenderer.invoke('task:all', filters),
  createTask: (data: Partial<Task>) => ipcRenderer.invoke('task:create', data),
  updateTask: (id: string, data: Partial<Task>) => ipcRenderer.invoke('task:update', id, data),
  deleteTask: (id: string) => ipcRenderer.invoke('task:delete', id),
  toggleTaskCompletion: (id: string, completed: boolean) => ipcRenderer.invoke('task:toggle', id, completed),

  // List operations
  getLists: () => ipcRenderer.invoke('list:all'),
  createList: (data: Partial<List>) => ipcRenderer.invoke('list:create', data),
  updateList: (id: string, data: Partial<List>) => ipcRenderer.invoke('list:update', id, data),
  deleteList: (id: string) => ipcRenderer.invoke('list:delete', id),

  // Habit operations
  getHabits: () => ipcRenderer.invoke('habit:all'),
  createHabit: (data: Partial<Habit>) => ipcRenderer.invoke('habit:create', data),
  updateHabit: (id: string, data: Partial<Habit>) => ipcRenderer.invoke('habit:update', id, data),
  deleteHabit: (id: string) => ipcRenderer.invoke('habit:delete', id),
  toggleHabit: (id: string, date: string) => ipcRenderer.invoke('habit:toggle', id, date),
  getHabitRecords: (habitId: string, month?: string) => ipcRenderer.invoke('habit:records', habitId, month),

  // Note operations
  getNotes: () => ipcRenderer.invoke('note:all'),
  createNote: (data: Partial<Note>) => ipcRenderer.invoke('note:create', data),
  updateNote: (id: string, data: Partial<Note>) => ipcRenderer.invoke('note:update', id, data),
  deleteNote: (id: string) => ipcRenderer.invoke('note:delete', id),

  // Pomodoro operations
  savePomodoro: (data: Partial<PomodoroRecord>) => ipcRenderer.invoke('pomodoro:save', data),
  getPomodoroStats: (range?: string) => ipcRenderer.invoke('pomodoro:stats', range),

  // Tag operations
  getTags: () => ipcRenderer.invoke('tag:all'),
  createTag: (data: Partial<Tag>) => ipcRenderer.invoke('tag:create', data),
  updateTag: (id: string, data: Partial<Tag>) => ipcRenderer.invoke('tag:update', id, data),
  deleteTag: (id: string) => ipcRenderer.invoke('tag:delete', id),

  // System operations
  showNotification: (options: NotificationOptions) => ipcRenderer.invoke('notification:show', options),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getUserDataPath: () => ipcRenderer.invoke('app:getPath', 'userData'),

  // Event listeners
  onReminder: (callback) => ipcRenderer.on('reminder:trigger', (_, data) => callback(data)),
  onDatabaseChange: (callback) => ipcRenderer.on('database:change', (_, data) => callback(data)),

  // Shortcut listeners
  onShortcut: (action: string, callback: () => void) => {
    ipcRenderer.on(action, () => callback())
  },

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Mini window
  openMiniWindow: () => ipcRenderer.invoke('mini-window:create')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.electronAPI = api
}