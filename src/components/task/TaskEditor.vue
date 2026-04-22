<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '编辑任务' : '新建任务' }}</h2>
          <button class="close-btn" @click="close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <input
              ref="titleInput"
              v-model="form.title"
              type="text"
              class="form-input title-input"
              placeholder="任务标题"
            />
          </div>

          <div class="form-group">
            <textarea
              v-model="form.description"
              class="form-input description-input"
              placeholder="添加描述..."
              rows="3"
            ></textarea>
          </div>

          <!-- Icon bar for quick actions -->
          <div class="quick-actions">
            <div class="action-item" title="优先级" @click="showPriorityMenu = !showPriorityMenu">
              <span class="action-icon" :class="priorityClass">
                {{ priorityIcon }}
              </span>
              <span
                v-if="form.priority > 0"
                class="action-badge-dot"
                :class="priorityDotClass"
              ></span>
              <PriorityMenu
                v-if="showPriorityMenu"
                :value="form.priority"
                @select="selectPriority"
                @close="showPriorityMenu = false"
              />
            </div>

            <div class="action-item" title="清单" @click="showListMenu = !showListMenu">
              <span class="action-icon list-icon">{{ listIcon }}</span>
              <span class="action-label">{{ currentListName }}</span>
              <ListMenu
                v-if="showListMenu"
                :value="form.list_id"
                @select="selectList"
                @close="showListMenu = false"
              />
            </div>

            <div class="action-item" title="截止日期" @click="showDateMenu = !showDateMenu">
              <span class="action-icon">📅</span>
              <span v-if="form.due_date" class="action-label">{{
                formatDateShort(form.due_date)
              }}</span>
              <DateMenu
                v-if="showDateMenu"
                :value="form.due_date"
                @select="selectDate"
                @close="showDateMenu = false"
              />
            </div>

            <div class="action-item" title="时间" @click="showTimeMenu = !showTimeMenu">
              <span class="action-icon">⏰</span>
              <span v-if="form.start_time || form.end_time" class="action-label">
                {{ formatTimeRange() }}
              </span>
              <TimeMenu
                v-if="showTimeMenu"
                :start-time="form.start_time"
                :end-time="form.end_time"
                @select="selectTime"
                @close="showTimeMenu = false"
              />
            </div>

            <div class="action-item" title="四象限" @click="showQuadrantMenu = !showQuadrantMenu">
              <span class="action-icon quadrant-icon" :class="'quadrant-' + form.quadrant">
                {{ quadrantIcon }}
              </span>
              <QuadrantMenu
                v-if="showQuadrantMenu"
                :value="form.quadrant"
                @select="selectQuadrant"
                @close="showQuadrantMenu = false"
              />
            </div>

            <div class="action-item" title="重复" @click="showRepeatMenu = !showRepeatMenu">
              <span class="action-icon">🔁</span>
              <span v-if="form.repeat_rule" class="action-label">{{ repeatLabel }}</span>
              <RepeatMenu
                v-if="showRepeatMenu"
                :value="form.repeat_rule"
                @select="selectRepeat"
                @close="showRepeatMenu = false"
              />
            </div>

            <div class="action-item" title="提醒" @click="showRemindMenu = !showRemindMenu">
              <span class="action-icon">🔔</span>
              <RemindMenu
                v-if="showRemindMenu"
                :value="form.remind_at"
                @select="selectRemind"
                @close="showRemindMenu = false"
              />
            </div>
          </div>

          <SubtaskList v-if="form.id" :parent-id="form.id" />
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" :disabled="!form.title.trim()" @click="save">
            {{ isEditing ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '../../stores/task.store'
import { useListStore } from '../../stores/list.store'
import SubtaskList from './SubtaskList.vue'
import PriorityMenu from './menus/PriorityMenu.vue'
import ListMenu from './menus/ListMenu.vue'
import DateMenu from './menus/DateMenu.vue'
import TimeMenu from './menus/TimeMenu.vue'
import QuadrantMenu from './menus/QuadrantMenu.vue'
import RepeatMenu from './menus/RepeatMenu.vue'
import RemindMenu from './menus/RemindMenu.vue'
import { parseTaskInput } from '../../utils/smartParse'
import type { Task } from '../../types/repositories'

const taskStore = useTaskStore()
const listStore = useListStore()

const visible = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

// Menu visibility states
const showPriorityMenu = ref(false)
const showListMenu = ref(false)
const showDateMenu = ref(false)
const showTimeMenu = ref(false)
const showQuadrantMenu = ref(false)
const showRepeatMenu = ref(false)
const showRemindMenu = ref(false)

const form = reactive({
  id: '',
  title: '',
  description: '',
  priority: 0 as number,
  list_id: 'inbox',
  due_date: '',
  start_time: '',
  end_time: '',
  remind_at: '',
  quadrant: 0 as number,
  repeat_rule: '',
  tags: '[]',
})

// Close menus on click outside
const closeMenus = () => {
  showPriorityMenu.value = false
  showListMenu.value = false
  showDateMenu.value = false
  showTimeMenu.value = false
  showQuadrantMenu.value = false
  showRepeatMenu.value = false
  showRemindMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})

// Watch title changes for smart parsing
watch(
  () => form.title,
  (newTitle) => {
    if (!newTitle.trim()) return
    if (form.id) return
    const parsed = parseTaskInput(newTitle)
    if (parsed.due_date) form.due_date = parsed.due_date
    if (parsed.start_time) form.start_time = parsed.start_time
    if (parsed.end_time) form.end_time = parsed.end_time
    if (parsed.priority !== undefined) form.priority = parsed.priority
    if (parsed.quadrant !== undefined) form.quadrant = parsed.quadrant
    if (parsed.tags) form.tags = parsed.tags
    form.title = parsed.title
  }
)

// Computed properties for display
const priorities = ['无', '低', '中', '高']
const quadrants = ['未分类', '重要紧急', '重要不紧急', '紧急不重要', '不紧急不重要']
const lists = computed(() => listStore.lists)

const isEditing = computed(() => !!form.id)

const priorityIcon = computed(() => {
  const icons = ['⚪', '🔵', '🟡', '🔴']
  return icons[form.priority] || '⚪'
})

const priorityClass = computed(() => {
  return `priority-${form.priority}`
})

const priorityDotClass = computed(() => {
  return `dot-${form.priority}`
})

const quadrantIcon = computed(() => {
  const icons = ['⚪', '1️⃣', '2️⃣', '3️⃣', '4️⃣']
  return icons[form.quadrant] || '⚪'
})

const listIcon = computed(() => {
  const list = lists.value.find((l) => l.id === form.list_id)
  return list?.icon || '📋'
})

const currentListName = computed(() => {
  const list = lists.value.find((l) => l.id === form.list_id)
  return list?.name || ''
})

const repeatLabel = computed(() => {
  const labels: Record<string, string> = {
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
  }
  return labels[form.repeat_rule] || ''
})

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === tomorrow.toDateString()) return '明天'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const formatTimeRange = () => {
  if (form.start_time && form.end_time) {
    return `${form.start_time.slice(0, 5)}-${form.end_time.slice(0, 5)}`
  }
  if (form.start_time) return form.start_time.slice(0, 5)
  return ''
}

