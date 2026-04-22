<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '编辑便签' : '新建便签' }}</h2>
          <button class="close-btn" @click="close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">标题</label>
            <input
              ref="titleInput"
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="便签标题"
            />
          </div>

          <div class="form-group">
            <label class="form-label">颜色</label>
            <div class="color-selector">
              <button
                v-for="color in colors"
                :key="color.value"
                :class="['color-btn', { active: form.color === color.value }]"
                :style="{ backgroundColor: color.value }"
                @click="form.color = color.value"
              >
                <span v-if="form.color === color.value" class="check-mark">✓</span>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="isEditing" class="btn btn-danger" @click="deleteNote">删除</button>
          <div class="spacer"></div>
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" @click="save">
            {{ isEditing ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useNoteStore } from '../../stores/note.store'
import type { Note } from '../../types/repositories'

const noteStore = useNoteStore()

const visible = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id: '',
  title: '',
  content: '',
  color: '#FEF3C7',
  pinned: 0,
})

const colors = [
  { value: '#FEF3C7', label: '黄色' },
  { value: '#D1FAE5', label: '绿色' },
  { value: '#DBEAFE', label: '蓝色' },
  { value: '#FCE7F3', label: '粉色' },
  { value: '#F3E8FF', label: '紫色' },
  { value: '#FEE2E2', label: '红色' },
  { value: '#F5F5F5', label: '灰色' },
]

const isEditing = computed(() => !!form.id)

watch(
  () => noteStore.editingNote,
  (note) => {
    if (note) {
      if (note.id) {
        Object.assign(form, {
          id: note.id,
          title: note.title || '',
          content: note.content || '',
          color: note.color || '#FEF3C7',
          pinned: note.pinned || 0,
        })
      } else {
        resetForm()
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
  form.content = ''
  form.color = '#FEF3C7'
  form.pinned = 0
}

const close = () => {
  visible.value = false
  noteStore.closeNoteEditor()
  resetForm()
}

const save = async () => {
  const noteData: Partial<Note> = {
    title: form.title,
    content: form.content,
    color: form.color,
    pinned: form.pinned,
  }

  try {
    if (isEditing.value) {
      await noteStore.updateNote(form.id, noteData)
    } else {
      await noteStore.createNote(noteData)
    }
    close()
  } catch (err) {
    console.error('Error saving note:', err)
  }
}

const deleteNote = async () => {
  if (!form.id) return
  if (!confirm('确定要删除这个便签吗？')) return

  try {
    await noteStore.deleteNote(form.id)
    close()
  } catch (err) {
    console.error('Error deleting note:', err)
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
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.color-selector {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: var(--color-text-primary);
}

.check-mark {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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

.btn-secondary {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: var(--color-priority-high);
  color: white;
  border: none;
}
</style>
