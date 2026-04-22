<template>
  <div class="menu-popover" @click.stop>
    <div class="menu-title">提醒</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  select: [remindAt: string]
  close: []
}>()

const getRemindTime = (minutesFromNow: number) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + minutesFromNow)
  return date.toISOString().slice(0, 16)
}

const options = [
  { icon: '🔔', label: '准时', value: getRemindTime(0) },
  { icon: '⏰', label: '5分钟后', value: getRemindTime(5) },
  { icon: '⏰', label: '15分钟后', value: getRemindTime(15) },
  { icon: '⏰', label: '30分钟后', value: getRemindTime(30) },
  { icon: '⏰', label: '1小时后', value: getRemindTime(60) },
  { icon: '🌅', label: '明天9点', value: getTomorrow(9, 0) },
  { icon: '🌅', label: '明天9:30', value: getTomorrow(9, 30) },
]

function getTomorrow(hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString().slice(0, 16)
}

const select = (remindAt: string) => {
  emit('select', remindAt)
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
  min-width: 150px;
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
</style>
