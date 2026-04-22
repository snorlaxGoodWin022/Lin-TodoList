<template>
  <div class="menu-popover" @click.stop>
    <div class="menu-title">四象限</div>
    <div class="menu-options">
      <div
        v-for="(option, index) in options"
        :key="index"
        :class="['menu-option', `quadrant-${index}`, { active: value === index }]"
        @click="$emit('select', index)"
      >
        <span class="option-icon">{{ option.icon }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span class="option-desc">{{ option.desc }}</span>
        <span v-if="value === index" class="check">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: number
}>()

defineEmits<{
  select: [quadrant: number]
  close: []
}>()

const options = [
  { icon: '⚪', label: '未分类', desc: '' },
  { icon: '1️⃣', label: '重要紧急', desc: '立即执行' },
  { icon: '2️⃣', label: '重要不紧急', desc: '计划执行' },
  { icon: '3️⃣', label: '紧急不重要', desc: '委托他人' },
  { icon: '4️⃣', label: '不紧急不重要', desc: '尽量不做' },
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
  min-width: 180px;
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
  border-left: 3px solid transparent;
}

.menu-option:hover {
  background-color: var(--color-primary-bg);
}

.menu-option.active {
  background-color: var(--color-primary-bg);
}

.menu-option.quadrant-1 {
  border-left-color: var(--color-priority-high);
}
.menu-option.quadrant-2 {
  border-left-color: var(--color-primary);
}
.menu-option.quadrant-3 {
  border-left-color: var(--color-priority-medium);
}
.menu-option.quadrant-4 {
  border-left-color: var(--color-text-muted);
}

.option-icon {
  font-size: var(--font-size-sm);
}

.option-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.option-desc {
  flex: 1;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}

.check {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
