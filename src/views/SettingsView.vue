<template>
  <div class="settings-view">
    <div class="view-header">
      <h1 class="view-title">设置</h1>
    </div>

    <div class="settings-content">
      <!-- Appearance Section -->
      <div class="settings-section">
        <h2 class="section-title">外观</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">主题</span>
            <span class="setting-description">选择应用的外观主题</span>
          </div>
          <div class="setting-control">
            <select v-model="theme" class="form-select" @change="updateTheme">
              <option value="light">浅色模式</option>
              <option value="dark">深色模式</option>
              <option value="system">跟随系统</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pomodoro Section -->
      <div class="settings-section">
        <h2 class="section-title">番茄钟</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">专注时长</span>
            <span class="setting-description">专注工作的时间（分钟）</span>
          </div>
          <div class="setting-control">
            <input
              v-model.number="pomodoroSettings.focusDuration"
              type="number"
              min="1"
              max="60"
              class="form-input"
              @change="updatePomodoroSettings"
            />
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">休息时长</span>
            <span class="setting-description">休息时间（分钟）</span>
          </div>
          <div class="setting-control">
            <input
              v-model.number="pomodoroSettings.breakDuration"
              type="number"
              min="1"
              max="30"
              class="form-input"
              @change="updatePomodoroSettings"
            />
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">长休息时长</span>
            <span class="setting-description">长休息时间（分钟）</span>
          </div>
          <div class="setting-control">
            <input
              v-model.number="pomodoroSettings.longBreakDuration"
              type="number"
              min="1"
              max="60"
              class="form-input"
              @change="updatePomodoroSettings"
            />
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">自动开始下一个</span>
            <span class="setting-description">番茄钟结束后自动开始下一个</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input
                v-model="pomodoroSettings.autoStart"
                type="checkbox"
                @change="updatePomodoroSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Notification Section -->
      <div class="settings-section">
        <h2 class="section-title">通知</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">启用通知</span>
            <span class="setting-description">收到提醒时显示系统通知</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input v-model="notificationsEnabled" type="checkbox" @change="updateNotifications" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">提前提醒</span>
            <span class="setting-description">任务到期前提醒（分钟）</span>
          </div>
          <div class="setting-control">
            <input
              v-model.number="reminderAdvance"
              type="number"
              min="0"
              max="1440"
              class="form-input"
              @change="updateReminderSettings"
            />
          </div>
        </div>
      </div>

      <!-- Data Section -->
      <div class="settings-section">
        <h2 class="section-title">数据</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">数据位置</span>
            <span class="setting-description">{{ userDataPath }}</span>
          </div>
          <div class="setting-control">
            <button class="btn btn-secondary" @click="openDataFolder">打开文件夹</button>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">备份数据</span>
            <span class="setting-description">手动创建数据库备份</span>
          </div>
          <div class="setting-control">
            <button class="btn btn-secondary" @click="backupData">立即备份</button>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">自动备份</span>
            <span class="setting-description">定期自动备份数据</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input v-model="autoBackup" type="checkbox" @change="updateBackupSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Tags Section -->
      <div class="settings-section">
        <h2 class="section-title">标签管理</h2>
        <div class="tags-list">
          <div v-for="tag in tags" :key="tag.id" class="tag-item">
            <div class="tag-info">
              <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
            <div class="tag-actions">
              <button class="btn btn-icon" @click="editTag(tag)">✏️</button>
              <button class="btn btn-icon" @click="deleteTag(tag.id)">🗑️</button>
            </div>
          </div>
          <div v-if="tags.length === 0" class="empty-tags">暂无标签</div>
        </div>
        <button class="btn btn-primary" @click="showTagEditor = true">添加标签</button>
      </div>

      <!-- About Section -->
      <div class="settings-section">
        <h2 class="section-title">关于</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">版本</span>
            <span class="setting-description">{{ appVersion }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tag Editor Modal -->
    <div v-if="showTagEditor" class="modal-overlay" @click="closeTagEditor">
      <div class="modal-content" @click.stop>
        <h3>{{ editingTagId ? '编辑标签' : '新建标签' }}</h3>
        <div class="form-group">
          <label>标签名称</label>
          <input v-model="tagForm.name" type="text" class="form-input" placeholder="输入标签名称" />
        </div>
        <div class="form-group">
          <label>颜色</label>
          <div class="color-picker">
            <button
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ active: tagForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="tagForm.color = color"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeTagEditor">取消</button>
          <button class="btn btn-primary" @click="saveTag">保存</button>
        </div>
      </div>
    </div>

    <!-- Batch Edit Modal -->
    <div v-if="showBatchEdit" class="modal-overlay" @click="closeBatchEdit">
      <div class="modal-content" @click.stop>
        <h3>批量编辑任务</h3>
        <div class="form-group">
          <label>批量操作</label>
          <select v-model="batchAction" class="form-select">
            <option value="priority">修改优先级</option>
            <option value="list">移动到清单</option>
            <option value="delete">删除任务</option>
          </select>
        </div>

        <div v-if="batchAction === 'priority'" class="form-group">
          <label>选择优先级</label>
          <div class="priority-options">
            <button
              v-for="p in priorityOptions"
              :key="p.value"
              class="priority-btn"
              :class="[`priority-${p.value}`, { active: batchPriority === p.value }]"
              @click="batchPriority = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div v-if="batchAction === 'list'" class="form-group">
          <label>选择清单</label>
          <select v-model="batchListId" class="form-select">
            <option value="">选择清单...</option>
            <option v-for="list in lists" :key="list.id" :value="list.id">
              {{ list.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeBatchEdit">取消</button>
          <button class="btn btn-primary" @click="applyBatchEdit">应用</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app.store'
import { useTag } from '../composables/useTag'
import { useListStore } from '../stores/list.store'
import type { Tag } from '../types/repositories'

const appStore = useAppStore()
const tag = useTag()
const listStore = useListStore()

// Theme settings
const theme = ref(appStore.theme)
const userDataPath = ref('')
const appVersion = ref('')

// Pomodoro settings
const pomodoroSettings = ref({
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  autoStart: false,
})

// Notification settings
const notificationsEnabled = ref(true)
const reminderAdvance = ref(10)
const autoBackup = ref(true)

// Tags
const tags = computed(() => tag.tags.value)
const showTagEditor = ref(false)
const editingTagId = ref<string | null>(null)
const tagForm = ref({ name: '', color: '#10B981' })
const colorOptions = [
  '#10B981',
  '#EF4444',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
]

// Batch edit
const showBatchEdit = ref(false)
const batchAction = ref('priority')
const batchPriority = ref(0)
const batchListId = ref('')
const lists = computed(() => listStore.lists)
const priorityOptions = [
  { value: 0, label: '无' },
  { value: 1, label: '低' },
  { value: 2, label: '中' },
  { value: 3, label: '高' },
]

// Actions
const updateTheme = () => {
  appStore.setTheme(theme.value as 'light' | 'dark')
}

const updatePomodoroSettings = () => {
  localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings.value))
}

const updateNotifications = () => {
  localStorage.setItem('notificationsEnabled', String(notificationsEnabled.value))
}

const updateReminderSettings = () => {
  localStorage.setItem('reminderAdvance', String(reminderAdvance.value))
}

const updateBackupSettings = () => {
  localStorage.setItem('autoBackup', String(autoBackup.value))
}

const openDataFolder = async () => {
  try {
    const path = await window.electronAPI.getUserDataPath()
    // On Windows, use explorer to open the folder
    const { shell } = await import('electron')
    shell.openPath(path)
  } catch (err) {
    console.error('Error opening data folder:', err)
  }
}

const backupData = async () => {
  try {
    alert('备份功能开发中')
  } catch (err) {
    console.error('Error backing up data:', err)
    alert('备份失败')
  }
}

// Tag management
const editTag = (t: Tag) => {
  editingTagId.value = t.id
  tagForm.value = { name: t.name, color: t.color }
  showTagEditor.value = true
}

const closeTagEditor = () => {
  showTagEditor.value = false
  editingTagId.value = null
  tagForm.value = { name: '', color: '#10B981' }
}

const saveTag = async () => {
  if (!tagForm.value.name.trim()) return

  try {
    if (editingTagId.value) {
      await tag.updateTag(editingTagId.value, {
        name: tagForm.value.name,
        color: tagForm.value.color,
      })
    } else {
      await tag.createTag({
        name: tagForm.value.name,
        color: tagForm.value.color,
      })
    }
    closeTagEditor()
  } catch (err) {
    console.error('Error saving tag:', err)
  }
}

const deleteTag = async (id: string) => {
  if (!confirm('确定要删除这个标签吗？')) return

  try {
    await tag.deleteTag(id)
  } catch (err) {
    console.error('Error deleting tag:', err)
  }
}

// Batch edit (exposed for use from other components)
const openBatchEdit = () => {
  showBatchEdit.value = true
}

const closeBatchEdit = () => {
  showBatchEdit.value = false
  batchAction.value = 'priority'
  batchPriority.value = 0
  batchListId.value = ''
}

const applyBatchEdit = async () => {
  // This would be connected to the task store's batch operations
  closeBatchEdit()
}

// Load settings
onMounted(async () => {
  tag.init()

  // Load stored settings
  const stored = localStorage.getItem('pomodoroSettings')
  if (stored) {
    pomodoroSettings.value = JSON.parse(stored)
  }

  const notifStored = localStorage.getItem('notificationsEnabled')
  if (notifStored !== null) {
    notificationsEnabled.value = notifStored === 'true'
  }

  const reminderStored = localStorage.getItem('reminderAdvance')
  if (reminderStored) {
    reminderAdvance.value = parseInt(reminderStored, 10)
  }

  const backupStored = localStorage.getItem('autoBackup')
  if (backupStored !== null) {
    autoBackup.value = backupStored === 'true'
  }

  try {
    userDataPath.value = await window.electronAPI.getUserDataPath()
    appVersion.value = await window.electronAPI.getAppVersion()
  } catch (err) {
    console.error('Error loading settings:', err)
  }
})

// Expose for external access
defineExpose({
  openBatchEdit,
})
</script>

<style scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
}

.view-header {
  margin-bottom: var(--spacing-xl);
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.settings-content {
  flex: 1;
  overflow: auto;
}

.settings-section {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.setting-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.setting-control {
  flex-shrink: 0;
}

/* Toggle switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Tags */
.tags-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
}

.tag-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.tag-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
}

.tag-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.tag-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.empty-tags {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Color picker */
.color-picker {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--color-text-primary);
}

/* Priority options */
.priority-options {
  display: flex;
  gap: var(--spacing-sm);
}

.priority-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.priority-btn.priority-0 {
  color: var(--color-priority-none);
}
.priority-btn.priority-1 {
  color: var(--color-priority-low);
}
.priority-btn.priority-2 {
  color: var(--color-priority-medium);
}
.priority-btn.priority-3 {
  color: var(--color-priority-high);
}

.priority-btn.active {
  border-color: currentColor;
  background: currentColor;
  color: white;
}

/* Modal */
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
  width: 400px;
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

.form-input,
.form-select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

/* Buttons */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-border-hover);
}

.btn-icon {
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
}

.btn-icon:hover {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}
</style>
