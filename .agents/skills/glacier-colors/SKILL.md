---
name: glacier-colors
description: Guidance and instructions for selecting colors and theme tokens for the Careto project using Glacier design system files (`design/glacier-design-system.md` and `design/glacier-light-design-system.md`).
---

# Overview
This skill mandates checking and adhering to the Glacier design specifications in `design/` whenever selecting colors, styling components, or mapping theme variables in the **Careto** codebase.

# Design Files Reference
- **Glacier Dark**: [design/glacier-design-system.md](file:///Users/degtyar/code/ydegtyar/careta/design/glacier-design-system.md)
  - Base Background: `#0a0e1a`
  - Primary Accent: Ice-blue `#7dd3fc`
  - Glass Container: `rgba(15, 21, 36, 0.6)` with `backdrop-filter: blur(16px)` and border `rgba(125, 211, 252, 0.1)`
  - Tertiary Accent: Soft lavender `#c8a0f0`
- **Glacier Light**: [design/glacier-light-design-system.md](file:///Users/degtyar/code/ydegtyar/careta/design/glacier-light-design-system.md)
  - Base Background: Frost white `#faf8ff` / `#f8fafc`
  - Core Primary: Deep sky cyan `#0284c7`, arctic blue `#0ea5e9`
  - Secondary Container: `#39b8fd` / pale cyan `#e0f2fe`
  - Surface Glass: Translucent crisp white `rgba(255, 255, 255, 0.85)` with hairline border `#e2e8f0`

# Guidelines
1. **Always Check Design Files First**: Before picking or hardcoding custom color values or adding MUI theme overrides, consult `design/glacier-design-system.md` and `design/glacier-light-design-system.md`.
2. **Use Theme CSS Variables / MUI Tokens**: Prefer MUI theme tokens (e.g. `var(--mui-palette-primary-main)`, `var(--mui-palette-background-paper)`) or theme-derived color variables over hardcoded hex values in inline styles.
3. **Glassmorphism Discipline**:
   - Dark mode surfaces must retain the frosted ice aesthetic with translucent backgrounds and subtle luminous borders.
   - Light mode surfaces must feature clean specular hairlines, subtle ice-glow shadows, and translucent white cards.
4. **Contrast & Hierarchy**: Ensure text colors comply with `on-surface` / `on-background` palettes (`#0f172a` for primary text in light mode, `#e0e8f0` in dark mode).
