<template>
  <div class="menu-popover" @click.stop>
    <div class="menu-title">重复</div>
    <div class="menu-options">
      <div
        v-for="option in options"
        :key="option.value"
        :class="['menu-option', { active: value === option.value }]"
        @click="$emit('select', option.value)"
      >
        <span class="option-icon">{{ option.icon }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span v-if="value === option.value" class="check">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string
}>()

defineEmits<{
  select: [rule: string]
  close: []
}>()

const options = [
  { icon: '➡️', label: '不重复', value: '' },
  { icon: '🔁', label: '每天', value: 'daily' },
  { icon: '📅', label: '每周', value: 'weekly' },
  { icon: '📆', label: '每月', value: 'monthly' },
  { icon: '🗓️', label: '每年', value: 'yearly' },
]
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
  min-width: 140px;
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
