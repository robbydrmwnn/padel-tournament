# Fonts Directory

This directory contains the custom fonts for the Padel Tournament application.

## Current Font Files

### Raverist Font ✓
- `Raverist.ttf` - TrueType Font
- `Raverist.woff2` - Web Font (optimized)

### Gotham Font (Optional)
To use Gotham font, add these files to this directory:
- `Gotham-Book.woff2` / `Gotham-Book.woff` / `Gotham-Book.ttf`
- `Gotham-Medium.woff2` / `Gotham-Medium.woff` / `Gotham-Medium.ttf`
- `Gotham-Bold.woff2` / `Gotham-Bold.woff` / `Gotham-Bold.ttf`

## Licensing

**IMPORTANT:** 
- **Gotham** is a commercial font by Hoefler&Co. You must purchase a license from https://www.typography.com/fonts/gotham/overview
- **Raverist** may also require a commercial license. Please verify licensing before use.

## Font Usage

You can use the fonts in your components with Tailwind classes:

```jsx
// Use Raverist for headings/display text
<h1 className="font-raverist">This text uses Raverist</h1>

// Use Gotham (once added)
<div className="font-gotham">This text uses Gotham</div>

// Default sans font (Gotham if available, otherwise Figtree)
<p className="font-sans">This text uses the default font</p>
```

