<template>
  <aside class="detail-panel" :class="{ collapsed: isCollapsed }">
    <div class="panel-header">
      <h2 class="panel-title">任务详情</h2>
      <button class="panel-toggle" @click="toggleCollapse">
        <span class="toggle-icon">{{ isCollapsed ? '◀' : '▶' }}</span>
      </button>
    </div>

    <div v-if="!isCollapsed" class="panel-content">
      <div v-if="selectedTask" class="task-detail">
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="detail-item">
            <label class="detail-label">标题</label>
            <div class="detail-value">{{ selectedTask.title }}</div>
          </div>
          <div class="detail-item">
            <label class="detail-label">描述</label>
            <div class="detail-value">{{ selectedTask.description || '无描述' }}</div>
          </div>
          <div class="detail-item">
            <label class="detail-label">优先级</label>
            <div class="detail-value">
              <span class="priority-badge" :class="`priority-${selectedTask.priority}`">
                {{ priorityText }}
              </span>
            </div>
          </div>
          <div class="detail-item">
            <label class="detail-label">清单</label>
            <div class="detail-value">{{ listName }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">时间</h3>
          <div class="detail-item">
            <label class="detail-label">截止日期</label>
            <div class="detail-value">{{ selectedTask.due_date || '未设置' }}</div>
          </div>
          <div class="detail-item">
            <label class="detail-label">开始时间</label>
            <div class="detail-value">{{ selectedTask.start_time || '未设置' }}</div>
          </div>
          <div class="detail-item">
            <label class="detail-label">结束时间</label>
            <div class="detail-value">{{ selectedTask.end_time || '未设置' }}</div>
          </div>
          <div class="detail-item">
            <label class="detail-label">提醒</label>
            <div class="detail-value">{{ selectedTask.remind_at || '未设置' }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">其他</h3>
          <div class="detail-item">
            <label class="detail-label">标签</label>
            <div class="detail-value tags">
              <span
                v-for="tag in taskTags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="taskTags.length === 0">无标签</span>
            </div>
          </div>
          <div class="detail-item">
            <label class="detail-label">四象限</label>
            <div class="detail-value">{{ quadrantText }}</div>
          </div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" @click="editTask">编辑</button>
          <button class="btn btn-secondary" @click="toggleComplete">
            {{ selectedTask.completed ? '标记为未完成' : '标记为完成' }}
          </button>
          <button class="btn btn-danger" @click="deleteTask">删除</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">未选择任务</h3>
        <p class="empty-description">点击任务查看详情</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '../../stores/task.store'
import { useListStore } from '../../stores/list.store'

const taskStore = useTaskStore()
const listStore = useListStore()

const isCollapsed = computed(() => taskStore.detailPanelCollapsed)

const selectedTask = computed(() => taskStore.selectedTask)
const listName = computed(() => {
  if (!selectedTask.value) return ''
  const list = listStore.lists.find(l => l.id === selectedTask.value?.list_id)
  return list ? list.name : '未知清单'
})

const priorityText = computed(() => {
  const priorities = ['无', '低', '中', '高']
  return priorities[selectedTask.value?.priority || 0] || '无'
})

const quadrantText = computed(() => {
  const quadrants = ['未分类', '重要紧急', '重要不紧急', '紧急不重要', '不重要不紧急']
  return quadrants[selectedTask.value?.quadrant || 0] || '未分类'
})

const taskTags = computed(() => {
  try {
    return JSON.parse(selectedTask.value?.tags || '[]')
  } catch {
    return []
  }
})

const toggleCollapse = () => {
  taskStore.toggleDetailPanel()
}

const editTask = () => {
  if (selectedTask.value) {
    taskStore.openTaskEditor(selectedTask.value.id)
  }
}

const toggleComplete = () => {
  if (selectedTask.value) {
    taskStore.toggleTaskCompletion(selectedTask.value.id, !selectedTask.value.completed)
  }
}

const deleteTask = () => {
  if (selectedTask.value) {
    taskStore.deleteTask(selectedTask.value.id)
  }
}
</script>

<style scoped>
.detail-panel {
  width: var(--detail-panel-width);
  height: 100%;
  background-color: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width var(--transition-normal);
}

.detail-panel.collapsed {
  width: 40px;
}

.panel-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.panel-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-panel.collapsed .panel-title {
  display: none;
}

.panel-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.panel-toggle:hover {
  background-color: var(--color-primary-bg);
}

.toggle-icon {
  display: block;
  font-size: var(--font-size-sm);
  line-height: 1;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}

.detail-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.detail-item {
  margin-bottom: var(--spacing-md);
}

.detail-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.priority-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.priority-0 { background-color: var(--color-priority-none); color: var(--color-text-secondary); }
.priority-1 { background-color: var(--color-priority-low); color: white; }
.priority-2 { background-color: var(--color-priority-medium); color: white; }
.priority-3 { background-color: var(--color-priority-high); color: white; }

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
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
  background-color: var(--color-primary-bg);
  border-color: var(--color-primary);
}

.btn-danger {
  background-color: var(--color-priority-high);
  color: white;
}

.btn-danger:hover {
  background-color: #DC2626;
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
  font-size: 48px;
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.empty-description {
  font-size: var(--font-size-sm);
}
</style>