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
            :class="['nav-item', { active: route.path === item.path }]"
            @click="navigateTo(item.path)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div class="nav-section-header">
          <h3 class="nav-section-title">清单</h3>
          <button class="add-group-btn" @click="addNewGroup" title="新建分组">
            <span>+</span>
          </button>
        </div>

        <!-- Grouped lists -->
        <div v-for="group in listStore.groups" :key="group.id" class="list-group">
          <div
            class="group-header"
            :class="{ expanded: expandedGroups.has(group.id) }"
            @click="toggleGroup(group.id)"
          >
            <span class="group-toggle">{{ expandedGroups.has(group.id) ? '▼' : '▶' }}</span>
            <span class="group-color" :style="{ backgroundColor: group.color }"></span>
            <span class="group-name">{{ group.name }}</span>
            <button class="group-menu-btn" @click.stop="openGroupEditor(group.id)">⋯</button>
          </div>
          <ul v-show="expandedGroups.has(group.id)" class="nav-list group-lists">
            <li
              v-for="list in getListsByGroup(group.id)"
              :key="list.id"
              :class="['nav-item', { active: route.path === `/lists/${list.id}` }]"
              @click="navigateToList(list.id)"
            >
              <span class="list-color" :style="{ backgroundColor: list.color }"></span>
              <span class="nav-icon">{{ list.icon }}</span>
              <span class="nav-label">{{ list.name }}</span>
            </li>
          </ul>
        </div>

        <!-- Ungrouped lists -->
        <ul class="nav-list">
          <li
            v-for="list in ungroupedLists"
            :key="list.id"
            :class="['nav-item', { active: route.path === `/lists/${list.id}` }]"
            @click="navigateToList(list.id)"
          >
            <span class="list-color" :style="{ backgroundColor: list.color }"></span>
            <span class="nav-icon">{{ list.icon }}</span>
            <span class="nav-label">{{ list.name }}</span>
          </li>
        </ul>
        <button class="add-list-btn" @click="addNewList">
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

    <!-- Group Editor Modal -->
    <div v-if="showGroupEditor" class="modal-overlay" @click="closeGroupEditor">
      <div class="modal-content" @click.stop>
        <h3>{{ editingGroupId ? '编辑分组' : '新建分组' }}</h3>
        <div class="form-group">
          <label>分组名称</label>
          <input v-model="groupForm.name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>颜色</label>
          <input v-model="groupForm.color" type="color" class="form-color" />
        </div>
        <div class="modal-actions">
          <button v-if="editingGroupId" class="btn btn-danger" @click="deleteCurrentGroup">
            删除
          </button>
          <button class="btn btn-secondary" @click="closeGroupEditor">取消</button>
          <button class="btn btn-primary" @click="saveGroup">保存</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../../stores/app.store'
import { useListStore } from '../../stores/list.store'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const listStore = useListStore()

const mainNavItems = [
  { id: 'today', label: '今天', icon: '📋', path: '/today' },
  { id: 'calendar', label: '日历', icon: '📅', path: '/calendar' },
  { id: 'quadrant', label: '四象限', icon: '📊', path: '/quadrant' },
  { id: 'kanban', label: '看板', icon: '📋', path: '/kanban' },
  { id: 'dashboard', label: '统计', icon: '📈', path: '/dashboard' },
  { id: 'pomodoro', label: '番茄钟', icon: '🍅', path: '/pomodoro' },
  { id: 'habit', label: '习惯', icon: '🔖', path: '/habits' },
  { id: 'note', label: '便签', icon: '📝', path: '/notes' },
]

// Group expand state
const expandedGroups = ref<Set<string>>(new Set())

// Group editor state
const showGroupEditor = ref(false)
const editingGroupId = ref<string | null>(null)
const groupForm = ref({ name: '', color: '#10B981' })

// Computed for ungrouped lists
const ungroupedLists = computed(() => {
  return listStore.lists.filter((l) => !l.group_id)
})

const getListsByGroup = (groupId: string) => {
  return listStore.lists.filter((l) => l.group_id === groupId)
}

const lists = computed(() => listStore.lists)

const themeIcon = computed(() => (appStore.theme === 'dark' ? '🌙' : '☀️'))
const themeLabel = computed(() => (appStore.theme === 'dark' ? '深色模式' : '浅色模式'))

const navigateTo = (path: string) => {
  router.push(path)
}

const navigateToList = (listId: string) => {
  router.push(`/lists/${listId}`)
}

const toggleTheme = () => {
  appStore.toggleTheme()
}

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

const addNewList = () => {
  listStore.openListEditor()
}

const addNewGroup = () => {
  editingGroupId.value = null
  groupForm.value = { name: '', color: '#10B981' }
  showGroupEditor.value = true
}

const openGroupEditor = (groupId: string) => {
  const group = listStore.getGroupById(groupId)
  if (group) {
    editingGroupId.value = groupId
    groupForm.value = { name: group.name, color: group.color }
    showGroupEditor.value = true
  }
}

const closeGroupEditor = () => {
  showGroupEditor.value = false
  editingGroupId.value = null
}

const saveGroup = async () => {
  if (!groupForm.value.name.trim()) return

  try {
    if (editingGroupId.value) {
      await listStore.updateGroup(editingGroupId.value, {
        name: groupForm.value.name,
        color: groupForm.value.color,
      })
    } else {
      await listStore.createGroup({
        name: groupForm.value.name,
        color: groupForm.value.color,
      })
    }
    closeGroupEditor()
  } catch (err) {
    console.error('Error saving group:', err)
  }
}

const deleteCurrentGroup = async () => {
  if (!editingGroupId.value) return
  if (!confirm('确定要删除这个分组吗？清单不会被删除。')) return

  try {
    await listStore.deleteGroup(editingGroupId.value)
    closeGroupEditor()
  } catch (err) {
    console.error('Error deleting group:', err)
  }
}

const openSettings = () => {
  router.push('/settings')
}

onMounted(() => {
  listStore.init()
  // Expand all groups by default
  listStore.groups.forEach((g) => expandedGroups.value.add(g.id))
})
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

/* List groups */
.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.add-group-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.add-group-btn:hover {
  background: var(--color-primary);
  color: white;
}

.list-group {
  margin-bottom: var(--spacing-xs);
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.group-header:hover {
  background-color: var(--color-primary-bg);
}

.group-toggle {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  width: 12px;
}

.group-color {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.group-name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.group-menu-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-sm);
  padding: 0 var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.group-header:hover .group-menu-btn {
  opacity: 1;
}

.group-lists {
  padding-left: var(--spacing-lg);
}

/* Group editor modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.modal-content h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.form-input {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.form-color {
  width: 100%;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.btn-secondary {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface);
  border-color: var(--color-border-hover);
}

.btn-danger {
  background: var(--color-priority-high);
  color: white;
  border: none;
  margin-right: auto;
}

.btn-danger:hover {
  background: var(--color-priority-high);
}
</style>
