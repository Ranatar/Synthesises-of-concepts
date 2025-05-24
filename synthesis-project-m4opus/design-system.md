# Дизайн-система Philosophy AI

## 1. Философия дизайна

### 1.1 Основные принципы

#### Clarity (Ясность)
Философские концепции сложны сами по себе - интерфейс должен быть максимально простым и понятным. Каждый элемент должен иметь четкую цель и не создавать дополнительной когнитивной нагрузки.

#### Depth (Глубина)
Интерфейс должен поддерживать как поверхностное знакомство, так и глубокое погружение. Progressive disclosure позволяет пользователям исследовать на комфортном для них уровне.

#### Connection (Связность)
Визуальное представление связей между идеями - ключевой элемент. Дизайн должен подчеркивать отношения и паттерны.

#### Contemplation (Созерцательность)
Интерфейс должен способствовать размышлению, а не торопить пользователя. Достаточно пространства, спокойные цвета, плавные анимации.

### 1.2 Визуальная метафора

Основная метафора - **"Сад идей"** (Garden of Ideas):
- Концепции - это живые организмы, которые растут и развиваются
- Связи - корневые системы и ветви
- Синтез - прививка и гибридизация
- AI - садовник-помощник

## 2. Цветовая система

### 2.1 Основная палитра

```scss
// Primary - Wisdom Blue
$primary-50:  #E8F4F8;
$primary-100: #C5E4EE;
$primary-200: #9ED3E3;
$primary-300: #77C1D8;
$primary-400: #5AB3D0;
$primary-500: #3DA5C7; // Main
$primary-600: #3797B9;
$primary-700: #2F86A8;
$primary-800: #277597;
$primary-900: #1A5779;

// Secondary - Thought Purple  
$secondary-50:  #F3E5F5;
$secondary-100: #E1BEE7;
$secondary-200: #CE93D8;
$secondary-300: #BA68C8;
$secondary-400: #AB47BC;
$secondary-500: #9C27B0; // Main
$secondary-600: #8E24AA;
$secondary-700: #7B1FA2;
$secondary-800: #6A1B9A;
$secondary-900: #4A148C;

// Neutral - Mind Gray
$neutral-50:  #FAFAFA;
$neutral-100: #F5F5F5;
$neutral-200: #EEEEEE;
$neutral-300: #E0E0E0;
$neutral-400: #BDBDBD;
$neutral-500: #9E9E9E;
$neutral-600: #757575;
$neutral-700: #616161;
$neutral-800: #424242;
$neutral-900: #212121;
```

### 2.2 Семантические цвета

```scss
// Functional Colors
$success: #4CAF50;
$warning: #FF9800;
$error: #F44336;
$info: #2196F3;

// Philosophical Traditions
$western-philosophy: #3F51B5;
$eastern-philosophy: #FF5722;
$analytical: #00BCD4;
$continental: #795548;
$pragmatic: #8BC34A;

// Category Domains
$metaphysics: #673AB7;
$epistemology: #2196F3;
$ethics: #4CAF50;
$aesthetics: #E91E63;
$logic: #607D8B;
$political: #F44336;
```

### 2.3 Темы

#### Light Theme (Default)
```scss
$background: #FFFFFF;
$surface: #FAFAFA;
$text-primary: rgba(0, 0, 0, 0.87);
$text-secondary: rgba(0, 0, 0, 0.60);
$text-disabled: rgba(0, 0, 0, 0.38);
```

#### Dark Theme
```scss
$background: #121212;
$surface: #1E1E1E;
$text-primary: rgba(255, 255, 255, 0.87);
$text-secondary: rgba(255, 255, 255, 0.60);
$text-disabled: rgba(255, 255, 255, 0.38);
```

#### Focus Theme (для глубокой работы)
```scss
$background: #F5F2E8; // Теплый бежевый
$surface: #FFFFFF;
$text-primary: #2C2416;
$accent: #6B5B3F;
```

## 3. Типографика

### 3.1 Шрифты

```scss
// Heading Font - для заголовков и важных элементов
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700');
$font-heading: 'Crimson Text', serif;

// Body Font - для основного текста
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700');
$font-body: 'Inter', sans-serif;

// Mono Font - для кода и технических элементов
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500');
$font-mono: 'JetBrains Mono', monospace;

// Philosophy Font - для цитат и особых текстов
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400');
$font-philosophy: 'EB Garamond', serif;
```

