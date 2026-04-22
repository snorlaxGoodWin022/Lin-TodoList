<template>
  <div class="menu-popover" @click.stop>
    <div class="menu-title">清单</div>
    <div class="menu-options">
      <div
        v-for="list in lists"
        :key="list.id"
        :class="['menu-option', { active: value === list.id }]"
        @click="$emit('select', list.id)"
      >
        <span class="option-icon">{{ list.icon || '📋' }}</span>
        <span class="option-label">{{ list.name }}</span>
        <span v-if="value === list.id" class="check">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useListStore } from '../../../stores/list.store'

const props = defineProps<{
  value: string
}>()

defineEmits<{
  select: [listId: string]
  close: []
}>()

const listStore = useListStore()
const lists = computed(() => listStore.lists)
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
  max-height: 300px;
  overflow-y: auto;
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
