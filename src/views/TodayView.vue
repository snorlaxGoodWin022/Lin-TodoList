<template>
  <div class="today-view">
    <div class="view-header">
      <h1 class="view-title">今天</h1>
      <div class="view-subtitle">
        <span class="date">{{ formattedDate }}</span>
        <span class="task-count">{{ pendingTasks.length }} 个任务</span>
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="batchSelectMode" class="batch-action-bar">
      <span class="selected-count">已选择 {{ selectedCount }} 项</span>
      <button class="btn btn-secondary" @click="selectAll">全选</button>
      <button class="btn btn-secondary" @click="batchComplete">标记完成</button>
      <button class="btn btn-secondary" @click="batchPriority">修改优先级</button>
      <button class="btn btn-secondary" @click="batchMove">移动到</button>
      <button class="btn btn-danger" @click="batchDelete">删除</button>
      <button class="btn btn-text" @click="cancelBatch">取消</button>
    </div>

    <!-- Batch Edit Modal -->
    <div v-if="showBatchEdit" class="modal-overlay" @click="closeBatchEdit">
      <div class="modal-content" @click.stop>
        <h3>批量编辑任务</h3>
        <div class="form-group">
          <label>选择优先级</label>
          <div class="priority-options">
            <button
              v-for="p in priorityOptions"
              :key="p.value"
              class="priority-btn"
              :class="[`priority-${p.value}`, { active: selectedPriority === p.value }]"
              @click="selectedPriority = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeBatchEdit">取消</button>
          <button class="btn btn-primary" @click="applyBatchPriority">应用</button>
        </div>
      </div>
    </div>

    <!-- Move to List Modal -->
    <div v-if="showMoveModal" class="modal-overlay" @click="closeMoveModal">
      <div class="modal-content" @click.stop>
        <h3>移动到清单</h3>
        <div class="form-group">
          <label>选择清单</label>
          <select v-model="targetListId" class="form-select">
            <option value="">选择清单...</option>
            <option v-for="list in lists" :key="list.id" :value="list.id">
              {{ list.name }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeMoveModal">取消</button>
          <button class="btn btn-primary" @click="applyBatchMove">移动</button>
        </div>
      </div>
    </div>

    <div class="view-content">
      <div v-if="overdueTasks.length > 0" class="overdue-section">
        <h2 class="section-title">过期任务</h2>
        <draggable
          v-model="overdueTasks"
          item-key="id"
          class="task-list"
          ghost-class="ghost"
          data-section="overdue"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <TaskCard
              :task="element"
              @select="selectTask"
              @toggle="toggleTaskCompletion(element.id, !element.completed)"
            />
          </template>
        </draggable>
      </div>

      <div class="today-section">
        <div class="section-header">
          <h2 class="section-title">今天到期</h2>
          <button
            v-if="!batchSelectMode && pendingTasks.length > 0"
            class="btn btn-text"
            @click="startBatchSelect"
          >
            多选
          </button>
        </div>
        <draggable
          v-model="todayTasks"
          item-key="id"
          class="task-list"
          ghost-class="ghost"
          data-section="today"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <TaskCard
              :task="element"
              @select="selectTask"
              @toggle="toggleTaskCompletion(element.id, !element.completed)"
            />
          </template>
        </draggable>
      </div>

      <div v-if="completedTasks.length > 0" class="completed-section">
        <h2 class="section-title">已完成</h2>
        <div class="task-list">
          <TaskCard
            v-for="task in completedTasks"
            :key="task.id"
            :task="task"
            @select="selectTask"
            @toggle="toggleTaskCompletion(task.id, !task.completed)"
          />
        </div>
      </div>

      <div v-if="totalTasks === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <h3 class="empty-title">没有任务</h3>
        <p class="empty-description">今天很轻松，享受你的时间！</p>
        <button class="btn btn-primary" @click="createTask">创建新任务</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useTask } from '../composables/useTask'
import { useList } from '../composables/useList'
import { useTaskStore } from '../stores/task.store'
import TaskCard from '../components/task/TaskCard.vue'

const task = useTask()
const list = useList()
const taskStore = useTaskStore()

// Batch mode
const batchSelectMode = computed(() => taskStore.batchSelectMode)
const selectedCount = computed(() => taskStore.selectedTaskIds.size)

const startBatchSelect = () => {
  taskStore.toggleBatchSelectMode()
}

const selectAll = () => {
  taskStore.selectAllTasks()
}

const batchComplete = () => {
  taskStore.batchCompleteTasks(true)
}