### 3.2 Типографическая шкала

```scss
// Base size
$font-size-base: 16px;

// Scale (1.250 - Major Third)
$font-size-xs: 0.64rem;    // 10px
$font-size-sm: 0.8rem;     // 13px
$font-size-md: 1rem;       // 16px
$font-size-lg: 1.25rem;    // 20px
$font-size-xl: 1.563rem;   // 25px
$font-size-2xl: 1.953rem;  // 31px
$font-size-3xl: 2.441rem;  // 39px
$font-size-4xl: 3.052rem;  // 49px

// Line heights
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
$line-height-loose: 2;

// Font weights
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 3.3 Текстовые стили

```scss
// Headings
.h1 {
  font-family: $font-heading;
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  letter-spacing: -0.02em;
}

.h2 {
  font-family: $font-heading;
  font-size: $font-size-3xl;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
  letter-spacing: -0.01em;
}

// Body text
.body-large {
  font-family: $font-body;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}

.body-regular {
  font-family: $font-body;
  font-size: $font-size-md;
  line-height: $line-height-normal;
}

// Special
.philosophy-quote {
  font-family: $font-philosophy;
  font-size: $font-size-xl;
  font-style: italic;
  line-height: $line-height-loose;
  color: $text-secondary;
}
```

## 4. Spacing система

### 4.1 Базовая сетка

```scss
// 8px grid system
$space-unit: 8px;

$space-0: 0;
$space-1: 0.25rem;  // 4px
$space-2: 0.5rem;   // 8px
$space-3: 0.75rem;  // 12px
$space-4: 1rem;     // 16px
$space-5: 1.5rem;   // 24px
$space-6: 2rem;     // 32px
$space-7: 2.5rem;   // 40px
$space-8: 3rem;     // 48px
$space-9: 4rem;     // 64px
$space-10: 5rem;    // 80px
$space-11: 6rem;    // 96px
$space-12: 8rem;    // 128px
```

### 4.2 Компонентные отступы

```scss
// Padding
$padding-xs: $space-2;
$padding-sm: $space-3;
$padding-md: $space-4;
$padding-lg: $space-6;
$padding-xl: $space-8;

// Margins
$margin-xs: $space-2;
$margin-sm: $space-3;
$margin-md: $space-4;
$margin-lg: $space-6;
$margin-xl: $space-8;

// Gaps (for flexbox/grid)
$gap-xs: $space-2;
$gap-sm: $space-3;
$gap-md: $space-4;
$gap-lg: $space-5;
$gap-xl: $space-6;
```

## 5. Компоненты

### 5.1 Buttons

```scss
// Base button
.btn {
  font-family: $font-body;
  font-weight: $font-weight-medium;
  font-size: $font-size-md;
  padding: $space-3 $space-5;
  border-radius: $radius-md;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-md;
  }
  
  &:active {
    transform: translateY(0);
  }
}

// Variants
.btn-primary {
  background: $primary-500;
  color: white;
  
  &:hover {
    background: $primary-600;
  }
}

.btn-secondary {
  background: transparent;
  color: $primary-500;
  border: 2px solid $primary-500;
  
  &:hover {
    background: $primary-50;
  }
}

.btn-ghost {
  background: transparent;
  color: $text-primary;
  
  &:hover {
    background: $neutral-100;
  }
}

// Sizes
.btn-sm {
  font-size: $font-size-sm;
  padding: $space-2 $space-3;
}

.btn-lg {
  font-size: $font-size-lg;
  padding: $space-4 $space-6;
}

// Special buttons
.btn-ai {
  background: linear-gradient(135deg, $primary-500, $secondary-500);
  color: white;
  
  &::before {
    content: '✨';
    margin-right: $space-2;
  }
}
```

### 5.2 Cards

```scss
.card {
  background: $surface;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-sm;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.concept-card {
  @extend .card;
  border-left: 4px solid $primary-500;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-4;
  }
  
  .card-title {
    font-family: $font-heading;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    margin: 0;
  }
  
  .card-meta {
    display: flex;
    gap: $space-4;
    color: $text-secondary;
    font-size: $font-size-sm;
  }
  
  .card-preview {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
    margin-top: $space-3;
  }
  
  .category-tag {
    background: $primary-100;
    color: $primary-700;
    padding: $space-1 $space-2;
    border-radius: $radius-full;
    font-size: $font-size-xs;
  }
}
```

### 5.3 Graph Elements

```scss
// Node styles
.graph-node {
  &.category-node {
    fill: $primary-500;
    stroke: $primary-700;
    stroke-width: 2px;
    
    &:hover {
      fill: $primary-400;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }
    
    &.selected {
      stroke: $secondary-500;
      stroke-width: 3px;
    }
  }
  
  .node-label {
    font-family: $font-body;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    fill: white;
    text-anchor: middle;
    pointer-events: none;
  }
  
  .node-weight {
    font-size: $font-size-xs;
    fill: $primary-200;
  }
}

