// Type definitions for Electron API exposed via preload script

import type { Task, TaskFilters } from '../../electron/database/repositories/task.repo'
import type { List, ListGroup } from '../../electron/database/repositories/list.repo'
import type {
  Habit,
  HabitFilters,
  HabitRecord,
} from '../../electron/database/repositories/habit.repo'
import type { Note, NoteFilters } from '../../electron/database/repositories/note.repo'
import type {
  PomodoroRecord,
  PomodoroStats,
} from '../../electron/database/repositories/pomodoro.repo'
import type { Tag } from '../../electron/database/repositories/tag.repo'
import type { FilterPreset } from '../../electron/database/repositories/filterPreset.repo'
import type { Subtask } from '../../electron/database/repositories/subtask.repo'

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

  // List group operations
  getListGroups: () => Promise<ListGroup[]>
  createListGroup: (data: Partial<ListGroup>) => Promise<ListGroup>
  updateListGroup: (id: string, data: Partial<ListGroup>) => Promise<boolean>
  deleteListGroup: (id: string) => Promise<boolean>

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

  // Filter preset operations
  getFilterPresets: () => Promise<FilterPreset[]>
  createFilterPreset: (data: Partial<FilterPreset>) => Promise<FilterPreset>
  updateFilterPreset: (id: string, data: Partial<FilterPreset>) => Promise<boolean>
  deleteFilterPreset: (id: string) => Promise<boolean>

  // Subtask operations
  getSubtasks: (filters?: { parentId?: string }) => Promise<Subtask[]>
  createSubtask: (data: Partial<Subtask>) => Promise<Subtask>
  updateSubtask: (id: string, data: Partial<Subtask>) => Promise<boolean>
  deleteSubtask: (id: string) => Promise<boolean>

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
