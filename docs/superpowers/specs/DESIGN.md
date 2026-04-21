# Lin TodoList - UI Design System

## Design Principles

1. **Clarity over decoration** – Every pixel serves a purpose; avoid visual noise.
2. **Consistency breeds familiarity** – Reuse patterns and components across the app.
3. **Progressive disclosure** – Show what’s necessary, reveal more on interaction.
4. **Accessible by default** – Sufficient color contrast, keyboard navigation, and screen‑reader support.
5. **Delightful micro‑interactions** – Subtle animations and feedback make the app feel alive.

## Color System

### Primary Palette

| Role | Light Theme | Dark Theme | Usage |
|------|-------------|------------|-------|
| Primary | `#10B981` | `#10B981` | Main buttons, active states, progress indicators |
| Primary Hover | `#059669` | `#059669` | Hover state of primary elements |
| Primary Light | `#D1FAE5` | `#064E3B` | Backgrounds, highlights |
| Primary Background | `#ECFDF5` | `#064E3B` | Subtle backgrounds, side‑bar selected state |

### Neutral Palette

| Role | Light Theme | Dark Theme | Usage |
|------|-------------|------------|-------|
| Background | `#F9FAFB` | `#111827` | App background |
| Surface | `#FFFFFF` | `#1F2937` | Cards, panels, modals |
| Sidebar | `#F3F4F6` | `#1F2937` | Left navigation background |
| Border | `#E5E7EB` | `#374151` | Divider lines, card borders |
| Border Hover | `#D1D5DB` | `#4B5563` | Hover state of borders |

### Text Palette

| Role | Light Theme | Dark Theme | Usage |
|------|-------------|------------|-------|
| Primary Text | `#111827` | `#F9FAFB` | Headings, body text |
| Secondary Text | `#6B7280` | `#9CA3AF` | Labels, helper text |
| Muted Text | `#9CA3AF` | `#6B7280` | Placeholders, disabled text |
| On Primary | `#FFFFFF` | `#FFFFFF` | Text on primary‑colored backgrounds |

### Priority Colors

| Priority | Light Theme | Dark Theme | Usage |
|----------|-------------|------------|-------|
| High | `#EF4444` | `#FCA5A5` | Important & urgent tasks |
| Medium | `#F59E0B` | `#FBBF24` | Important, not urgent |
| Low | `#3B82F6` | `#93C5FD` | Not important, urgent |
| None | `#D1D5DB` | `#4B5563` | No priority set |

### Status Colors

| Status | Light Theme | Dark Theme | Usage |
|--------|-------------|------------|-------|
| Success | `#10B981` | `#10B981` | Completion, positive feedback |
| Warning | `#F59E0B` | `#F59E0B` | Warnings, cautions |
| Error | `#EF4444` | `#EF4444` | Errors, destructive actions |
| Info | `#3B82F6` | `#3B82F6` | Informational messages |

## Typography

### Font Family
- **System UI font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace**: `"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace` (for code snippets)

### Scale (rem based, 1rem = 16px)

| Size | rem | px | Usage |
|------|-----|----|-------|
| xs | 0.75rem | 12px | Captions, metadata |
| sm | 0.875rem | 14px | Small labels, helper text |
| base | 1rem | 16px | Body text, paragraph |
| lg | 1.125rem | 18px | Sub‑headings, lead text |
| xl | 1.25rem | 20px | Section headings |
| 2xl | 1.5rem | 24px | Page headings |
| 3xl | 1.875rem | 30px | Large headings |
| 4xl | 2.25rem | 36px | Hero text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Fine print, subtle emphasis |
| Regular | 400 | Body text, default weight |
| Medium | 500 | Labels, interactive elements |
| Semibold | 600 | Headings, important labels |
| Bold | 700 | Strong emphasis, call‑to‑action |

### Line Heights

| Scale | Value | Usage |
|-------|-------|-------|
| Tight | 1.25 | Headings, short lines |
| Normal | 1.5 | Body text, paragraphs |
| Relaxed | 1.75 | Long‑form content, readability |

## Spacing & Sizing

### Spacing Scale (multiples of 4px)

| Size | px | rem | Usage |
|------|----|-----|-------|
| xs | 4px | 0.25rem | Tiny gaps, icon padding |
| sm | 8px | 0.5rem | Small padding, compact components |
| md | 12px | 0.75rem | Default padding, form fields |
| lg | 16px | 1rem | Comfortable padding, section spacing |
| xl | 24px | 1.5rem | Large spacing, between major sections |
| 2xl | 32px | 2rem | Extra‑large spacing |
| 3xl | 48px | 3rem | Hero spacing |

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| sm | 4px | Small buttons, input corners |
| md | 8px | Cards, default buttons, dropdowns |
| lg | 12px | Large cards, modals |
| full | 9999px | Pill buttons, avatars |

### Shadows

| Elevation | Value | Usage |
|-----------|-------|-------|
| sm | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle elevation, hover states |
| md | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Cards, floating panels |
| lg | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | Modals, dropdowns |
| inner | `inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)` | Pressed buttons, input focus |

## Iconography

