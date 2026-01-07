# Padel Tournament Design System

## Color Palette

The application uses a carefully selected color palette that can be easily updated through CSS variables and Tailwind configuration.

**For detailed color usage examples, see [COLOR_USAGE_GUIDE.md](./COLOR_USAGE_GUIDE.md)**

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary** | `#3E4290` | Main brand color, headers, primary buttons, links |
| **Success** | `#4BA661` | Success states, active items, positive actions, start buttons |
| **Neutral** | `#F7F7F7` | Background, neutral elements |
| **Accent** | `#D8E802` | Highlights, warnings, pause actions, special emphasis |
| **Dark** | `#222222` | Body text, dark elements |
| **Red** | System | Danger actions, errors, delete buttons |

**✅ All buttons and UI elements now use ONLY colors from this palette**

### CSS Variables

Colors are defined as CSS custom properties in `resources/css/app.css`:

```css
:root {
    --color-primary: #3E4290;
    --color-success: #4BA661;
    --color-neutral: #F7F7F7;
    --color-accent: #D8E802;
    --color-dark: #222222;
}
```

### Tailwind Classes

Each color has a full range of shades available (50-900):

- `bg-primary`, `text-primary`, `border-primary`
- `bg-success`, `text-success`, `border-success`
- `bg-neutral`, `text-neutral`, `border-neutral`
- `bg-accent`, `text-accent`, `border-accent`
- `bg-dark`, `text-dark`, `border-dark`

## Typography

### Fonts

#### Raverist (Display Font)
- **Usage**: Headers (h1-h6), titles, display text
- **Weight**: Bold (font-bold)
- **Tailwind Class**: `font-raverist`
- **Files**: 
  - `/public/fonts/Raverist.ttf`
  - `/public/fonts/Raverist.woff2`

#### Gotham (Body Font)
- **Usage**: Body text, paragraphs, UI elements
- **Weight**: Normal (400)
- **Tailwind Class**: `font-gotham` or `font-sans` (default)
- **Files**:
  - `/public/fonts/Gotham-Book.otf`
  - `/public/fonts/Gotham-Book.woff2`

### Typography Rules

1. **All headers** (h1-h6) should use:
   ```jsx
   className="font-raverist font-bold text-primary"
   ```

2. **Body text** uses Gotham by default (no class needed):
   ```jsx
   <p className="text-dark">Body text here</p>
   ```

3. **All buttons** use Gotham font (automatically applied):
   ```jsx
   <button className="font-gotham">Button Text</button>
   ```

4. **Page headers** in AuthenticatedLayout automatically use Raverist bold

## Component Styling

### Buttons

All buttons use **Gotham font** by default.

#### Primary Button
```jsx
<PrimaryButton>
  // Uses bg-primary, text-white, font-gotham
  // Hover: bg-primary-600
</PrimaryButton>
```

#### Secondary Button
```jsx
<SecondaryButton>
  // Uses border-neutral-400, text-dark, font-gotham
  // Hover: bg-neutral-50
</SecondaryButton>
```

#### Danger Button
```jsx
<DangerButton>
  // Uses bg-red-600, text-white, font-gotham
  // Hover: bg-red-500
</DangerButton>
```

### Cards

Event and category cards use:
- Border: `border-neutral-300`
- Hover: `hover:shadow-lg hover:border-primary`
- Title: `font-raverist font-bold text-primary`

### Navigation

- Active links: `border-success text-primary`
- Inactive links: `text-neutral-600 hover:text-dark`

### Forms

- Input borders: `border-neutral-300`
- Focus state: `focus:border-primary focus:ring-primary`
- Labels: `text-dark font-medium`
- Errors: `text-red-600`

## Logo

The application logo is located at `/public/logo/logo.jpeg` and is used in:
- `ApplicationLogo` component
- Navigation header
- Guest layout (login/register pages)

## Updating Colors

To change the color palette:

1. **Update CSS variables** in `resources/css/app.css`:
   ```css
   :root {
       --color-primary: #YOUR_COLOR;
       /* ... other colors */
   }
   ```

2. **Update Tailwind config** in `tailwind.config.js`:
   ```js
   colors: {
       primary: {
           DEFAULT: '#YOUR_COLOR',
           // ... generate shades
       }
   }
   ```

3. Run build:
   ```bash
   npm run build
   ```

## File Structure

```
resources/
├── css/
│   └── app.css                 # CSS variables, font imports
├── js/
│   ├── Components/             # Reusable UI components
│   │   ├── ApplicationLogo.jsx # Logo component
│   │   ├── PrimaryButton.jsx   # Primary button
│   │   ├── SecondaryButton.jsx # Secondary button
│   │   └── ...
│   ├── Layouts/                # Page layouts
│   │   ├── AuthenticatedLayout.jsx
│   │   └── GuestLayout.jsx
│   └── Pages/                  # Application pages
│       ├── Dashboard.jsx
│       ├── Events/
│       ├── Categories/
│       └── ...

public/
├── fonts/                      # Font files
│   ├── Raverist.ttf
│   ├── Raverist.woff2
│   ├── Gotham-Book.otf
│   └── Gotham-Book.woff2
└── logo/                       # Logo assets
    └── logo.jpeg

tailwind.config.js              # Tailwind configuration
```

## Best Practices

1. **Always use Tailwind classes** instead of inline styles
2. **Use semantic color names** (primary, success) not specific colors (blue, green)
3. **Headers always use Raverist bold**
4. **Body text always uses Gotham**
5. **Buttons always use Gotham font**
6. **Maintain consistent spacing** using Tailwind's spacing scale
7. **Use hover and focus states** for interactive elements
8. **Ensure sufficient color contrast** for accessibility

## Examples

### Page Header
```jsx
<AuthenticatedLayout header="My Page Title">
  {/* Header automatically styled with Raverist bold */}
</AuthenticatedLayout>
```

### Card Component
```jsx
<div className="border border-neutral-300 rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all">
  <h3 className="text-lg font-bold font-raverist text-primary mb-2">
    Card Title
  </h3>
  <p className="text-neutral-700">
    Card content in Gotham font
  </p>
</div>
```

### Button Group
```jsx
<div className="flex gap-2">
  <Link
    href={route('item.show', id)}
    className="flex-1 text-center px-3 py-2 text-sm font-medium font-gotham text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
  >
    View
  </Link>
  <Link
    href={route('item.edit', id)}
    className="flex-1 text-center px-3 py-2 text-sm font-medium font-gotham text-dark border border-neutral-400 rounded hover:bg-neutral-100 transition-colors"
  >
    Edit
  </Link>
</div>
```

