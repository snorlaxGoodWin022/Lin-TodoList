<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '编辑清单' : '新建清单' }}</h2>
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
              placeholder="清单名称"
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
            <label class="form-label">颜色</label>
            <div class="color-selector">
              <button
                v-for="color in colors"
                :key="color"
                :class="['color-btn', { active: form.color === color }]"
                :style="{ backgroundColor: color }"
                @click="form.color = color"
              ></button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="isEditing" class="btn btn-danger" @click="deleteList">删除</button>
          <div class="spacer"></div>
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" :disabled="!form.name.trim()" @click="save">
            {{ isEditing ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useListStore } from '../../stores/list.store'
import type { List } from '../../types/repositories'

const listStore = useListStore()

const visible = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id: '',
  name: '',
  icon: '📁',
  color: '#10B981',
})

const icons = [
  '📁',
  '📋',
  '📝',
  '📌',
  '📎',
  '💼',
  '💡',
  '🎯',
  '⭐',
  '❤️',
  '🔥',
  '🚀',
  '📚',
  '🎨',
  '🎵',
  '🏠',
  '✈️',
  '🍕',
]
const colors = [
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
]

const isEditing = computed(() => !!form.id)

watch(
  () => listStore.editingList,
  (list) => {
    if (list) {
      if (list.id) {
        Object.assign(form, {
          id: list.id,
          name: list.name || '',
          icon: list.icon || '📁',
          color: list.color || '#10B981',
        })
      } else {
        resetForm()
      }
      visible.value = true
      nextTick(() => nameInput.value?.focus())
    }
  },
  { immediate: true }
)

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.icon = '📁'
  form.color = '#10B981'
}

const close = () => {
  visible.value = false
  listStore.closeListEditor()
  resetForm()
}

const save = async () => {
  if (!form.name.trim()) return

  const listData: Partial<List> = {
    name: form.name,
    icon: form.icon,
    color: form.color,
  }

  try {
    if (isEditing.value) {
      await listStore.updateList(form.id, listData)
    } else {
      await listStore.createList(listData)
    }
    close()
  } catch (err) {
    console.error('Error saving list:', err)
  }
}

const deleteList = async () => {
  if (!form.id) return
  if (!confirm('确定要删除这个清单吗？')) return

  try {
    await listStore.deleteList(form.id)
    close()
  } catch (err) {
    console.error('Error deleting list:', err)
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

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: var(--color-text-primary);
  box-shadow: 0 0 0 2px var(--color-surface);
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
  background: #ef4444;
  color: white;
  border: none;
}
</style>