- **Icon set**: [Iconify](https://iconify.design/) – unified icon solution
- **Size scale**: 16px, 20px, 24px, 32px (match spacing scale)
- **Stroke width**: 2px for 24px and below, 2.5px for larger icons
- **Color inheritance**: Icons inherit text color by default; can be overridden with semantic colors

## Components

### 1. Buttons

**Primary Button**
```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 500;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
.btn-primary:focus {
  outline: 2px solid var(--color-primary-light);
  outline-offset: 2px;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button**
```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 500;
  transition: all var(--transition-fast);
}
.btn-secondary:hover {
  background-color: var(--color-bg-sidebar);
  border-color: var(--color-border-hover);
}
```

**Text Button**
```css
.btn-text {
  background-color: transparent;
  color: var(--color-primary);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 500;
  transition: color var(--transition-fast);
}
.btn-text:hover {
  color: var(--color-primary-hover);
}
```

**Icon Button**
```css
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background-color: transparent;
  border: none;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.btn-icon:hover {
  background-color: var(--color-bg-sidebar);
  color: var(--color-text-primary);
}
```

### 2. Inputs & Forms

**Text Input**
```css
.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast);
}
.input:hover {
  border-color: var(--color-border-hover);
}
.input:focus {
  border-color: var(--color-primary);
  outline: none;
}
.input::placeholder {
  color: var(--color-text-muted);
}
```

**Checkbox**
```css
.checkbox {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  appearance: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.checkbox:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  background-image: url("data:image/svg+xml,..."); /* checkmark icon */
}
.checkbox:focus {
  outline: 2px solid var(--color-primary-light);
}
```

**Select Dropdown**
```css
.select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* chevron */
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}
```

### 3. Cards & Panels

**Card**
```css
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}
.card:hover {
  box-shadow: var(--shadow-md);
}
```

**Task Card**
```css
.task-card {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  border-left: 4px solid transparent;
  transition: all var(--transition-normal);
}
.task-card:hover {
  background-color: var(--color-bg-sidebar);
}
.task-card--priority-high {
  border-left-color: var(--color-priority-high);
}
.task-card--completed {
  opacity: 0.6;
  text-decoration: line-through;
}
```

### 4. Navigation

**Sidebar Item**
```css
.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.sidebar-item:hover {
  background-color: var(--color-bg-sidebar);
  color: var(--color-text-primary);
}
.sidebar-item--active {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  border-left: 3px solid var(--color-primary);
}
```

**Top Navigation**
```css
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--spacing-lg);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
```

### 5. Progress & Status

**Progress Bar**
```css
.progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar__fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}
```

**Badge**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
}
.badge--primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
.badge--priority-high {
  background-color: var(--color-priority-high-light);
  color: var(--color-priority-high);
}
```

## Layout

### Grid System

- **Sidebar width**: 220px (fixed)
- **Content area**: Fluid, minimum 600px
- **Detail panel**: 320px (collapsible)
- **Gutters**: 24px between major sections

### Responsive Breakpoints (for window resizing)

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Minimum usable width |
| md | 768px | Default desktop layout |
| lg | 1024px | Comfortable layout |
| xl | 1280px | Wide layout, detail panel always visible |

### Z‑Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| base | 0 | Default |
| dropdown | 10 | Dropdowns, select menus |
| sticky | 20 | Sticky headers |
| modal | 30 | Modals, dialogs |
| popover | 40 | Tooltips, popovers |
| toast | 50 | Notifications, toasts |

## Animation & Transition

### Duration

| Speed | Value | Usage |
|-------|-------|-------|
| fast | 150ms | Hover states, button presses |
| normal | 200ms | Default transitions |
| slow | 300ms | Page transitions, modal appearances |

### Easing Functions

| Function | Value | Usage |
|----------|-------|-------|
| ease‑out | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements |
| ease‑in | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| ease‑in‑out | `cubic-bezier(0.4, 0, 0.2, 1)` | Most UI transitions |

### Keyframe Animations

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide Up**
```css
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Pulse (for attention)**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## Accessibility

### Focus Management
- Visible focus indicators for all interactive elements
- Logical tab order following visual layout
- Skip‑to‑content link at the beginning of each page

### Color Contrast
- Minimum 4.5:1 for normal text, 3:1 for large text
- Color‑alone never used to convey information (supplement with icons/labels)

### Screen Reader Support
- Semantic HTML elements (`<button>`, `<nav>`, `<main>`)
- ARIA labels for icon‑only buttons and complex widgets
- Live regions for dynamic content updates

## Design Tokens (CSS Variables)

All design values are exposed as CSS custom properties for easy theming and consistency:

```css
:root {
  /* Colors */
  --color-primary: #10B981;
  --color-primary-hover: #059669;
  --color-primary-light: #D1FAE5;
  --color-primary-bg: #ECFDF5;
  
  --color-bg: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-bg-sidebar: #F3F4F6;
  
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  
  --color-border: #E5E7EB;
  --color-border-hover: #D1D5DB;
  
  /* Priority colors */
  --color-priority-high: #EF4444;
  --color-priority-medium: #F59E0B;
  --color-priority-low: #3B82F6;
  --color-priority-none: #D1D5DB;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Animation */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
}

[data-theme="dark"] {
  --color-bg: #111827;
  --color-surface: #1F2937;
  --color-bg-sidebar: #1F2937;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-border: #374151;
}
```

## Implementation Notes

1. **CSS Architecture**: Use BEM naming convention for component styles
2. **Scoped Styles**: Vue SFC `<style scoped>` for component‑specific styles
3. **Global Styles**: Shared design tokens and base styles in `src/assets/styles/`
4. **Theme Switching**: Toggle `data-theme` attribute on `<html>` element
5. **Icon Integration**: Use `@iconify/vue` with dynamic icon imports

## Design Assets

- **Figma File**: (Link to be added when created)
- **Icon Set**: [Iconify](https://iconify.design/)
- **Color Tool**: Use [Contrast Ratio Checker](https://contrast-ratio.com/)
- **Font Preview**: [System Font Stack](https://systemfontstack.com/)

---

*This design system is a living document. Update it as the UI evolves.*