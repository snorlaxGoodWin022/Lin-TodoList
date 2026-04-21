<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '编辑习惯' : '新建习惯' }}</h2>
          <button class="close-btn" @click="close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">名称</label>
            <input
              ref="nameInput"
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="习惯名称"
            />
          </div>

          <div class="form-group">
            <label class="form-label">图标</label>
            <div class="icon-selector">
              <button
                v-for="icon in icons"
                :key="icon"
                :class="['icon-btn', { active: form.icon === icon }]"
                @click="form.icon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">频率</label>
            <div class="frequency-selector">
              <button
                v-for="freq in frequencies"
                :key="freq.value"
                :class="['freq-btn', { active: form.frequency === freq.value }]"
                @click="form.frequency = freq.value"
              >
                {{ freq.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">提醒时间</label>
            <input v-model="form.remind_at" type="time" class="form-input" />
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="isEditing" class="btn btn-danger" @click="deleteHabit">删除</button>
          <div class="spacer"></div>
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" @click="save" :disabled="!form.name.trim()">
            {{ isEditing ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useHabitStore } from '../../stores/habit.store'
import type { Habit } from '../../types/repositories'

const habitStore = useHabitStore()

const visible = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id: '',
  name: '',
  icon: '💪',
  frequency: 'daily',
  remind_at: ''
})

const icons = ['💪', '📚', '🏃', '💧', '🧘', '🎯', '✍️', '🌅', '😴', '🍎', '🎨', '🎵', '💻', '🌱']
const frequencies = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' }
]

const isEditing = computed(() => !!form.id)

watch(() => habitStore.editingHabit, (habit) => {
  if (habit) {
    if (habit.id) {
      Object.assign(form, {
        id: habit.id,
        name: habit.name || '',
        icon: habit.icon || '💪',
        frequency: habit.frequency || 'daily',
        remind_at: habit.remind_at || ''
      })
    } else {
      resetForm()
    }
    visible.value = true
    nextTick(() => nameInput.value?.focus())
  }
}, { immediate: true })

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.icon = '💪'
  form.frequency = 'daily'
  form.remind_at = ''
}

const close = () => {
  visible.value = false
  habitStore.closeHabitEditor()
  resetForm()
}

const save = async () => {
  if (!form.name.trim()) return

  const habitData: Partial<Habit> = {
    name: form.name,
    icon: form.icon,
    frequency: form.frequency,
    remind_at: form.remind_at || undefined
  }

  try {
    if (isEditing.value) {
      await habitStore.updateHabit(form.id, habitData)
    } else {
      await habitStore.createHabit(habitData)
    }
    close()
  } catch (err) {
    console.error('Error saving habit:', err)
  }
}

const deleteHabit = async () => {
  if (!form.id) return
  if (!confirm('确定要删除这个习惯吗？')) return

  try {
    await habitStore.deleteHabit(form.id)
    close()
  } catch (err) {
    console.error('Error deleting habit:', err)
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

.modal-sm {
  max-width: 400px;
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

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  border-color: var(--color-border-hover);
}

.icon-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.frequency-selector {
  display: flex;
  gap: 8px;
}

.freq-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-secondary);
}

.freq-btn:hover {
  border-color: var(--color-border-hover);
}

.freq-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.spacer {
  flex: 1;
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: #EF4444;
  color: white;
  border: none;
}
</style>