// Batch priority modal
const showBatchEdit = ref(false)
const selectedPriority = ref(0)
const priorityOptions = [
  { value: 0, label: '无' },
  { value: 1, label: '低' },
  { value: 2, label: '中' },
  { value: 3, label: '高' },
]

const batchPriority = () => {
  showBatchEdit.value = true
}

const closeBatchEdit = () => {
  showBatchEdit.value = false
  selectedPriority.value = 0
}

const applyBatchPriority = () => {
  taskStore.batchPriority(selectedPriority.value)
  closeBatchEdit()
}

// Batch move modal
const showMoveModal = ref(false)
const targetListId = ref('')
const isDragging = ref(false)

const batchMove = () => {
  showMoveModal.value = true
}

const closeMoveModal = () => {
  showMoveModal.value = false
  targetListId.value = ''
}

const applyBatchMove = () => {
  if (targetListId.value) {
    taskStore.batchMoveTasks(targetListId.value)
  }
  closeMoveModal()
}

const lists = computed(() => list.lists.value)

const batchDelete = () => {
  if (confirm(`确定要删除选中的 ${selectedCount.value} 个任务吗？此操作不可撤销。`)) {
    taskStore.batchDeleteTasks()
  }
}

const cancelBatch = () => {
  taskStore.toggleBatchSelectMode()
}

// Computed properties
const formattedDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const pendingTasks = computed(() => task.pendingTasks.value)
const completedTasks = computed(() => task.completedTasks.value)
const todayTasks = computed(() => task.todayTasks.value)
const overdueTasks = computed(() => task.overdueTasks.value)
const totalTasks = computed(() => task.tasks.value.length)

// Actions
const selectTask = (taskItem: any) => {
  task.selectTask(taskItem)
}

const toggleTaskCompletion = (id: string, completed: boolean) => {
  task.toggleTaskCompletion(id, completed)
}

const createTask = () => {
  task.openTaskEditor()
}

const onDragEnd = async (event: any) => {
  const { from, to, oldIndex, newIndex } = event

  // If nothing moved, skip
  if (oldIndex === newIndex && from === to) return

  const fromSection = from.dataset?.section
  const toSection = to.dataset?.section
  if (!fromSection) return

  // Skip if a drag operation is already in progress
  if (isDragging.value) return
  isDragging.value = true

  try {
    // Collect all sort order updates
    const updates: { id: string; sort_order: number }[] = []

    // Get current task lists
    const currentOverdue = overdueTasks.value
    const currentToday = todayTasks.value

    // Calculate new sort orders for source section
    const sourceTasks = fromSection === 'overdue' ? currentOverdue : currentToday
    sourceTasks.forEach((t, i) => {
      const newSortOrder = (i + 1) * 1000
      if (t.sort_order !== newSortOrder) {
        updates.push({ id: t.id, sort_order: newSortOrder })
      }
    })

    // If moved between different sections, also update destination section
    if (fromSection !== toSection && toSection) {
      const destTasks = toSection === 'overdue' ? currentOverdue : currentToday
      destTasks.forEach((t, i) => {
        const newSortOrder = (i + 1) * 1000
        if (t.sort_order !== newSortOrder) {
          updates.push({ id: t.id, sort_order: newSortOrder })
        }
      })
    }

    // Batch update all sort orders
    for (const update of updates) {
      await task.updateTask(update.id, { sort_order: update.sort_order })
    }
  } catch (err) {
    console.error('Error updating task order:', err)
  } finally {
    // Delay resetting flag to prevent rapid re-triggers
    setTimeout(() => {
      isDragging.value = false
    }, 100)
  }
}

// Lifecycle
onMounted(() => {
  task.init()
  list.init()
})
</script>

<style scoped>
.today-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  margin-bottom: var(--spacing-xl);
}

.batch-action-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.selected-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-right: auto;
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.view-subtitle {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.date {
  font-weight: var(--font-weight-medium);
}

.task-count {
  padding: 2px 8px;
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.view-content {
  flex: 1;
  overflow: auto;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
  display: inline-block;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.section-header .section-title {
  margin: 0;
  padding: 0;
  border: none;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 10px;
}

.task-list.ghost {
  opacity: 0.5;
  background: var(--color-primary-light);
  border-radius: 8px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.empty-description {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xl);
  max-width: 300px;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
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
  background-color: var(--color-surface);
  border-color: var(--color-border-hover);
}

.btn-danger {
  background-color: var(--color-priority-high);
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: var(--color-priority-high);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.btn-text:hover {
  color: var(--color-primary);
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
  width: 360px;
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

.form-select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.priority-options {
  display: flex;
  gap: var(--spacing-sm);
}

.priority-btn {
  flex: 1;
  padding: var(--spacing-sm);
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
</style>
