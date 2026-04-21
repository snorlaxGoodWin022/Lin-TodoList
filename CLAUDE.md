# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Currently in design phase. The repository contains design specifications (`docs/superpowers/specs/2026-04-20-lin-todolist-design.md`), a UI design system (`DESIGN.md`), and a visual preview (`design-preview.html`). Code implementation is pending.

## Project Overview

Lin TodoList is a desktop task management application inspired by TickTick, built with Vue 3 + Electron + SQLite. It aims to provide premium features (full calendar view, task time ranges, etc.) for free, along with Pomodoro timer, notes, Eisenhower matrix, and habit tracking. Data is stored locally using SQLite.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript (Composition API, `<script setup>`)
- **Build Tool**: Vite + electron-builder
- **Package Manager**: pnpm
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Database**: better-sqlite3 (embedded SQLite with synchronous API)
- **UI Components**: Custom components (no third‑party UI library)
- **Styling**: CSS variables + Scoped CSS, green‑based theme with dark mode
- **Icons**: @iconify/vue
- **Rich Text**: Custom lightweight editor based on contenteditable

## Development Commands

The project uses pnpm as package manager. Expected scripts in `package.json` (to be created during project initialization):

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Vite dev server for renderer process
pnpm electron:dev     # Start Electron with hot‑reload (concurrently runs Vite + Electron)
pnpm build            # Build renderer process
pnpm electron:build   # Build Electron app for current platform
pnpm type-check       # Run TypeScript type checking
pnpm lint             # Run ESLint
```

## Directory Structure

Planned structure (to be created during implementation):

```
Lin-TodoList/
├── electron/                     # Electron main process
│   ├── main.ts                   # Main entry (window management, lifecycle)
│   ├── preload.ts                # Preload script (IPC bridge)
│   ├── database/
│   │   ├── init.ts               # DB initialization, table creation, migrations
│   │   ├── repositories/         # Data access layer (task, list, habit, note, pomodoro, tag)
│   │   └── migrations/           # Database migration scripts
│   └── services/                 # System services (notification, shortcut, tray)
├── src/                          # Vue 3 renderer process
│   ├── assets/                   # Styles, sounds
│   ├── components/               # Vue components (layout, common, task, calendar, quadrant, pomodoro, habit, note)
│   ├── composables/              # Composition functions (useTask, useCalendar, usePomodoro, etc.)
│   ├── stores/                   # Pinia stores (task, list, calendar, pomodoro, habit, note, app)
│   ├── views/                    # Page‑level components (TodayView, CalendarPage, ListView, etc.)
│   ├── router/                   # Vue Router configuration
│   ├── types/                    # Global TypeScript types
│   └── utils/                    # Utility functions (date, IPC, smart‑parse)
├── package.json
├── electron-builder.yml
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Key Architectural Points

### IPC Communication

All database operations are performed in the main process. The renderer communicates via `window.electronAPI` exposed through `preload.ts`. Typical IPC methods include:

```typescript
// task‑related
window.electronAPI.getTasks(filters)
window.electronAPI.createTask(data)
window.electronAPI.updateTask(id, data)
window.electronAPI.deleteTask(id)

// list, habit, note, pomodoro, tag operations follow the same pattern
```

### Database Schema

SQLite tables defined in `electron/database/init.ts`:

- `tasks` – tasks with title, description, priority, start/end time, due date, repeat rules, list_id, tags, quadrant, etc.
- `lists` – task lists with name, color, icon.
- `habits` & `habit_records` – habit definitions and daily completion records.
- `notes` – rich‑text notes with color and pinning.
- `pomodoro_records` – focus/break sessions.
- `tags` – user‑defined tags.

Default data includes an "Inbox" list (id: 'inbox', icon: 'inbox').

### State Management

Pinia stores in `src/stores/` manage local UI state and cache data fetched via IPC. Stores are split by domain: `task.store.ts`, `list.store.ts`, `calendar.store.ts`, `pomodoro.store.ts`, `habit.store.ts`, `note.store.ts`, and `app.store.ts` (global theme, sidebar state).

### UI Design System

Colors are defined as CSS variables in `src/assets/styles/variables.css`. The primary color is emerald green (`#10B981`). Dark theme toggled via `data-theme="dark"`.

Priority colors:
- High: `#EF4444` (red)
- Medium: `#F59E0B` (amber)
- Low: `#3B82F6` (blue)
- None: `#D1D5DB` (gray)

All cards have white background, 1px border, `shadow-sm` on hover. Buttons are categorized as primary (green fill), secondary (gray border), and text (no background).

## Development Notes

- **Database location**: SQLite file is stored in the user's app data directory (Electron `app.getPath('userData')`).
- **Backups**: Automatic backups to a `backup` folder (WAL mode enabled).
- **Window state**: Previous window size and position are remembered.
- **Tray behavior**: Closing the window minimizes to system tray; explicit quit is required via tray menu or `Ctrl+Q`.
- **Global shortcuts**: Defined in `electron/services/shortcut.ts` (e.g., `Ctrl+N` for new task, `Ctrl+Shift+P` for pomodoro).
- **Reminders**: Main‑process timer checks every minute for due reminders; notifications use Electron Notification API.

## Module Overview

1. **Today View** – tasks due today + overdue tasks, grouped by priority.
2. **Calendar** – month, week, day, and multi‑day views with time‑block visualization.
3. **Lists** – user‑defined lists with color/icon, drag‑and‑drop sorting.
4. **Eisenhower Matrix (Quadrant)** – 2×2 grid categorizing tasks by importance/urgency.
5. **Pomodoro Timer** – circular countdown, white‑noise selection, mini‑floating window.
6. **Habit Tracker** – habit cards, weekly progress bars, monthly heatmap.
7. **Notes** – sticky‑note waterfall layout, rich‑text editor, color tagging.

## Non‑functional Goals

- Cold start < 2 seconds.
- Data safety: WAL mode + periodic backups.
- Minimal memory footprint.
- Offline‑first; no cloud dependency.

## Related Files

- `DESIGN.md` – Complete UI design system with color tokens, typography, components, and layout specifications
- `design-preview.html` – Visual preview of the design system (open in browser)
- `docs/superpowers/specs/2026-04-20-lin-todolist-design.md` – Original design specification with detailed feature descriptions and database schema

## Project Initialization

To begin implementation:
1. Create `package.json` with the expected pnpm scripts
2. Set up Vite + Electron + TypeScript configuration
3. Create the directory structure outlined above
4. Implement the IPC bridge between main and renderer processes
5. Build the SQLite database layer with migrations
6. Develop Vue components following the design system in `DESIGN.md`