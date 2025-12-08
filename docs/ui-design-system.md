# DocuFlow Design System

## Overview

This document outlines the design system implemented for DocuFlow, inspired by world-class SaaS products:

- **Vercel Dashboard** - Clean header, subtle backdrop blur
- **Linear** - Sophisticated sidebar navigation
- **Stripe Dashboard** - Professional stats cards with gradients
- **Notion** - Information hierarchy and readability
- **Claude UI** - Simplicity and whitespace

---

## 🎨 Color Palette

### Brand Colors (Emerald)
```css
--brand-50:  #ecfdf5   /* Backgrounds, highlights */
--brand-100: #d1fae5   /* Light accents */
--brand-200: #a7f3d0   /* Borders, badges */
--brand-500: #10b981   /* Primary actions */
--brand-600: #059669   /* Hover states */
--brand-700: #047857   /* Active states */
```

### Accent Colors
```css
--accent-blue:   #0ea5e9  /* Info, links */
--accent-violet: #8b5cf6  /* AI features */
--accent-amber:  #f59e0b  /* Warnings, pins */
--accent-rose:   #f43f5e  /* Danger, favorites */
```

### Neutral Palette (Slate)
```css
--slate-50:  #f8fafc  /* Page background */
--slate-100: #f1f5f9  /* Card backgrounds */
--slate-200: #e2e8f0  /* Borders */
--slate-400: #94a3b8  /* Placeholder text */
--slate-600: #475569  /* Body text */
--slate-900: #0f172a  /* Headings */
```

---

## 📐 Spacing System (8px Base)

| Token | Size | Usage |
|-------|------|-------|
| `p-1` | 4px  | Tight gaps |
| `p-2` | 8px  | Icon padding |
| `p-3` | 12px | Small components |
| `p-4` | 16px | Card padding (sm) |
| `p-5` | 20px | Card padding (default) |
| `p-6` | 24px | Card padding (md) |
| `p-8` | 32px | Section padding |
| `gap-2` | 8px | Tight flexbox gaps |
| `gap-3` | 12px | Standard gaps |
| `gap-4` | 16px | Card grid gaps |
| `gap-6` | 24px | Section gaps |

---

## 🔤 Typography Hierarchy

```css
/* Page Title */
.text-2xl.font-bold    /* 24px, 700 weight */

/* Section Title */
.text-sm.font-semibold /* 14px, 600 weight */

/* Card Title */
.text-base.font-semibold /* 16px, 600 weight */

/* Body Text */
.text-sm               /* 14px, 400 weight */

/* Caption / Meta */
.text-xs               /* 12px, 400 weight */

/* Tiny Labels */
.text-[10px]           /* 10px, 500 weight */
.text-[11px]           /* 11px, 500 weight */
```

---

## 🎯 Component Design

### Button Variants

| Variant | Usage | Style |
|---------|-------|-------|
| `primary` | Main CTAs | Emerald gradient, white text |
| `secondary` | Secondary actions | White bg, slate border |
| `ghost` | Tertiary actions | Transparent, hover bg |
| `outline` | Outlined buttons | Transparent with border |
| `danger` | Destructive actions | Rose gradient |

### Button Sizes

| Size | Height | Padding | Usage |
|------|--------|---------|-------|
| `sm` | 32px | 12px horizontal | Inline actions |
| `md` | 40px | 16px horizontal | Default |
| `lg` | 48px | 24px horizontal | Hero CTAs |
| `icon` | 40px | Square | Icon-only buttons |

### Card Variants

| Variant | Usage |
|---------|-------|
| `default` | Standard content cards |
| `elevated` | Prominent cards with shadow |
| `bordered` | Emphasis with thicker border |
| `ghost` | Subtle background only |

### Badge Variants

| Variant | Color | Usage |
|---------|-------|-------|
| `default` | Slate | Neutral info |
| `primary` | Emerald | Success, active states |
| `success` | Green | Completed actions |
| `warning` | Amber | Warnings, pending |
| `danger` | Rose | Errors, destructive |
| `info` | Sky | Information |

---

## 📊 Stats Card Design

Inspired by Stripe Dashboard:

```
┌─────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀ (accent line)    │
│                             │
│ Total Documents             │
│ 42 ↗ +12%                   │
│ Last activity: 2024/01/15   │
│                        📄   │
└─────────────────────────────┘
```

### Variants
- `default` - White background, subtle border
- `highlight` - Gradient background (emerald → sky), accent line
- `gradient` - Dark background for emphasis

