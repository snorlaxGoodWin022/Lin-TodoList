// Type definitions for Electron API exposed via preload script

import type { Task, TaskFilters } from '../../electron/database/repositories/task.repo'
import type { List } from '../../electron/database/repositories/list.repo'
import type { Habit, HabitFilters, HabitRecord } from '../../electron/database/repositories/habit.repo'
import type { Note, NoteFilters } from '../../electron/database/repositories/note.repo'
import type { PomodoroRecord, PomodoroStats } from '../../electron/database/repositories/pomodoro.repo'
import type { Tag } from '../../electron/database/repositories/tag.repo'

export interface ElectronAPI {
  // Task operations
  getTasks: (filters?: TaskFilters) => Promise<Task[]>
  createTask: (data: Partial<Task>) => Promise<Task>
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  toggleTaskCompletion: (id: string, completed: boolean) => Promise<boolean>

  // List operations
  getLists: () => Promise<List[]>
  createList: (data: Partial<List>) => Promise<List>
  updateList: (id: string, data: Partial<List>) => Promise<boolean>
  deleteList: (id: string) => Promise<boolean>

  // Habit operations
  getHabits: (filters?: HabitFilters) => Promise<Habit[]>
  createHabit: (data: Partial<Habit>) => Promise<Habit>
  updateHabit: (id: string, data: Partial<Habit>) => Promise<boolean>
  deleteHabit: (id: string) => Promise<boolean>
  toggleHabitRecord: (habitId: string, date: string) => Promise<boolean>
  getHabitRecords: (habitId: string, month?: string) => Promise<HabitRecord[]>

  // Note operations
  getNotes: (filters?: NoteFilters) => Promise<Note[]>
  createNote: (data: Partial<Note>) => Promise<Note>
  updateNote: (id: string, data: Partial<Note>) => Promise<boolean>
  deleteNote: (id: string) => Promise<boolean>

  // Pomodoro operations
  savePomodoro: (data: Partial<PomodoroRecord>) => Promise<PomodoroRecord>
  getPomodoroStats: (range?: string) => Promise<PomodoroStats>

  // Tag operations
  getTags: () => Promise<Tag[]>
  createTag: (data: Partial<Tag>) => Promise<Tag>
  updateTag: (id: string, data: Partial<Tag>) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>

  // System operations
  showNotification: (options: { title: string; body: string }) => Promise<void>
  getAppVersion: () => Promise<string>
  getUserDataPath: () => Promise<string>

  // Event listeners
  onReminder: (callback: (data: any) => void) => void
  onDatabaseChange: (callback: (data: any) => void) => void
  onShortcut: (action: string, callback: () => void) => void

  // Window controls
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void

  // Mini window
  openMiniWindow: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}