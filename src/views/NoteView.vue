<template>
  <div class="note-view">
    <div class="note-header">
      <div class="header-left">
        <h1 class="page-title">便签</h1>
        <p class="page-subtitle">记录想法和灵感</p>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <Icon icon="mdi:magnify" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索便签..."
            @input="onSearch"
          />
          <button v-if="searchQuery" class="btn btn-icon" @click="clearSearch">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <button class="btn btn-primary" @click="showNewNoteModal = true">
          <Icon icon="mdi:plus" class="btn-icon" />
          新建便签
        </button>
      </div>
    </div>

    <div class="note-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        <Icon icon="mdi:note-multiple-outline" class="tab-icon" />
        全部便签
        <span class="tab-count">{{ allNotes.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pinned' }"
        @click="activeTab = 'pinned'"
      >
        <Icon icon="mdi:pin-outline" class="tab-icon" />
        已置顶
        <span class="tab-count">{{ pinnedNotes.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'recent' }"
        @click="activeTab = 'recent'"
      >
        <Icon icon="mdi:clock-outline" class="tab-icon" />
        最近编辑
        <span class="tab-count">{{ recentNotes.length }}</span>
      </button>
    </div>

    <div class="note-content">
      <div v-if="displayNotes.length === 0" class="empty-state">
        <Icon icon="mdi:note-text-outline" class="empty-icon" />
        <h3 class="empty-title">
          {{ searchQuery ? '没有找到相关便签' : '还没有便签' }}
        </h3>
        <p class="empty-text">
          {{ searchQuery ? '尝试其他搜索关键词' : '创建你的第一个便签，记录想法吧！' }}
        </p>
        <button v-if="!searchQuery" class="btn btn-primary" @click="showNewNoteModal = true">
          <Icon icon="mdi:plus" class="btn-icon" />
          新建便签
        </button>
        <button v-else class="btn btn-text" @click="clearSearch">
          清除搜索
        </button>
      </div>

      <div v-else class="note-grid">
        <div
          v-for="note in displayNotes"
          :key="note.id"
          class="note-card"
          :style="{
            '--note-color': getNoteColor(note.color),
            'background': getNoteColor(note.color)
          }"
          @click="selectNote(note)"
        >
          <div class="note-card-header">
            <div class="note-title">
              <h4 class="title-text">{{ note.title || '无标题' }}</h4>
              <span v-if="note.pinned" class="pinned-badge">
                <Icon icon="mdi:pin" />
              </span>
            </div>
            <div class="note-actions">
              <button
                class="btn btn-icon"
                @click.stop="toggleNotePin(note)"
                :title="note.pinned ? '取消置顶' : '置顶'"
              >
                <Icon :icon="note.pinned ? 'mdi:pin-off' : 'mdi:pin'" />
              </button>
              <button class="btn btn-icon" @click.stop="editNote(note)" title="编辑">
                <Icon icon="mdi:pencil-outline" />
              </button>
              <button class="btn btn-icon" @click.stop="deleteNote(note.id)" title="删除">
                <Icon icon="mdi:delete-outline" />
              </button>
            </div>
          </div>

          <div class="note-card-content">
            <div class="note-preview" v-html="formatNoteContent(note.content)"></div>
          </div>

          <div class="note-card-footer">
            <div class="note-meta">
              <div class="meta-item">
                <Icon icon="mdi:calendar" class="meta-icon" />
                <span class="meta-text">{{ formatDate(note.updated_at) }}</span>
              </div>
              <div v-if="note.tags && note.tags.length > 0" class="meta-item">
                <Icon icon="mdi:tag-outline" class="meta-icon" />
                <div class="note-tags">
                  <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="note-tag">
                    {{ tag }}
                  </span>
                  <span v-if="note.tags.length > 2" class="note-tag-more">
                    +{{ note.tags.length - 2 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 便签编辑器模态框 -->
    <div v-if="showNoteEditor" class="modal-overlay" @click.self="closeNoteEditor">
      <div class="note-editor" :style="{ 'background': getNoteColor(editingNote?.color) }">
        <div class="editor-header">
          <input
            v-model="editingNote.title"
            type="text"
            class="editor-title"
            placeholder="便签标题..."
          />
          <div class="editor-actions">
            <div class="color-picker">
              <button
                v-for="color in noteColors"
                :key="color"
                class="color-option"
                :style="{ 'background': color }"
                :class="{ active: editingNote?.color === color }"
                @click="setNoteColor(color)"
                :title="color"
              />
            </div>
            <button
              class="btn btn-icon"
              @click="toggleEditingNotePin"
              :title="editingNote?.pinned ? '取消置顶' : '置顶'"
            >
              <Icon :icon="editingNote?.pinned ? 'mdi:pin' : 'mdi:pin-outline'" />
            </button>
            <button class="btn btn-icon" @click="saveNote" title="保存">
              <Icon icon="mdi:content-save-outline" />
            </button>
            <button class="btn btn-icon" @click="closeNoteEditor" title="关闭">
              <Icon icon="mdi:close" />
            </button>
          </div>
        </div>

        <div class="editor-toolbar">
          <button class="btn btn-icon" @click="formatText('bold')" title="加粗">
            <Icon icon="mdi:format-bold" />
          </button>
          <button class="btn btn-icon" @click="formatText('italic')" title="斜体">
            <Icon icon="mdi:format-italic" />
          </button>
          <button class="btn btn-icon" @click="formatText('underline')" title="下划线">
            <Icon icon="mdi:format-underline" />
          </button>
          <div class="toolbar-divider"></div>
          <button class="btn btn-icon" @click="formatText('h1')" title="标题1">
            <Icon icon="mdi:format-header-1" />
          </button>
          <button class="btn btn-icon" @click="formatText('h2')" title="标题2">
            <Icon icon="mdi:format-header-2" />
          </button>
          <button class="btn btn-icon" @click="formatText('h3')" title="标题3">
            <Icon icon="mdi:format-header-3" />
          </button>
          <div class="toolbar-divider"></div>
          <button class="btn btn-icon" @click="formatText('ul')" title="无序列表">
            <Icon icon="mdi:format-list-bulleted" />
          </button>
          <button class="btn btn-icon" @click="formatText('ol')" title="有序列表">
            <Icon icon="mdi:format-list-numbered" />
          </button>
          <button class="btn btn-icon" @click="formatText('blockquote')" title="引用">
            <Icon icon="mdi:format-quote-close" />
          </button>
        </div>

        <div
          ref="editorContent"
          class="editor-content"
          contenteditable="true"
          @input="onEditorInput"
          @focus="saveSelection"
          @mouseup="saveSelection"
          @keyup="saveSelection"
        ></div>

        <div class="editor-footer">
          <div class="tag-input">
            <Icon icon="mdi:tag-outline" class="tag-icon" />
            <input
              v-model="tagInput"
              type="text"
              class="tag-input-field"
              placeholder="添加标签..."
              @keyup.enter="addTag"
            />
            <button class="btn btn-icon" @click="addTag">
              <Icon icon="mdi:plus" />
            </button>
          </div>
          <div class="tag-list">
            <span v-for="tag in editingNote.tags" :key="tag" class="tag-item">
              {{ tag }}
              <button class="tag-remove" @click="removeTag(tag)">
                <Icon icon="mdi:close" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建便签模态框 -->
    <div v-if="showNewNoteModal" class="modal-overlay" @click.self="showNewNoteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建便签</h3>
          <button class="btn btn-icon" @click="showNewNoteModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-text">新建便签模态框将在后续实现...</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-text" @click="showNewNoteModal = false">
            取消
          </button>
          <button class="btn btn-primary" @click="showNewNoteModal = false">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useNoteStore } from '../stores/note.store'

const noteStore = useNoteStore()

// 状态
const activeTab = ref('all')
const searchQuery = ref('')
const showNewNoteModal = ref(false)
const showNoteEditor = ref(false)
const editingNote = ref<any>({
  id: '',
  title: '',
  content: '',
  color: '#FFFFFF',
  pinned: 0,
  tags: []
})
const tagInput = ref('')
const editorContent = ref<HTMLElement | null>(null)
let lastSelection: any = null

// 便签颜色
const noteColors = ref([
  '#FFFFFF', // 白色
  '#FEF3C7', // 浅黄
  '#D1FAE5', // 浅绿
  '#DBEAFE', // 浅蓝
  '#FCE7F3', // 浅粉
  '#E5E7EB', // 浅灰
  '#FEE2E2', // 浅红
  '#EDE9FE', // 浅紫
])

// 计算属性
const allNotes = computed(() => noteStore.notes)
const pinnedNotes = computed(() => noteStore.pinnedNotes)
const recentNotes = computed(() => {
  return [...noteStore.notes].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  }).slice(0, 10)
})

const displayNotes = computed(() => {
  let notes = []
  switch (activeTab.value) {
    case 'pinned':
      notes = pinnedNotes.value
      break
    case 'recent':
      notes = recentNotes.value
      break
    default:
      notes = searchQuery.value ? noteStore.searchResults : allNotes.value
  }

  // 按置顶和时间排序
  return notes.sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return b.pinned - a.pinned // 置顶的在前
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})

// 方法
const getNoteColor = (color: string) => {
  return color || '#FFFFFF'
}

const formatNoteContent = (content: string) => {
  if (!content) return '<p class="empty-content">空便签</p>'

  // 简单的格式化处理
  let formatted = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/^1\. (.*?)$/gm, '<li>$1</li>')

  // 包裹列表项
  if (formatted.includes('<li>')) {
    formatted = formatted.replace(/<li>.*?<\/li>/g, match => {
      if (match.match(/^<li>\d/)) {
        return `<ol>${match}</ol>`
      }
      return `<ul>${match}</ul>`
    })
  }

  return formatted
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const onSearch = () => {
  if (searchQuery.value.trim()) {
    noteStore.searchNotes(searchQuery.value.trim())
  } else {
    noteStore.clearSearch()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  noteStore.clearSearch()
}

const selectNote = (note: any) => {
  editingNote.value = { ...note }
  showNoteEditor.value = true

  nextTick(() => {
    if (editorContent.value) {
      editorContent.value.innerHTML = note.content || ''
    }
  })
}

const toggleNotePin = async (note: any) => {
  try {
    await noteStore.toggleNotePin(note.id, !note.pinned)
  } catch (err) {
    console.error('Error toggling note pin:', err)
  }
}

const editNote = (note: any) => {
  selectNote(note)
}

const deleteNote = async (noteId: string) => {
  if (confirm('确定要删除这个便签吗？此操作不可撤销。')) {
    try {
      await noteStore.deleteNote(noteId)
    } catch (err) {
      console.error('Error deleting note:', err)
    }
  }
}

// 编辑器方法
const openNewNote = () => {
  editingNote.value = {
    id: '',
    title: '',
    content: '',
    color: '#FFFFFF',
    pinned: 0,
    tags: []
  }
  showNoteEditor.value = true

  nextTick(() => {
    if (editorContent.value) {
      editorContent.value.innerHTML = ''
      editorContent.value.focus()
    }
  })
}

const closeNoteEditor = () => {
  showNoteEditor.value = false
}

const setNoteColor = (color: string) => {
  editingNote.value.color = color
}

const toggleEditingNotePin = () => {
  editingNote.value.pinned = editingNote.value.pinned ? 0 : 1
}

const saveNote = async () => {
  try {
    editingNote.value.content = editorContent.value?.innerHTML || ''

    if (editingNote.value.id) {
      // 更新现有便签
      await noteStore.updateNote(editingNote.value.id, {
        title: editingNote.value.title,
        content: editingNote.value.content,
        color: editingNote.value.color,
        pinned: editingNote.value.pinned,
        tags: editingNote.value.tags
      })
    } else {
      // 创建新便签
      await noteStore.createNote({
        title: editingNote.value.title,
        content: editingNote.value.content,
        color: editingNote.value.color,
        pinned: editingNote.value.pinned,
        tags: editingNote.value.tags
      })
    }

    showNoteEditor.value = false
  } catch (err) {
    console.error('Error saving note:', err)
  }
}

const saveSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    lastSelection = selection.getRangeAt(0)
  }
}

