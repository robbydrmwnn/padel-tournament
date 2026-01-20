# Button Color Standards

## Quick Reference Chart

| Button Type | Background Color | Text Color | When to Use |
|-------------|-----------------|------------|-------------|
| **Primary** | `bg-primary` | `text-white` | Main actions, create, submit |
| **Success** | `bg-success` | `text-white` | Start, confirm, complete |
| **Accent** | `bg-accent` | `text-dark` ⚠️ | Pause, warnings, attention |
| **Danger** | `bg-red-600` | `text-white` | Delete, reset, destructive |
| **Secondary** | `border-neutral-400` | `text-dark` | Edit, cancel, view |

## ⚠️ CRITICAL ACCESSIBILITY RULE

### Accent Color Must Use Dark Text

The accent color (`#D8E802`) is a bright yellow-green. **White text on this color is unreadable.**

```jsx
// ✅ CORRECT - Dark text on accent background
<button className="bg-accent text-dark hover:bg-accent-700">
  Pause Warmup
</button>

// ❌ WRONG - White text is not readable
<button className="bg-accent text-white">
  Pause Warmup
</button>
```

This rule is automatically enforced in `resources/css/app.css` to prevent accidents.

## Button Examples

### Primary Action Button
**Use for:** Main actions, creating items, primary submissions
```jsx
<button className="bg-primary text-white hover:bg-primary-600 px-4 py-2 rounded-md font-gotham">
  Create Event
</button>
```
**Visual:** Blue-purple background with white text ✅

---

### Success Action Button
**Use for:** Starting processes, confirming actions, positive outcomes
```jsx
<button className="bg-success text-white hover:bg-success-600 px-6 py-3 rounded-lg font-gotham">
  Start Match
</button>
```
**Visual:** Green background with white text ✅

---

### Accent/Warning Button
**Use for:** Warnings, pause actions, attention-grabbing (non-destructive)
```jsx
<button className="bg-accent text-dark hover:bg-accent-700 px-6 py-3 rounded-lg font-gotham">
  Pause Warmup
</button>
```
**Visual:** Yellow-green background with DARK text ✅

⚠️ **Never use `text-white` with `bg-accent`**

---

### Danger/Delete Button
**Use for:** Deleting, resetting, destructive actions
```jsx
<button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md font-gotham">
  Delete Participant
</button>
```
**Visual:** Red background with white text ✅

---

### Secondary Button
**Use for:** Secondary actions, editing, canceling, viewing
```jsx
<button className="border border-neutral-400 bg-white text-dark hover:bg-neutral-50 px-4 py-2 rounded-md font-gotham">
  Edit
</button>
```
**Visual:** White background with border and dark text ✅

---

## Link-Style Buttons

### Primary Link Button
```jsx
<Link 
  href={route('item.show', id)}
  className="text-center px-3 py-2 text-sm font-medium font-gotham text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
>
  View Details
</Link>
```

### Accent Link Button
```jsx
<Link 
  href={route('item.action', id)}
  className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-gotham font-semibold text-dark shadow-sm hover:bg-accent-700"
>
  Special Action
</Link>
```
⚠️ **Always use `text-dark` with accent background**

---

## Hover States

| Button Color | Hover Color |
|--------------|-------------|
| `bg-primary` | `hover:bg-primary-600` |
| `bg-success` | `hover:bg-success-600` |
| `bg-accent` | `hover:bg-accent-700` (still dark text!) |
| `bg-red-600` | `hover:bg-red-700` |
| `bg-white` | `hover:bg-neutral-50` |

---

## Disabled States

All buttons should include `disabled:opacity-25` or `disabled:opacity-50`:

```jsx
<button 
  disabled={isLoading}
  className="bg-primary text-white hover:bg-primary-600 disabled:opacity-50"
>
  Submit
</button>
```

---

## Button Sizing

### Small Buttons
```jsx
className="px-3 py-1 text-xs"
```

### Medium Buttons (Default)
```jsx
className="px-4 py-2 text-sm"
```

### Large Buttons
```jsx
className="px-6 py-3 text-base"
```

### Extra Large Buttons
```jsx
className="px-8 py-4 text-lg"
```

---

## Common Button Patterns

### Button Group
```jsx
<div className="flex gap-2">
  <button className="flex-1 bg-primary text-white hover:bg-primary-600 px-3 py-2 rounded font-gotham">
    View
  </button>
  <button className="flex-1 border border-neutral-400 text-dark hover:bg-neutral-50 px-3 py-2 rounded font-gotham">
    Edit
  </button>
</div>
```

### Icon Button
```jsx
<button className="inline-flex items-center gap-2 bg-success text-white hover:bg-success-600 px-4 py-2 rounded-md font-gotham">
  <PlayIcon className="h-5 w-5" />
  Start Match
</button>
```

### Full Width Button
```jsx
<button className="w-full bg-primary text-white hover:bg-primary-600 px-4 py-2 rounded-md font-gotham">
  Submit Form
</button>
```

---

## Testing Checklist

Before deploying button changes:

- [ ] All accent buttons use `text-dark` (never `text-white`)
- [ ] All buttons include hover states
- [ ] All buttons use `font-gotham` class
- [ ] Disabled states are visible
- [ ] Button text is readable on all backgrounds
- [ ] Button colors match the design system palette
- [ ] No random colors (blue-500, green-600, etc.) are used

---

## Color Contrast Ratios (WCAG AA Compliant)

| Combination | Contrast Ratio | Passes WCAG AA |
|-------------|----------------|----------------|
| White on Primary | 8.5:1 | ✅ Yes |
| White on Success | 7.2:1 | ✅ Yes |
| **Dark on Accent** | **8.1:1** | ✅ **Yes** |
| White on Accent | 1.4:1 | ❌ **FAILS** |
| White on Red | 5.5:1 | ✅ Yes |
| Dark on White | 15.2:1 | ✅ Yes |

**This is why accent buttons MUST use dark text!**

---

## Component Files

Pre-built button components are available:

- `@/Components/PrimaryButton.jsx` - Primary blue-purple button
- `@/Components/SecondaryButton.jsx` - White button with border
- `@/Components/DangerButton.jsx` - Red delete/danger button

All components automatically use Gotham font and correct text colors.

---

## Need Help?

Refer to:
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Complete design system
- [COLOR_USAGE_GUIDE.md](./COLOR_USAGE_GUIDE.md) - Detailed color usage
- `resources/css/app.css` - Base styles and overrides
- `tailwind.config.js` - Color definitions