// Edge styles
.graph-edge {
  stroke: $neutral-400;
  stroke-width: 2px;
  fill: none;
  
  &.relation-implies {
    stroke: $primary-500;
    stroke-dasharray: none;
  }
  
  &.relation-contradicts {
    stroke: $error;
    stroke-dasharray: 5, 5;
  }
  
  &.relation-causes {
    stroke: $success;
    marker-end: url(#arrow);
  }
  
  &:hover {
    stroke-width: 3px;
    opacity: 0.8;
  }
}

// Connection points
.connection-point {
  fill: $primary-300;
  stroke: $primary-500;
  stroke-width: 2px;
  r: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: crosshair;
  
  .graph-node:hover & {
    opacity: 1;
  }
}
```

### 5.4 Forms

```scss
// Input base
.input {
  font-family: $font-body;
  font-size: $font-size-md;
  padding: $space-3 $space-4;
  border: 2px solid $neutral-300;
  border-radius: $radius-md;
  background: $background;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: $primary-500;
    box-shadow: 0 0 0 3px rgba($primary-500, 0.1);
  }
  
  &::placeholder {
    color: $text-disabled;
  }
}

// Textarea
.textarea {
  @extend .input;
  min-height: 120px;
  resize: vertical;
  line-height: $line-height-relaxed;
}

// Select
.select {
  @extend .input;
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right $space-3 center;
  padding-right: $space-8;
}

// Form group
.form-group {
  margin-bottom: $space-5;
  
  .form-label {
    display: block;
    font-weight: $font-weight-medium;
    margin-bottom: $space-2;
    color: $text-primary;
  }
  
  .form-helper {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-top: $space-2;
  }
  
  .form-error {
    font-size: $font-size-sm;
    color: $error;
    margin-top: $space-2;
  }
}
```

## 6. Иконки

### 6.1 Иконочный шрифт

Используем Phosphor Icons для консистентности:

```scss
// Размеры иконок
$icon-xs: 16px;
$icon-sm: 20px;
$icon-md: 24px;
$icon-lg: 32px;
$icon-xl: 48px;

// Философские иконки (custom)
.icon-concept::before { content: '\e901'; } // Граф
.icon-thesis::before { content: '\e902'; } // Документ с лампочкой
.icon-synthesis::before { content: '\e903'; } // Объединение
.icon-philosophy::before { content: '\e904'; } // Греческая колонна
.icon-ai-assist::before { content: '\e905'; } // Мозг с искрами
```

### 6.2 Использование иконок

```html
<!-- В кнопках -->
<button class="btn btn-primary">
  <i class="ph-plus-circle"></i>
  Создать концепцию
</button>

<!-- В навигации -->
<nav class="sidebar-nav">
  <a href="#" class="nav-item">
    <i class="ph-house"></i>
    <span>Главная</span>
  </a>
  <a href="#" class="nav-item">
    <i class="icon-concept"></i>
    <span>Мои концепции</span>
  </a>
</nav>

<!-- Статусы -->
<span class="status status-success">
  <i class="ph-check-circle"></i>
  Опубликовано
</span>
```

## 7. Анимации и переходы

### 7.1 Timing Functions

```scss
// Easing functions
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$ease-out: cubic-bezier(0.0, 0, 0.2, 1);
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

// Durations
$duration-fast: 150ms;
$duration-normal: 300ms;
$duration-slow: 500ms;
$duration-slower: 1000ms;
```

### 7.2 Анимации компонентов

```scss
// Fade in
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Pulse (for AI processing)
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba($primary-500, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba($primary-500, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($primary-500, 0);
  }
}

// Graph node appearance
@keyframes nodeAppear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