// Menu selection handlers
const selectPriority = (priority: number) => {
  form.priority = priority
  showPriorityMenu.value = false
}

const selectList = (listId: string) => {
  form.list_id = listId
  showListMenu.value = false
}

const selectDate = (date: string) => {
  form.due_date = date
  showDateMenu.value = false
}

const selectTime = (start: string, end: string) => {
  form.start_time = start
  form.end_time = end
  showTimeMenu.value = false
}

const selectQuadrant = (quadrant: number) => {
  form.quadrant = quadrant
  showQuadrantMenu.value = false
}

const selectRepeat = (rule: string) => {
  form.repeat_rule = rule
  showRepeatMenu.value = false
}

const selectRemind = (remindAt: string) => {
  form.remind_at = remindAt
  showRemindMenu.value = false
}

watch(
  () => taskStore.editingTask,
  (task) => {
    if (task) {
      if (task.id) {
        Object.assign(form, {
          id: task.id,
          title: task.title || '',
          description: task.description || '',
          priority: (task.priority || 0) as number,
          list_id: task.list_id || 'inbox',
          due_date: task.due_date || '',
          start_time: task.start_time || '',
          end_time: task.end_time || '',
          remind_at: task.remind_at || '',
          quadrant: (task.quadrant || 0) as number,
          repeat_rule: task.repeat_rule || '',
          tags: task.tags || '[]',
        })
      } else {
        resetForm()
        form.list_id = (task as any).list_id || 'inbox'
      }
      visible.value = true
      nextTick(() => titleInput.value?.focus())
    }
  },
  { immediate: true }
)

