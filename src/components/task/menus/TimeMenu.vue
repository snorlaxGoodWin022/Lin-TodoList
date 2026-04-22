<template>
  <div class="menu-popover time-menu" @click.stop>
    <div class="menu-title">时间</div>
    <div class="menu-content">
      <div class="time-section">
        <label class="time-label">开始</label>
        <input
          type="time"
          :value="startTime"
          class="time-input"
          @change="updateStart(($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="time-divider">-</div>
      <div class="time-section">
        <label class="time-label">结束</label>
        <input
          type="time"
          :value="endTime"
          class="time-input"
          @change="updateEnd(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="quick-times">
      <div
        v-for="preset in presets"
        :key="preset.label"
        class="quick-preset"
        @click="selectPreset(preset)"
      >
        {{ preset.label }}
      </div>
    </div>
    <div class="menu-actions">
      <button class="action-btn clear" @click="clear">清除</button>
      <button class="action-btn confirm" @click="confirm">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  startTime: string
  endTime: string
}>()

const emit = defineEmits<{
  select: [start: string, end: string]
  close: []
}>()

const localStart = ref(props.startTime)
const localEnd = ref(props.endTime)

watch(
  () => props.startTime,
  (v) => (localStart.value = v)
)
watch(
  () => props.endTime,
  (v) => (localEnd.value = v)
)

const presets = [
  { label: '上午', start: '09:00', end: '12:00' },
  { label: '下午', start: '14:00', end: '18:00' },
  { label: '晚上', start: '19:00', end: '22:00' },
  { label: '09:00-12:00', start: '09:00', end: '12:00' },
  { label: '14:00-18:00', start: '14:00', end: '18:00' },
]

const updateStart = (v: string) => {
  localStart.value = v
}

const updateEnd = (v: string) => {
  localEnd.value = v
}

const selectPreset = (preset: { start: string; end: string }) => {
  localStart.value = preset.start
  localEnd.value = preset.end
}

const clear = () => {
  localStart.value = ''
  localEnd.value = ''
  emit('select', '', '')
}

const confirm = () => {
  emit('select', localStart.value, localEnd.value)
}
</script>

<style scoped>
.menu-popover {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 220px;
  z-index: 100;
  padding: var(--spacing-sm);
}

.menu-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-sm);
}

.menu-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.time-section {
  flex: 1;
}

.time-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.time-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.time-divider {
  color: var(--color-text-muted);
  padding-top: 20px;
}

.quick-times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--color-border);
}

.quick-preset {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-preset:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.menu-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.action-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn.clear {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.action-btn.confirm {
  background: var(--color-primary);
  border: none;
  color: white;
}

.action-btn.confirm:hover {
  background: var(--color-primary-hover);
}
</style>