---

## 🗂️ Sidebar Design (Linear-inspired)

```
┌──────────────────┐
│ 🔷 DocuFlow      │ ← Logo area (h-16)
├──────────────────┤
│                  │
│ WORKSPACE        │ ← Section label
│ ● Documents  42  │ ← Active state: dark bg
│ ○ Archived   3   │ ← Badge with count
│ ○ New            │
│                  │
│ AI FEATURES      │
│ ┌──────────────┐ │
│ │ ✨ AI Summary│ │ ← Feature card
│ │ GPT-4 auto...│ │
│ │ Try now →    │ │
│ └──────────────┘ │
│                  │
├──────────────────┤
│ ○ Analytics      │ ← Bottom nav
│ ○ Settings       │
├──────────────────┤
│ Tip: ⌘K to open  │ ← Footer tip
└──────────────────┘
```

---

## 🃏 Document Card Design

```
┌────────────────────────────────────────┐
│ [📌] [⭐] [🔗] [☐]           (icons)   │
│                                        │
│ Document Title Goes Here               │
│ [Category Badge]                       │
│                                        │
│ Summary text that can span multiple    │
│ lines with proper truncation...        │
│                                        │
│ #tag1  #tag2  #tag3  +2                │
│                                        │
├────────────────────────────────────────┤
│ 📅 2024/01/15  📄 1,234  💬 3   [⚙]    │
└────────────────────────────────────────┘
```

---

## ✨ Animations

### Entrance Animations
```css
.animate-fade-in        /* opacity 0→1, 500ms */
.animate-fade-in-up     /* opacity + translateY 20px→0, 600ms */
.animate-fade-in-scale  /* opacity + scale 0.95→1, 400ms */
```

### Stagger Delays
```css
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
/* ... up to stagger-8 */
```

### Hover Effects
```css
.hover-lift  /* translateY -4px + shadow-xl */
.hover-scale /* scale 1.05 */
.hover-glow  /* shadow-glow */
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet (sidebar appears) |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

### Sidebar Behavior
- `< md`: Hidden (mobile menu)
- `≥ md`: Fixed 256px sidebar

### Grid Layouts
- Stats: `1col → 2col (sm) → 4col (lg)`
- Documents: `1col → 2col (md)`

---

## 🔧 Component File Structure

```
components/
└── ui/
    ├── index.ts          # Export barrel
    ├── Button.tsx        # Button component
    ├── Card.tsx          # Card + subcomponents
    ├── Badge.tsx         # Badge component
    ├── Input.tsx         # Input + Select
    ├── Avatar.tsx        # Avatar + AvatarGroup
    ├── StatCard.tsx      # Statistics card
    ├── Sidebar.tsx       # Linear-style sidebar
    ├── Header.tsx        # Vercel-style header
    ├── DocumentCard.tsx  # Document list item
    ├── ActivityFeed.tsx  # Activity timeline
    └── SearchFilter.tsx  # Search + filter UI
```

---

## Before → After Improvements

### UI Improvements

| Before | After |
|--------|-------|
| Basic sidebar with emoji icons | Linear-style sidebar with Lucide icons, section labels, AI feature card |
| Simple stats display | Stripe-style stat cards with trends, icons, accent lines |
| Inline document list | Card-based grid with hover effects, action menus |
| Basic search form | Expandable filter UI with quick filter badges |
| Plain activity list | Timeline-style feed with colored icons |

### UX Improvements

| Before | After |
|--------|-------|
| Actions always visible | Actions appear on hover (cleaner) |
| No loading states | Skeleton components for loading |
| Basic empty states | Illustrated empty states with CTAs |
| No keyboard hints | Keyboard shortcuts displayed |
| Fixed language toggle | Smooth i18n with persistent preference |

### Code Quality

| Before | After |
|--------|-------|
| Styles mixed in page.tsx | Separated into ui/ components |
| Repetitive badge styles | Consistent Badge component |
| Inline button styles | Variant-based Button component |
| Mixed responsibilities | Clear component boundaries |

---

## Implementation Notes

1. **All components use Tailwind CSS** with custom design tokens in `globals.css`
2. **Dark mode** is supported via `.dark` class on `<html>`
3. **Lucide React** icons are used throughout for consistency
4. **Animations** are CSS-only for performance
5. **Type safety** is enforced with TypeScript interfaces

---

*Last updated: 2024*

