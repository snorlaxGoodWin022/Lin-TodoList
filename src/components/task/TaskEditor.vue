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

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">优先级</label>
              <div class="priority-selector">
                <button
                  v-for="(p, index) in priorities"
                  :key="index"
                  :class="[
                    'priority-btn',
                    `priority-${index}`,
                    { active: form.priority === index },
                  ]"
                  @click="form.priority = index"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">清单</label>
              <select v-model="form.list_id" class="form-select">
                <option v-for="list in lists" :key="list.id" :value="list.id">
                  {{ list.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">截止日期</label>
              <input v-model="form.due_date" type="date" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">提醒时间</label>
              <input v-model="form.remind_at" type="datetime-local" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始时间</label>
              <input v-model="form.start_time" type="time" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">结束时间</label>
              <input v-model="form.end_time" type="time" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">四象限</label>
            <div class="quadrant-selector">
              <button
                v-for="(q, index) in quadrants"
                :key="index"
                :class="['quadrant-btn', `quadrant-${index}`, { active: form.quadrant === index }]"
                @click="form.quadrant = index"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">重复规则</label>
            <select v-model="form.repeat_rule" class="form-select">
              <option value="">不重复</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="yearly">每年</option>
            </select>
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
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useTaskStore } from '../../stores/task.store'
import { useListStore } from '../../stores/list.store'
import SubtaskList from './SubtaskList.vue'
import { parseTaskInput } from '../../utils/smartParse'
import type { Task } from '../../types/repositories'

const taskStore = useTaskStore()
const listStore = useListStore()

const visible = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

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

// Watch title changes for smart parsing
watch(
  () => form.title,
  (newTitle) => {
    if (!newTitle.trim()) return

    // Only parse for new tasks (not editing existing ones)
    if (form.id) return

    const parsed = parseTaskInput(newTitle)

    // Update form fields with parsed values
    if (parsed.due_date) form.due_date = parsed.due_date
    if (parsed.start_time) form.start_time = parsed.start_time
    if (parsed.end_time) form.end_time = parsed.end_time
    if (parsed.priority !== undefined) form.priority = parsed.priority
    if (parsed.quadrant !== undefined) form.quadrant = parsed.quadrant
    if (parsed.tags) form.tags = parsed.tags

    // Update title with parsed result
    form.title = parsed.title
  }
)

const priorities = ['无', '低', '中', '高']
const quadrants = ['未分类', '重要紧急', '重要不紧急', '紧急不重要', '不紧急不重要']

const lists = computed(() => listStore.lists)

const isEditing = computed(() => !!form.id)

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
  border-radius: 12px;
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
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
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
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.title-input {
  font-size: 16px;
  font-weight: 500;
}

.description-input {
  resize: vertical;
  min-height: 80px;
}

.priority-selector,
.quadrant-selector {
  display: flex;
  gap: 8px;
}

.priority-btn,
.quadrant-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-secondary);
}

.priority-btn:hover,
.quadrant-btn:hover {
  border-color: var(--color-border-hover);
}

.priority-btn.active,
.quadrant-btn.active {
  border-width: 2px;
}

.priority-0.active {
  border-color: var(--color-priority-none);
  background: var(--color-priority-none);
  color: white;
}
.priority-1.active {
  border-color: var(--color-priority-low);
  background: var(--color-priority-low);
  color: white;
}
.priority-2.active {
  border-color: var(--color-priority-medium);
  background: var(--color-priority-medium);
  color: white;
}
.priority-3.active {
  border-color: var(--color-priority-high);
  background: var(--color-priority-high);
  color: white;
}

.quadrant-0.active {
  border-color: var(--color-text-muted);
}
.quadrant-1.active {
  border-color: var(--color-priority-high);
  background: var(--color-priority-high);
  color: white;
}
.quadrant-2.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}
.quadrant-3.active {
  border-color: var(--color-priority-medium);
  background: var(--color-priority-medium);
  color: white;
}
.quadrant-4.active {
  border-color: var(--color-text-muted);
  background: var(--color-text-muted);
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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
