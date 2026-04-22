// Shared type definitions for repositories

export interface Task {
  id: string
  title: string
  description: string
  priority: number
  start_time: string | null
  end_time: string | null
  due_date: string | null
  repeat_rule: string | null
  list_id: string
  tags: string
  quadrant: number
  kanban_column: number
  completed: number
  completed_at: string | null
  sort_order: number
  remind_at: string | null
  remind_advance: number
  remind_persistent: number
  created_at: string
  updated_at: string
}

export interface TaskFilters {
  listId?: string
  dueDate?: string
  dueDateStart?: string
  dueDateEnd?: string
  completed?: boolean
  priority?: number
  priorityIn?: number[]
  quadrant?: number
  tagsInclude?: string[]
  search?: string
  list_id?: string
  kanbanColumn?: number
}

export interface List {
  id: string
  name: string
  icon: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  frequency: string
  target_days: string
  remind_at: string | null
  sort_order: number
  archived: number
  created_at: string
  updated_at: string
}

export interface HabitFilters {
  archived?: boolean
}

export interface HabitRecord {
  id: string
  habit_id: string
  date: string
  completed: number
  created_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: number
  sort_order: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface NoteFilters {
  search?: string
}

export interface PomodoroRecord {
  id: string
  task_id: string | null
  duration: number
  type: string
  started_at: string
  completed_at: string
}

export interface PomodoroStats {
  total_focus_minutes: number
  total_break_minutes: number
  daily_average: number
  streak_days: number
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Subtask {
  id: string
  parent_id: string
  title: string
  completed: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubtaskFilters {
  parentId?: string
}
