<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">✓</span>
        <span class="logo-text">Lin TodoList</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="nav-section-title">功能</h3>
        <ul class="nav-list">
          <li
            v-for="item in mainNavItems"
            :key="item.id"
            :class="['nav-item', { active: activeNav === item.id }]"
            @click="activeNav = item.id"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <h3 class="nav-section-title">清单</h3>
        <ul class="nav-list">
          <li
            v-for="list in lists"
            :key="list.id"
            :class="['nav-item', { active: activeList === list.id }]"
            @click="activeList = list.id"
          >
            <span class="list-color" :style="{ backgroundColor: list.color }"></span>
            <span class="nav-icon">{{ list.icon }}</span>
            <span class="nav-label">{{ list.name }}</span>
            <span v-if="list.count" class="nav-badge">{{ list.count }}</span>
          </li>
        </ul>
        <button class="add-list-btn">
          <span class="add-icon">+</span>
          <span>添加清单</span>
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-action" @click="toggleTheme">
        <span class="action-icon">{{ themeIcon }}</span>
        <span class="action-label">{{ themeLabel }}</span>
      </button>
      <button class="sidebar-action" @click="openSettings">
        <span class="action-icon">⚙️</span>
        <span class="action-label">设置</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/app.store'
import { useListStore } from '../../stores/list.store'

const appStore = useAppStore()
const listStore = useListStore()

const activeNav = ref('today')
const activeList = ref('inbox')

const mainNavItems = [
  { id: 'today', label: '今天', icon: '📋', badge: 5 },
  { id: 'calendar', label: '日历', icon: '📅' },
  { id: 'list', label: '清单', icon: '✅' },
  { id: 'pomodoro', label: '番茄钟', icon: '🍅' },
  { id: 'note', label: '便签', icon: '📝' },
  { id: 'quadrant', label: '四象限', icon: '📊' },
  { id: 'habit', label: '习惯', icon: '🔖' }
]

const lists = computed(() => listStore.lists)

const themeIcon = computed(() => appStore.theme === 'dark' ? '🌙' : '☀️')
const themeLabel = computed(() => appStore.theme === 'dark' ? '深色模式' : '浅色模式')

const toggleTheme = () => {
  appStore.toggleTheme()
}

const openSettings = () => {
  // TODO: Open settings
}
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background-color: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.logo-icon {
  width: 28px;
  height: 28px;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
}

.logo-text {
  color: var(--color-text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--spacing-xl);
}

.nav-section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.nav-list {
  list-style: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  position: relative;
  margin-bottom: 2px;
}

.nav-item:hover {
  background-color: var(--color-primary-bg);
}

.nav-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}

.nav-icon {
  font-size: var(--font-size-lg);
  width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
  font-size: var(--font-size-sm);
}

.nav-badge {
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.list-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.add-list-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--spacing-sm);
}

.add-list-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-bg);
}

.add-icon {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.sidebar-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-lg);
}

.sidebar-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-bottom: var(--spacing-xs);
}

.sidebar-action:hover {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.action-icon {
  font-size: var(--font-size-lg);
  width: 24px;
  text-align: center;
}

.action-label {
  flex: 1;
  text-align: left;
  font-size: var(--font-size-sm);
}
</style>