import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export async function initDatabase(): Promise<void> {
  // Ensure user data directory exists
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')
  const backupDir = join(userDataPath, 'backup')

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true })
  }

  const dbPath = join(dbDir, 'todolist.db')

  // Open database with WAL mode for better concurrency
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Create tables
  createTables()

  // Insert default data
  insertDefaultData()

  console.log(`Database initialized at ${dbPath}`)
}

function createTables(): void {
  const db = getDatabase()

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      due_date TEXT,
      repeat_rule TEXT,
      list_id TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      quadrant INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      sort_order REAL DEFAULT 0,
      remind_at TEXT,
      remind_advance INTEGER DEFAULT 0,
      remind_persistent INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    )
  `)

  // Lists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#10B981',
      icon TEXT DEFAULT 'folder',
      sort_order REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Habits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT 'check',
      frequency TEXT DEFAULT 'daily',
      target_days TEXT DEFAULT '[]',
      remind_at TEXT,
      sort_order REAL DEFAULT 0,
      archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Habit records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_records (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    )
  `)

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      color TEXT DEFAULT '#FFFFFF',
      pinned INTEGER DEFAULT 0,
      sort_order REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Pomodoro records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pomodoro_records (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      duration INTEGER NOT NULL,
      type TEXT DEFAULT 'focus',
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    )
  `)

  // Tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#10B981',
      created_at TEXT NOT NULL
    )
  `)

  // Create indexes for better performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)')
  db.exec(
    'CREATE INDEX IF NOT EXISTS idx_habit_records_habit_date ON habit_records(habit_id, date)'
  )
}

function insertDefaultData(): void {
  const db = getDatabase()

  // Check if inbox list already exists
  const inboxExists = db.prepare('SELECT 1 FROM lists WHERE id = ?').get('inbox')

  if (!inboxExists) {
    const now = new Date().toISOString()
    db.prepare(
      `
      INSERT INTO lists (id, name, color, icon, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('inbox', 'Inbox', '#10B981', 'inbox', 0, now, now)
    console.log('Default inbox list created')
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

// Backup database function
export function backupDatabase(): string {
  const userDataPath = app.getPath('userData')
  const backupDir = join(userDataPath, 'backup')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = join(backupDir, `todolist-backup-${timestamp}.db`)

  const mainDb = getDatabase()

  // Use backup API
  mainDb.backup(backupPath, {
    progress: ({ totalPages, remainingPages }: { totalPages: number; remainingPages: number }) => {
      const progress = (((totalPages - remainingPages) / totalPages) * 100).toFixed(1)
      console.log(`Backup progress: ${progress}%`)
      return 0
    },
  })

  console.log(`Database backed up to ${backupPath}`)

  // Clean up old backups (keep last 7)
  cleanupOldBackups()

  return backupPath
}

// Clean up old backup files, keeping the most recent 7
function cleanupOldBackups(): void {
  const userDataPath = app.getPath('userData')
  const backupDir = join(userDataPath, 'backup')

  if (!existsSync(backupDir)) return

  const files = readdirSync(backupDir)
    .filter((f) => f.startsWith('todolist-backup-') && f.endsWith('.db'))
    .map((f) => {
      const filePath = join(backupDir, f)
      return { name: f, path: filePath, time: statSync(filePath).mtime.getTime() }
    })
    .sort((a, b) => b.time - a.time)

  // Keep the 7 most recent backups
  const toDelete = files.slice(7)
  for (const file of toDelete) {
    unlinkSync(file.path)
    console.log(`Deleted old backup: ${file.name}`)
  }
}
