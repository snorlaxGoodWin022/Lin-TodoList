<template>
  <div class="filter-panel" :class="{ expanded: isExpanded }">
    <div class="filter-header">
      <button class="btn btn-text toggle-btn" @click="toggleExpand">
        <span class="icon">🔍</span>
        <span>筛选</span>
        <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
        <span class="arrow">{{ isExpanded ? '▲' : '▼' }}</span>
      </button>
      <div class="filter-actions">
        <button v-if="activeFilterCount > 0" class="btn btn-text" @click="clearFilters">
          清除
        </button>
        <button class="btn btn-text" @click="showSaveDialog = true">保存筛选</button>
      </div>
    </div>

    <div v-if="isExpanded" class="filter-content">
      <div class="filter-section">
        <label class="filter-label">优先级</label>
        <div class="filter-chips">
          <button
            v-for="p in priorityOptions"
            :key="p.value"
            :class="[
              'chip',
              `priority-${p.value}`,
              { active: localFilters.priorityIn?.includes(p.value) },
            ]"
            @click="togglePriority(p.value)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <label class="filter-label">日期范围</label>
        <div class="date-range">
          <input
            v-model="localFilters.dueDateStart"
            type="date"
            class="form-input"
            placeholder="开始日期"
          />
          <span class="range-separator">至</span>
          <input
            v-model="localFilters.dueDateEnd"
            type="date"
            class="form-input"
            placeholder="结束日期"
          />
        </div>
      </div>

      <div class="filter-section">
        <label class="filter-label">清单</label>
        <select v-model="localFilters.listId" class="form-select">
          <option value="">全部清单</option>
          <option v-for="list in lists" :key="list.id" :value="list.id">
            {{ list.name }}
          </option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">四象限</label>
        <div class="filter-chips">
          <button
            v-for="q in quadrantOptions"
            :key="q.value"
            :class="['chip', { active: localFilters.quadrant === q.value }]"
            @click="setQuadrant(q.value)"
          >
            {{ q.label }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <label class="filter-label">状态</label>
        <div class="filter-chips">
          <button
            :class="['chip', { active: localFilters.completed === false }]"
            @click="setCompleted(false)"
          >
            未完成
          </button>
          <button
            :class="['chip', { active: localFilters.completed === true }]"
            @click="setCompleted(true)"
          >
            已完成
          </button>
          <button
            :class="['chip', { active: localFilters.completed === undefined }]"
            @click="setCompleted(undefined)"
          >
            全部
          </button>
        </div>
      </div>
    </div>

    <!-- Presets dropdown -->
    <div v-if="presets.length > 0" class="filter-presets">
      <div class="preset-header">已保存的筛选</div>
      <div class="preset-list">
        <button
          v-for="preset in presets"
          :key="preset.id"
          class="preset-item"
          @click="applyPreset(preset)"
        >
          <span class="preset-name">{{ preset.name }}</span>
          <button class="preset-delete" @click.stop="deletePreset(preset.id)">×</button>
        </button>
      </div>
    </div>

    <!-- Save preset dialog -->
    <div v-if="showSaveDialog" class="save-dialog">
      <div class="dialog-overlay" @click="showSaveDialog = false"></div>
      <div class="dialog-content">
        <h3>保存筛选</h3>
        <input v-model="newPresetName" type="text" class="form-input" placeholder="输入筛选名称" />
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="showSaveDialog = false">取消</button>
          <button class="btn btn-primary" @click="savePreset">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useListStore } from '../../stores/list.store'
import type { TaskFilters } from '../../types/repositories'

const props = defineProps<{
  modelValue: TaskFilters
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TaskFilters): void
}>()

const listStore = useListStore()

const isExpanded = ref(false)
const showSaveDialog = ref(false)
const newPresetName = ref('')
const presets = ref<Array<{ id: string; name: string; filters: string }>>([])

const lists = computed(() => listStore.lists)