const restoreSelection = () => {
  if (lastSelection) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(lastSelection)
  }
}

const formatText = (format: string) => {
  restoreSelection()

  if (!lastSelection) return

  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) return

  const range = lastSelection.cloneRange()
  const selectedText = range.toString()

  let formattedText = selectedText

  switch (format) {
    case 'bold':
      formattedText = `<strong>${selectedText}</strong>`
      break
    case 'italic':
      formattedText = `<em>${selectedText}</em>`
      break
    case 'underline':
      formattedText = `<u>${selectedText}</u>`
      break
    case 'h1':
      formattedText = `<h1>${selectedText}</h1>`
      break
    case 'h2':
      formattedText = `<h2>${selectedText}</h2>`
      break
    case 'h3':
      formattedText = `<h3>${selectedText}</h3>`
      break
    case 'ul':
      formattedText = `<ul><li>${selectedText}</li></ul>`
      break
    case 'ol':
      formattedText = `<ol><li>${selectedText}</li></ol>`
      break
    case 'blockquote':
      formattedText = `<blockquote>${selectedText}</blockquote>`
      break
  }

  range.deleteContents()
  range.insertNode(document.createRange().createContextualFragment(formattedText))

  // 保存新的选择
  saveSelection()
}

const onEditorInput = () => {
  saveSelection()
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !editingNote.value.tags.includes(tag)) {
    editingNote.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  editingNote.value.tags = editingNote.value.tags.filter((t: string) => t !== tag)
}

