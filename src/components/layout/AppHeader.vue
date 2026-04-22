<template>
  <header class="app-header">
    <div class="header-left">
      <button class="menu-btn" @click="toggleSidebar">
        <span class="menu-icon">☰</span>
      </button>
      <div class="header-title">
        <h1>{{ currentTitle }}</h1>
      </div>
    </div>

    <div class="header-center">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索任务、便签..."
          @keyup.enter="performSearch"
        />
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">×</button>
      </div>
    </div>

    <div class="header-right">
      <button class="header-action" @click="quickAddTask">
        <span class="action-icon">+</span>
        <span class="action-label">添加任务</span>
      </button>
      <button class="header-action" @click="toggleNotifications">
        <span class="action-icon">🔔</span>
        <span v-if="unreadNotifications" class="action-badge">{{ unreadNotifications }}</span>
      </button>
      <button class="header-action" @click="openPomodoro">
        <span class="action-icon">🍅</span>
      </button>
      <div class="user-avatar">
        <img v-if="userAvatar" :src="userAvatar" alt="用户头像" class="avatar-image" />
        <div v-else class="avatar-placeholder">
          {{ userInitials }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/app.store'
import { useTaskStore } from '../../stores/task.store'

const router = useRouter()
const appStore = useAppStore()
const taskStore = useTaskStore()

const searchQuery = ref('')
const unreadNotifications = ref(3)

const currentTitle = computed(() => {
  const route = appStore.currentView
  const titles: Record<string, string> = {
    today: '今天',
    calendar: '日历',
    list: '清单',
    pomodoro: '番茄钟',
    note: '便签',
    quadrant: '四象限',
    habit: '习惯',
  }
  return titles[route] || 'Lin TodoList'
})

const userAvatar = ref('')
const userInitials = computed(() => 'U')

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    taskStore.searchTasks(searchQuery.value)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  taskStore.clearSearch()
}

const quickAddTask = () => {
  taskStore.openTaskEditor()
}

const toggleNotifications = () => {
  // TODO: Toggle notifications panel
}

const openPomodoro = () => {
  router.push('/pomodoro')
}
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  flex-shrink: 0;
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.menu-btn:hover {
  background-color: var(--color-primary-bg);
}

.menu-icon {
  font-size: var(--font-size-lg);
  display: block;
  width: 24px;
  height: 24px;
}

.header-title h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.search-container {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm)
    calc(var(--spacing-md) * 2 + var(--spacing-sm));
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.clear-search {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
}

.clear-search:hover {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}

.header-action {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.header-action:hover {
  background-color: var(--color-primary-bg);
}

.action-icon {
  font-size: var(--font-size-lg);
  display: block;
  width: 24px;
  height: 24px;
}

.action-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.action-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--color-priority-high);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--color-border);
  transition: border-color var(--transition-fast);
}

.user-avatar:hover {
  border-color: var(--color-primary);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}
</style>