const priorityOptions = [
  { value: 3, label: '高' },
  { value: 2, label: '中' },
  { value: 1, label: '低' },
  { value: 0, label: '无' },
]

const quadrantOptions = [
  { value: 1, label: '紧急重要' },
  { value: 2, label: '重要不紧急' },
  { value: 3, label: '紧急不重要' },
  { value: 4, label: '不紧急不重要' },
]

const localFilters = ref<TaskFilters>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (newVal) => {
    localFilters.value = { ...newVal }
  },
  { deep: true }
)

watch(
  localFilters,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  { deep: true }
)

const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.value.priorityIn?.length) count++
  if (localFilters.value.dueDateStart) count++
  if (localFilters.value.dueDateEnd) count++
  if (localFilters.value.listId) count++
  if (localFilters.value.quadrant !== undefined) count++
  if (localFilters.value.completed !== undefined) count++
  return count
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const togglePriority = (priority: number) => {
  if (!localFilters.value.priorityIn) {
    localFilters.value.priorityIn = []
  }
  const index = localFilters.value.priorityIn.indexOf(priority)
  if (index === -1) {
    localFilters.value.priorityIn.push(priority)
  } else {
    localFilters.value.priorityIn.splice(index, 1)
  }
}

const setQuadrant = (quadrant: number | undefined) => {
  if (localFilters.value.quadrant === quadrant) {
    localFilters.value.quadrant = undefined
  } else {
    localFilters.value.quadrant = quadrant
  }
}

const setCompleted = (completed: boolean | undefined) => {
  localFilters.value.completed = completed
}

const clearFilters = () => {
  localFilters.value = {}
}

const loadPresets = async () => {
  try {
    const result = await window.electronAPI.getFilterPresets()
    presets.value = result
  } catch (err) {
    console.error('Error loading filter presets:', err)
  }
}

const applyPreset = (preset: { id: string; name: string; filters: string }) => {
  try {
    const filters = JSON.parse(preset.filters)
    localFilters.value = { ...filters }
  } catch (err) {
    console.error('Error applying preset:', err)
  }
}

const savePreset = async () => {
  if (!newPresetName.value.trim()) return

  try {
    await window.electronAPI.createFilterPreset({
      name: newPresetName.value,
      filters: JSON.stringify(localFilters.value),
    })
    newPresetName.value = ''
    showSaveDialog.value = false
    await loadPresets()
  } catch (err) {
    console.error('Error saving filter preset:', err)
  }
}

const deletePreset = async (id: string) => {
  try {
    await window.electronAPI.deleteFilterPreset(id)
    await loadPresets()
  } catch (err) {
    console.error('Error deleting filter preset:', err)
  }
}

// Initialize
loadPresets()
</script>

<style scoped>
.filter-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-badge {
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.arrow {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.filter-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-content {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.chip {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip:hover {
  border-color: var(--color-border-hover);
}

.chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.chip.priority-3.active {
  background: var(--color-priority-high);
  border-color: var(--color-priority-high);
}
.chip.priority-2.active {
  background: var(--color-priority-medium);
  border-color: var(--color-priority-medium);
}
.chip.priority-1.active {
  background: var(--color-priority-low);
  border-color: var(--color-priority-low);
}
.chip.priority-0.active {
  background: var(--color-text-muted);
  border-color: var(--color-text-muted);
}

.date-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.range-separator {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.form-input,
.form-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-text {
  background: none;
  color: var(--color-text-secondary);
}

.btn-text:hover {
  color: var(--color-primary);
}

.btn-secondary {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

/* Presets */
.filter-presets {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-sm) var(--spacing-md);
}

.preset-header {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xs);
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.preset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preset-item:hover {
  border-color: var(--color-primary);
}

.preset-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.preset-delete {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-lg);
  padding: 0 var(--spacing-xs);
}

.preset-delete:hover {
  color: var(--color-priority-high);
}

/* Save dialog */
.save-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.dialog-content h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