const resetForm = () => {
  form.id = ''
  form.title = ''
  form.description = ''
  form.priority = 0
  form.list_id = 'inbox'
  form.due_date = ''
  form.start_time = ''
  form.end_time = ''
  form.remind_at = ''
  form.quadrant = 0
  form.repeat_rule = ''
  form.tags = '[]'
}

const close = () => {
  visible.value = false
  taskStore.closeTaskEditor()
  resetForm()
  closeMenus()
}

const save = async () => {
  if (!form.title.trim()) return

  const taskData: Partial<Task> = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    list_id: form.list_id,
    due_date: form.due_date || undefined,
    start_time: form.start_time || undefined,
    end_time: form.end_time || undefined,
    remind_at: form.remind_at || undefined,
    quadrant: form.quadrant,
    repeat_rule: form.repeat_rule || undefined,
    tags: form.tags,
  }

  try {
    if (isEditing.value) {
      await taskStore.updateTask(form.id, taskData)
    } else {
      await taskStore.createTask(taskData)
    }
    close()
  } catch (err) {
    console.error('Error saving task:', err)
  }
}
</script>

<style scoped>
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

.modal-container {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.title-input {
  font-size: var(--font-size-lg);
  font-weight: 500;
  border: none;
  padding: 0;
  background: transparent;
}

.title-input:focus {
  border: none;
}

.description-input {
  resize: vertical;
  min-height: 80px;
  border: none;
  padding: 0;
  background: transparent;
  color: var(--color-text-secondary);
}

.description-input:focus {
  border: none;
}

/* Quick Actions Bar */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin: var(--spacing-md) 0;
  position: relative;
}

.action-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  user-select: none;
}

.action-item:hover {
  background-color: var(--color-primary-bg);
}

.action-icon {
  font-size: var(--font-size-base);
  width: 20px;
  text-align: center;
}

.action-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-badge-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-1 {
  background-color: var(--color-priority-low);
}
.dot-2 {
  background-color: var(--color-priority-medium);
}
.dot-3 {
  background-color: var(--color-priority-high);
}

/* Priority icon colors */
.priority-0 {
  opacity: 0.5;
}
.priority-1 {
  filter: hue-rotate(180deg) saturate(1.5);
}
.priority-2 {
  filter: hue-rotate(30deg) saturate(1.5);
}
.priority-3 {
  filter: hue-rotate(-30deg) saturate(1.5);
}

/* Quadrant icon colors */
.quadrant-icon.quadrant-1 {
  filter: hue-rotate(140deg) saturate(1.2);
}
.quadrant-icon.quadrant-2 {
  filter: hue-rotate(200deg) saturate(1.2);
}
.quadrant-icon.quadrant-3 {
  filter: hue-rotate(50deg) saturate(1.2);
}
.quadrant-icon.quadrant-4 {
  opacity: 0.6;
}

/* Modal footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style>