// 初始化
onMounted(() => {
  noteStore.init()
})
</script>

<style scoped>
.note-view {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 200px;
}

.search-icon {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.note-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  background: var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.tab-btn.active .tab-count {
  background: var(--color-primary);
  color: white;
}

.note-content {
  min-height: calc(100% - 150px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-tertiary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.empty-text {
  font-size: 14px;
  margin-bottom: 24px;
  max-width: 300px;
  line-height: 1.5;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  align-items: start;
}

.note-card {
  background: var(--note-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 400px;
  overflow: hidden;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pinned-badge {
  color: var(--color-primary);
  font-size: 14px;
  flex-shrink: 0;
}

.note-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-card:hover .note-actions {
  opacity: 1;
}

.note-card-content {
  flex: 1;
  overflow: hidden;
  margin-bottom: 16px;
}

.note-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-height: 200px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
}

.note-preview :deep(h1),
.note-preview :deep(h2),
.note-preview :deep(h3) {
  font-size: 1em;
  font-weight: 600;
  margin: 0.5em 0;
  color: var(--color-text-primary);
}

.note-preview :deep(strong) {
  font-weight: 600;
}

.note-preview :deep(em) {
  font-style: italic;
}

.note-preview :deep(u) {
  text-decoration: underline;
}

.note-preview :deep(blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: 12px;
  margin: 0.5em 0;
  color: var(--color-text-secondary);
}

.note-preview :deep(ul),
.note-preview :deep(ol) {
  margin: 0.5em 0;
  padding-left: 20px;
}

.note-preview :deep(li) {
  margin: 0.25em 0;
}

.note-preview :deep(.empty-content) {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.note-card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 12px;
}

.note-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-icon {
  font-size: 14px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.meta-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.note-tag {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

.note-tag-more {
  font-size: 11px;
  color: var(--color-text-tertiary);
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
}

/* 编辑器样式 */
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

.note-editor {
  background: var(--note-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.editor-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  gap: 16px;
}

.editor-title {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  outline: none;
}

.editor-title::placeholder {
  color: var(--color-text-tertiary);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker {
  display: flex;
  gap: 4px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 8px;
}

.editor-content {
  flex: 1;
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  outline: none;
  overflow-y: auto;
  min-height: 300px;
}

.editor-content:empty::before {
  content: '开始输入...';
  color: var(--color-text-tertiary);
}

.editor-footer {
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
}

.tag-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.tag-icon {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-right: 8px;
  flex-shrink: 0;
}

.tag-input-field {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
}

.tag-input-field::placeholder {
  color: var(--color-text-tertiary);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0;
  font-size: 10px;
}

.tag-remove:hover {
  color: var(--color-text-primary);
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.btn-text {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-text:hover {
  color: var(--color-text-primary);
  background: var(--color-background);
}

.btn-icon {
  padding: 8px;
  min-width: 36px;
  min-height: 36px;
}
</style>