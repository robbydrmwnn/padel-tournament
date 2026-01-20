# Color Usage Guide

This guide shows how each color in our palette is used throughout the application.

## Color Palette

| Color Name | Hex Code | Purpose |
|------------|----------|---------|
| **Primary** | `#3E4290` | Brand color, headers, primary actions |
| **Success** | `#4BA661` | Success states, positive actions, active indicators |
| **Neutral** | `#F7F7F7` | Backgrounds, neutral states |
| **Accent** | `#D8E802` | Highlights, special emphasis, warnings |
| **Dark** | `#222222` | Body text, dark elements |
| **Red** | (System) | Danger actions, errors, delete buttons |

## Button Color Usage

### Primary Actions
**Color:** Primary (`#3E4290`)
**Usage:** Main actions, create buttons, submit buttons
```jsx
<button className="bg-primary hover:bg-primary-600 text-white">
  Create Event
</button>
```

### Success Actions
**Color:** Success (`#4BA661`)
**Usage:** Positive actions, start/confirm actions, completion
```jsx
<button className="bg-success hover:bg-success-600 text-white">
  Start Match
</button>
```

### Warning/Attention Actions
**Color:** Accent (`#D8E802`)
**Usage:** Pause, warning states, attention-grabbing actions
**⚠️ IMPORTANT:** Accent buttons MUST use dark text (never white) for readability
```jsx
<button className="bg-accent hover:bg-accent-700 text-dark">
  Pause Warmup
</button>
```

### Danger/Delete Actions
**Color:** Red (System)
**Usage:** Delete, reset, destructive actions
```jsx
<button className="bg-red-600 hover:bg-red-700 text-white">
  Delete Participant
</button>
```

### Secondary Actions
**Color:** Neutral with Dark text
**Usage:** Edit, cancel, secondary options
```jsx
<button className="border border-neutral-400 text-dark hover:bg-neutral-50">
  Edit
</button>
```

## Alert/Message Colors

### Success Messages
**Color:** Success background with dark text
```jsx
<div className="bg-success-50 border border-success-200 text-success-800">
  Operation successful!
</div>
```

### Error Messages
**Color:** Red background with dark text
```jsx
<div className="bg-red-50 border border-red-200 text-red-800">
  An error occurred!
</div>
```

### Warning Messages
**Color:** Accent background with dark text
```jsx
<div className="bg-accent-50 border border-accent-200 text-accent-800">
  Please note: Important information
</div>
```

### Info Messages
**Color:** Primary background with dark text
```jsx
<div className="bg-primary-50 border border-primary-200 text-primary-800">
  Here's some helpful information
</div>
```

## Status Badge Colors

### Draft/Upcoming
**Color:** Neutral
```jsx
<span className="bg-neutral-200 text-dark">
  Draft
</span>
```

### Active/In Progress
**Color:** Success
```jsx
<span className="bg-success-100 text-success-800">
  Active
</span>
```

### Completed
**Color:** Primary
```jsx
<span className="bg-primary-100 text-primary-800">
  Completed
</span>
```

### Cancelled/Stopped
**Color:** Red
```jsx
<span className="bg-red-100 text-red-800">
  Cancelled
</span>
```

## Match Monitor Colors

### Team 1 (Left Side)
**Color:** Success (`#4BA661`)
```jsx
<div className="text-success">
  Team 1 Score
</div>
```

### Team 2 (Right Side)
**Color:** Primary (`#3E4290`)
```jsx
<div className="text-primary">
  Team 2 Score
</div>
```

### Leading Score
**Color:** Accent (`#D8E802`)
```jsx
<div className="text-accent">
  Leading Score
</div>
```

### Warmup Timer
**Color:** Accent (`#D8E802`)
```jsx
<div className="text-accent">
  Countdown Timer
</div>
```

## Link Colors

### Primary Links
**Color:** Primary
```jsx
<Link className="text-primary hover:text-primary-700">
  View Details
</Link>
```

### Navigation Links (Active)
**Color:** Primary text with Success border
```jsx
<Link className="text-primary border-success">
  Dashboard
</Link>
```

### Navigation Links (Inactive)
**Color:** Neutral
```jsx
<Link className="text-neutral-600 hover:text-dark">
  Events
</Link>
```

## Card/Container Colors

### Default Cards
```jsx
<div className="bg-white border border-neutral-300">
  Card Content
</div>
```

### Hover State
```jsx
<div className="hover:border-primary hover:shadow-lg">
  Interactive Card
</div>
```

### Accent Containers
```jsx
<div className="bg-accent-50 border border-accent-200">
  Special Content
</div>
```

## Form Elements

### Input Fields
```jsx
<input className="border-neutral-300 focus:border-primary focus:ring-primary" />
```

### Labels
```jsx
<label className="text-dark font-medium">
  Field Name
</label>
```

### Errors
```jsx
<p className="text-red-600">
  This field is required
</p>
```

## Typography Colors

### Headers (h1-h6)
**Color:** Primary
**Font:** Raverist Bold
```jsx
<h1 className="text-primary font-raverist font-bold">
  Page Title
</h1>
```

### Body Text
**Color:** Dark
**Font:** Gotham
```jsx
<p className="text-dark">
  Body content here
</p>
```

### Muted Text
**Color:** Neutral 600-700
```jsx
<p className="text-neutral-600">
  Secondary information
</p>
```

## Quick Reference

### When to Use Each Color

| Situation | Color Choice |
|-----------|--------------|
| Page headers | Primary |
| Main action buttons | Primary |
| Success feedback | Success |
| Start/Go actions | Success |
| Warnings/Pause | Accent |
| Highlights | Accent |
| Danger/Delete | Red |
| Body text | Dark |
| Backgrounds | Neutral |
| Borders | Neutral-300 |
| Active nav items | Primary text + Success border |
| Card hover | Primary border |

## Color Accessibility

All color combinations have been tested for WCAG AA compliance:
- ✅ Dark text on Neutral backgrounds
- ✅ White text on Primary backgrounds
- ✅ White text on Success backgrounds
- ✅ **Dark text on Accent backgrounds (REQUIRED - white text is not readable)**
- ✅ White text on Red backgrounds

### Critical Accessibility Rule

**⚠️ ACCENT COLOR BUTTONS:**
The accent color (#D8E802) is a bright yellow-green. Always use `text-dark` with accent backgrounds:

```jsx
// ✅ CORRECT
<button className="bg-accent text-dark">Click Me</button>

// ❌ WRONG - Poor contrast, hard to read
<button className="bg-accent text-white">Click Me</button>
```

This rule is enforced automatically in `resources/css/app.css` using `!important` to prevent accidental misuse.

## Updating Colors

If you need to change a color:

1. Update `resources/css/app.css`:
   ```css
   :root {
       --color-primary: #NEW_COLOR;
   }
   ```

2. Update `tailwind.config.js`:
   ```js
   colors: {
       primary: {
           DEFAULT: '#NEW_COLOR',
           // ... shades
       }
   }
   ```

3. Rebuild assets:
   ```bash
   npm run build
   ```

All instances will automatically update throughout the application!

