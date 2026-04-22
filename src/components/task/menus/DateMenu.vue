<template>
  <div class="menu-popover" @click.stop>
    <div class="menu-title">截止日期</div>
    <div class="menu-options">
      <div
        v-for="option in options"
        :key="option.value"
        :class="['menu-option', { active: value === option.value }]"
        @click="select(option.value)"
      >
        <span class="option-icon">{{ option.icon }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span v-if="value === option.value" class="check">✓</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-option" @click="showCustom = true">
        <span class="option-icon">📅</span>
        <span class="option-label">选择日期</span>
      </div>
    </div>
    <div v-if="showCustom" class="custom-date">
      <input
        type="date"
        :value="value"
        class="date-input"
        @change="select(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  select: [date: string]
  close: []
}>()

const showCustom = ref(false)

const getDateStr = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

const options = [
  { icon: '📌', label: '今天', value: getDateStr(0) },
  { icon: '📆', label: '明天', value: getDateStr(1) },
  { icon: '📆', label: '后天', value: getDateStr(2) },
  { icon: '📆', label: '下周', value: getDateStr(7) },
  { icon: '📆', label: '下月', value: getDateStr(30) },
]

const select = (date: string) => {
  emit('select', date)
  showCustom.value = false
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
  min-width: 160px;
  z-index: 100;
  padding: var(--spacing-xs);
}

.menu-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xs);
}

.menu-options {
  display: flex;
  flex-direction: column;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.menu-option:hover {
  background-color: var(--color-primary-bg);
}

.menu-option.active {
  background-color: var(--color-primary-bg);
}

.option-icon {
  font-size: var(--font-size-sm);
}

.option-label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.check {
  color: var(--color-primary);
  font-weight: 600;
}

.menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-xs) 0;
}

.custom-date {
  padding: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.date-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
</style>
