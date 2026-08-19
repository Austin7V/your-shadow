# Design Tokens

## Typography

- Font family: Inter
- Font weights: 400, 500, 600, 700

## Color Tokens

| Token | Light theme | Dark theme |
| --- | --- | --- |
| Background | `#f8fafc` | `#0f1117` |
| Surface | `#ffffff` | `#171b22` |
| Primary | `#14b8a6` | `#2dd4bf` |
| Primary hover | `#0f9488` | `#5eead4` |
| Foreground | `#1f2937` | `#f5f7fa` |
| Muted foreground | `#6b7280` | `#b5bcc8` |
| Success | `#22c55e` | `#4ade80` |
| Warning | `#f59e0b` | `#fbbf24` |
| Error | `#ef4444` | `#f87171` |
| Safety | `#3b82f6` | `#60a5fa` |

## Spacing

Use Tailwind spacing values based on a 4px scale.

## Radius

- Small: `0.375rem`
- Medium: `0.625rem`
- Large: `1rem`
- Extra large: `1.5rem`

## Accessibility

- Use semantic color tokens instead of hard-coded colors.
- Use `ring` tokens for visible keyboard focus states.
- Safety, success, warning, and error states must remain visually distinct.