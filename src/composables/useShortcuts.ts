import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../stores/task.store'
import { useNoteStore } from '../stores/note.store'

export function useShortcuts() {
  const router = useRouter()
  const taskStore = useTaskStore()
  const noteStore = useNoteStore()

  // Shortcut handlers
  const handleNewTask = () => {
    taskStore.openTaskEditor()
  }

  const handleNewNote = () => {
    noteStore.openNoteEditor()
  }

  const handleSearch = () => {
    // Focus on search input if exists
    const searchInput = document.querySelector('.search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const handleSettings = () => {
    // TODO: Open settings
  }

  const handlePomodoro = () => {
    router.push('/pomodoro')
  }

  const switchView = (index: number) => {
    const routes = ['/today', '/calendar', '/quadrant', '/pomodoro', '/habits', '/notes']
    if (index >= 1 && index <= 6) {
      router.push(routes[index - 1])
    }
  }

  // IPC event listeners
  onMounted(() => {
    // Register shortcut listeners
    window.electronAPI.onShortcut?.('shortcut:new-task', handleNewTask)
    window.electronAPI.onShortcut?.('shortcut:new-note', handleNewNote)
    window.electronAPI.onShortcut?.('shortcut:search', handleSearch)
    window.electronAPI.onShortcut?.('shortcut:settings', handleSettings)
    window.electronAPI.onShortcut?.('shortcut:pomodoro', handlePomodoro)

    // View switching shortcuts
    for (let i = 1; i <= 6; i++) {
      const index = i
      window.electronAPI.onShortcut?.(`shortcut:switch-view:${index}`, () => switchView(index))
    }

    // Keyboard shortcuts (fallback for development)
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + N: New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      handleNewTask()
    }

    // Ctrl/Cmd + Shift + N: New note
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault()
      handleNewNote()
    }

    // Ctrl/Cmd + F: Search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      handleSearch()
    }

    // Ctrl/Cmd + Shift + P: Pomodoro
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault()
      handlePomodoro()
    }

    // Ctrl/Cmd + 1-6: Switch views
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
      e.preventDefault()
      switchView(parseInt(e.key))
    }
  }
}