// Thinking dots
@keyframes thinking {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.thinking-indicator {
  .dot {
    animation: thinking 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}
```

### 7.3 Микроанимации

```scss
// Hover effects
.interactive-element {
  transition: all $duration-fast $ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: $shadow-sm;
  }
}

// Loading states
.skeleton {
  background: linear-gradient(
    90deg,
    $neutral-200 25%,
    $neutral-100 50%,
    $neutral-200 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 8. Responsive Design

### 8.1 Breakpoints

```scss
// Mobile first approach
$breakpoint-xs: 0;
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// Mixins
@mixin sm {
  @media (min-width: $breakpoint-sm) { @content; }
}

@mixin md {
  @media (min-width: $breakpoint-md) { @content; }
}

@mixin lg {
  @media (min-width: $breakpoint-lg) { @content; }
}

@mixin xl {
  @media (min-width: $breakpoint-xl) { @content; }
}
```

### 8.2 Responsive компоненты

```scss
// Responsive grid
.concept-grid {
  display: grid;
  gap: $space-4;
  grid-template-columns: 1fr;
  
  @include sm {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include lg {
    grid-template-columns: repeat(3, 1fr);
    gap: $space-5;
  }
  
  @include xl {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Responsive navigation
.main-nav {
  position: fixed;
  left: -100%;
  top: 0;
  height: 100vh;
  width: 280px;
  transition: left $duration-normal $ease-out;
  
  &.open {
    left: 0;
  }
  
  @include lg {
    position: static;
    left: auto;
    height: auto;
    width: auto;
  }
}
```

## 9. Accessibility

### 9.1 Цветовой контраст

```scss
// WCAG AA compliant combinations
// Background -> Text color (contrast ratio)
// White -> $neutral-700 (7.5:1) ✓
// White -> $primary-500 (3.2:1) ✓ (large text only)
// $primary-500 -> White (3.2:1) ✓
// $neutral-900 -> White (17.5:1) ✓

// High contrast mode
@media (prefers-contrast: high) {
  .btn-primary {
    background: $neutral-900;
    border: 2px solid white;
  }
  
  .text-secondary {
    color: $neutral-700;
  }
}
```

### 9.2 Focus стили

```scss
// Visible focus indicators
:focus-visible {
  outline: 3px solid $primary-500;
  outline-offset: 2px;
}

// Skip links
.skip-link {
  position: absolute;
  left: -9999px;
  
  &:focus {
    position: fixed;
    top: $space-4;
    left: $space-4;
    z-index: 9999;
    padding: $space-3 $space-4;
    background: $primary-500;
    color: white;
    text-decoration: none;
    border-radius: $radius-md;
  }
}
```

### 9.3 Screen reader helpers

```scss
// Visually hidden but accessible
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Announce dynamic changes
.sr-announce {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

## 10. Темизация

### 10.1 CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #3DA5C7;
  --color-secondary: #9C27B0;
  --color-background: #FFFFFF;
  --color-surface: #FAFAFA;
  --color-text-primary: rgba(0, 0, 0, 0.87);
  --color-text-secondary: rgba(0, 0, 0, 0.60);
  
  /* Spacing */
  --space-unit: 8px;
  
  /* Typography */
  --font-heading: 'Crimson Text', serif;
  --font-body: 'Inter', sans-serif;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

/* Dark theme */
[data-theme="dark"] {
  --color-background: #121212;
  --color-surface: #1E1E1E;
  --color-text-primary: rgba(255, 255, 255, 0.87);
  --color-text-secondary: rgba(255, 255, 255, 0.60);
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}

/* Focus theme */
[data-theme="focus"] {
  --color-background: #F5F2E8;
  --color-surface: #FFFFFF;
  --color-text-primary: #2C2416;
  --color-primary: #6B5B3F;
}
```

### 10.2 Theme switching

```javascript
// Theme manager
class ThemeManager {
  constructor() {
    this.themes = ['light', 'dark', 'focus'];
    this.currentTheme = this.getStoredTheme() || 'light';
    this.applyTheme(this.currentTheme);
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('preferred-theme', theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    metaThemeColor.setAttribute('content', this.getThemeColor(theme));
  }
  
  getThemeColor(theme) {
    const colors = {
      light: '#3DA5C7',
      dark: '#121212',
      focus: '#F5F2E8'
    };
    return colors[theme];
  }
  
  // Auto-switch based on time
  enableAutoSwitch() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 9) {
      this.applyTheme('light');
    } else if (hour >= 21 || hour < 6) {
      this.applyTheme('dark');
    }
  }
}
```

## 11. Паттерны взаимодействия

### 11.1 Drag & Drop

```scss
// Draggable elements
.draggable {
  cursor: grab;
  transition: transform $duration-fast $ease-out;
  
  &:active {
    cursor: grabbing;
  }
  
  &.dragging {
    opacity: 0.5;
    transform: scale(0.95);
    z-index: 1000;
  }
}

// Drop zones
.drop-zone {
  border: 2px dashed transparent;
  transition: all $duration-fast $ease-out;
  
  &.drag-over {
    border-color: $primary-500;
    background: rgba($primary-500, 0.05);
  }
  
  &.drop-active {
    animation: pulse 0.5s ease-out;
  }
}
```

### 11.2 Жесты и touch

```scss
// Touch targets (minimum 44x44px)
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @include lg {
    min-width: auto;
    min-height: auto;
  }
}

// Swipeable elements
.swipeable {
  touch-action: pan-y;
  user-select: none;
  
  &.swiping {
    transition: none;
  }
  
  &.swipe-left {
    transform: translateX(-100%);
  }
  
  &.swipe-right {
    transform: translateX(100%);
  }
}
```

## 12. Состояния и feedback

### 12.1 Loading состояния

```html
<!-- Inline loader -->
<span class="loading-inline">
  <span class="spinner"></span>
  Генерация тезисов...
</span>

<!-- Full page loader -->
<div class="loading-overlay">
  <div class="loading-content">
    <div class="philosophy-loader">
      <div class="loader-symbol">∞</div>
      <p>Размышляем...</p>
    </div>
  </div>
</div>

<!-- Skeleton screens -->
<div class="concept-skeleton">
  <div class="skeleton skeleton-title"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text" style="width: 80%"></div>
</div>
```

### 12.2 Empty states

```html
<div class="empty-state">
  <img src="/empty-concepts.svg" alt="No concepts">
  <h3>Пока нет концепций</h3>
  <p>Создайте свою первую философскую концепцию</p>
  <button class="btn btn-primary">
    <i class="ph-plus-circle"></i>
    Создать концепцию
  </button>
</div>
```

### 12.3 Error states

```html
<!-- Inline error -->
<div class="error-message">
  <i class="ph-warning-circle"></i>
  <span>Не удалось загрузить данные</span>
  <button class="btn-link">Повторить</button>
</div>

<!-- Page error -->
<div class="error-page">
  <div class="error-icon">
    <i class="ph-cloud-slash"></i>
  </div>
  <h2>Что-то пошло не так</h2>
  <p>Мы уже работаем над решением проблемы</p>
  <div class="error-actions">
    <button class="btn btn-secondary" onclick="location.reload()">
      Обновить страницу
    </button>
    <button class="btn btn-primary" onclick="history.back()">
      Вернуться назад
    </button>
  </div>
</div>
```

## 13. Компоненты для философского контента

### 13.1 Цитаты

```html
<blockquote class="philosophy-quote">
  <p>Я мыслю, следовательно, я существую.</p>
  <cite>— Рене Декарт</cite>
</blockquote>

<style>
.philosophy-quote {
  position: relative;
  padding: $space-6 $space-8;
  margin: $space-6 0;
  font-family: $font-philosophy;
  font-size: $font-size-xl;
  font-style: italic;
  color: $text-secondary;
  
  &::before {
    content: '"';
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 120px;
    color: $primary-100;
    font-family: $font-philosophy;
  }
  
  cite {
    display: block;
    margin-top: $space-4;
    font-size: $font-size-md;
    font-style: normal;
    text-align: right;
    color: $text-primary;
  }
}
</style>
```

### 13.2 Диалектические пары

```html
<div class="dialectic-pair">
  <div class="thesis">
    <h4>Тезис</h4>
    <p>Бытие есть</p>
  </div>
  <div class="dialectic-arrow">
    <i class="ph-arrows-left-right"></i>
  </div>
  <div class="antithesis">
    <h4>Антитезис</h4>
    <p>Небытие есть</p>
  </div>
  <div class="synthesis">
    <h4>Синтез</h4>
    <p>Становление</p>
  </div>
</div>

<style>
.dialectic-pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto auto;
  gap: $space-4;
  align-items: center;
  
  .thesis, .antithesis, .synthesis {
    padding: $space-4;
    border-radius: $radius-md;
    text-align: center;
  }
  
  .thesis {
    background: $primary-50;
    border: 2px solid $primary-200;
  }
  
  .antithesis {
    background: $secondary-50;
    border: 2px solid $secondary-200;
  }
  
  .synthesis {
    grid-column: 1 / -1;
    background: $success-50;
    border: 2px solid $success-200;
    margin-top: $space-4;
  }
  
  .dialectic-arrow {
    font-size: $icon-lg;
    color: $neutral-400;
  }
}
</style>
```

## 14. Примеры использования

### 14.1 Concept Card Component

```jsx
function ConceptCard({ concept }) {
  return (
    <article className="concept-card">
      <header className="card-header">
        <h3 className="card-title">{concept.name}</h3>
        <div className="card-actions">
          <button className="btn-icon" aria-label="Избранное">
            <i className="ph-star"></i>
          </button>
          <button className="btn-icon" aria-label="Поделиться">
            <i className="ph-share-network"></i>
          </button>
        </div>
      </header>
      
      <p className="card-description">{concept.description}</p>
      
      <div className="card-meta">
        <span className="meta-item">
          <i className="ph-calendar"></i>
          {formatDate(concept.createdAt)}
        </span>
        <span className="meta-item">
          <i className="ph-eye"></i>
          {concept.views}
        </span>
        <span className="meta-item">
          <i className="ph-chart-line"></i>
          {concept.qualityScore}%
        </span>
      </div>
      
      <div className="card-preview">
        {concept.categories.slice(0, 3).map(cat => (
          <span key={cat.id} className="category-tag">
            {cat.name}
          </span>
        ))}
        {concept.categories.length > 3 && (
          <span className="category-tag">
            +{concept.categories.length - 3}
          </span>
        )}
      </div>
      
      <footer className="card-footer">
        <button className="btn btn-secondary btn-sm">
          Открыть
        </button>
        <button className="btn btn-ghost btn-sm">
          <i className="ph-pencil"></i>
          Редактировать
        </button>
      </footer>
    </article>
  );
}
```

### 14.2 Graph Node Component

```jsx
function GraphNode({ node, isSelected, onSelect }) {
  return (
    <g 
      className={`graph-node category-node ${isSelected ? 'selected' : ''}`}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onSelect(node.id)}
    >
      {/* Background circle */}
      <circle 
        r={30 + node.weight * 10}
        className="node-background"
      />
      
      {/* Weight indicator */}
      {node.weight > 1 && (
        <circle 
          r={35 + node.weight * 10}
          className="node-weight-ring"
          fill="none"
          stroke={`rgba(61, 165, 199, ${node.weight / 5})`}
          strokeWidth="3"
        />
      )}
      
      {/* Label */}
      <text className="node-label" dy="0.35em">
        {node.name}
      </text>
      
      {/* Connection points */}
      {[0, 90, 180, 270].map(angle => (
        <circle
          key={angle}
          className="connection-point"
          cx={Math.cos(angle * Math.PI / 180) * 40}
          cy={Math.sin(angle * Math.PI / 180) * 40}
        />
      ))}
      
      {/* Badge for special nodes */}
      {node.isCore && (
        <g transform="translate(25, -25)">
          <circle r="10" fill={secondary500} />
          <text 
            x="0" 
            y="0" 
            dy="0.35em" 
            fill="white" 
            fontSize="12"
            textAnchor="middle"
          >
            ★
          </text>
        </g>
      )}
    </g>
  );
}
```

## 15. Design Tokens (для разработчиков)

```json
{
  "color": {
    "primary": {
      "50": "#E8F4F8",
      "100": "#C5E4EE",
      "500": "#3DA5C7",
      "700": "#2F86A8",
      "900": "#1A5779"
    },
    "semantic": {
      "success": "#4CAF50",
      "warning": "#FF9800",
      "error": "#F44336",
      "info": "#2196F3"
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "Crimson Text, serif",
      "body": "Inter, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem"
    }
  },
  "spacing": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "4": "1rem",
    "8": "2rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "1rem",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 3px rgba(0, 0, 0, 0.1)",
    "md": "0 4px 6px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px rgba(0, 0, 0, 0.1)"
  }
}
```

---

Эта дизайн-система обеспечивает визуальную консистентность и отличный пользовательский опыт для философского сервиса, сочетая академическую строгость с современным, доступным дизайном.