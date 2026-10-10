---
name: Glacier Light
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#006387'
  on-tertiary: '#ffffff'
  tertiary-container: '#007da9'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies pure optical clarity, precision, and crystalline atmosphere. Built as the luminous daytime counterpart to glacial subterranean environments, it merges structural minimalism with high-end editorial glassmorphism. It conveys absolute transparency, composure, and analytical precision.

The target audience encompasses high-velocity knowledge workers, financial operators, and systems architects who require maximum contrast, zero visual fatigue, and an uncompromising standard of craft. The UI evokes cold mountain air, architectural daylight, and polished mineral surfaces.

## Colors

The chromatic architecture is anchored by crystalline whites, cool atmospheric grays, and saturated glacial blues:

- **Primary Canvas & Surfaces**: True crisp white (`#ffffff`) serves as the base for elevated cards, floating sheets, and focus components. The outer root canvas sits on an ultra-pale frost white (`#f8fafc`).
- **Accent Tints**: Selected states, interactive rings, and active pills utilize pale sky rinses: Tier 1 (`#f0f9ff`) and Tier 2 (`#e0f2fe`).
- **Core Primaries**: Directed actions and key metrics leverage deep sky cyan (`#0284c7`), vibrant arctic blue (`#0ea5e9`), and electric ice highlights (`#38bdf8`).
- **Typographic Neutral**: Content hierarchy is maintained through deep slate navy (`#0f172a`) for primary text and headings, cold steel navy (`#334155`) for body and secondary narratives, and muted sub-slate (`#64748b`) for captions and metadata.
- **Borders & Frost Dividers**: Crystalline boundaries use precision hairlines in slate frost (`#e2e8f0`) alongside specular frosted highlights (`rgba(255, 255, 255, 0.7)`).

## Typography

The type scale combines the technical, geometric exactitude of Space Grotesk for display surfaces with the humane balance and high-density readability of Plus Jakarta Sans for operational content.

- Headings utilize Space Grotesk with controlled negative tracking to project razor-sharp crystalline tension without sacrificing optical cadence.
- Body and label copy utilize Plus Jakarta Sans to maximize legibility across translucent panes, pale cyan containers, and high-density data visualizations.
- Label hierarchies emphasize deliberate letter spacing at micro scales (`11px` - `12px`), maintaining stark legibility over frosty background layers.

## Layout & Spacing

The layout is built upon an adaptive 12-column fluid grid system, scaling into an 8-column layout for tablets and a 4-column system for mobile viewports.

- **Breakpoints**: Mobile (up to 639px), Tablet (640px to 1023px), Desktop (1024px to 1439px), and Wide Display (1440px and above).
- **Rhythm**: Layout intervals leverage an incremental 8pt baseline (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 40px).
- **Surface Densities**: Cards and data tiles use internal padding of `space-md` or `space-lg` while element-to-element stack margins default to `space-sm` or `space-md` to preserve visual momentum and negative space.

## Elevation & Depth

Visual hierarchy rejects muddy drop shadows in favor of ambient ice luminescence, backdrop filters, and delicate specular borders:

- **Frosted Translucency**: Floating elements (navigation bars, toolbars, popovers) utilize translucent white surfaces (`rgba(255, 255, 255, 0.75)` to `rgba(255, 255, 255, 0.88)`) paired with `backdrop-filter: blur(16px) saturate(160%)`.
- **Specular Hairlines**: Glass elements are framed with dual-layer border treatments: an outer structural line in `#e2e8f0` and an inner high-key light edge using `inset 0 1px 0 rgba(255, 255, 255, 0.8)`.
- **Atmospheric Ice Shadows**: Elevated components utilize soft, cool-tinted dispersion shadows rather than gray drops:
  - *Resting Level*: `0 1px 3px rgba(15, 23, 42, 0.04), 0 10px 25px -5px rgba(2, 132, 199, 0.06)`
  - *Raised Level*: `0 8px 30px -4px rgba(2, 132, 199, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.03)`

## Shapes

The system relies on an exact level 2 roundedness profile (`0.5rem` / `8px` base curve). This strikes a precise balance between cold geometric precision and modern ergonomics:

- Micro-elements (checkboxes, tags, badges, secondary pills) use `0.375rem` (`6px`) to `0.5rem` (`8px`).
- Standard cards, interactive field inputs, and list rows maintain `0.75rem` (`12px`) to `1rem` (`16px`).
- Modal overlays, bottom sheets, and floating hero panels step up to `1.25rem` (`20px`) through `1.5rem` (`24px`).

## Components

- **Buttons**:
  - *Primary*: Background `#0284c7`, text `#ffffff`, hairline inset `inset 0 1px 0 rgba(255, 255, 255, 0.3)`. Hover transitions to `#0ea5e9` with a subtle ice-glow shadow (`0 0 16px rgba(14, 165, 233, 0.35)`).
  - *Secondary / Frost*: Background `rgba(255, 255, 255, 0.85)`, border `1px solid #e2e8f0`, text `#0f172a`. Hover transitions to `#f0f9ff` and border `#bae6fd`.
  - *Tertiary / Ghost*: Background `transparent`, text `#334155`. Hover transitions to `#f0f9ff` and text `#0284c7`.

- **Cards & Data Modules**:
  - Base cards use solid `#ffffff` or `rgba(255, 255, 255, 0.85)` frosted glass with `1px solid #e2e8f0`.
  - Active, selected, or highlight cards transition their fill to `#f0f9ff` with borders illuminated in `#7dd3fc` and an inner highlight in `rgba(255, 255, 255, 0.9)`.

- **Chips & Pills**:
  - Unselected pills feature `#f8fafc` fill with `#e2e8f0` borders and `#334155` typography.
  - Active filter pills switch dynamically to `#e0f2fe` fill, `#38bdf8` border, and `#0284c7` typography.

- **Input Fields**:
  - Crisp `#ffffff` container, `1px solid #cbd5e1` outline, text `#0f172a`, placeholder `#94a3b8`.
  - Focus state shifts border to `#0ea5e9` with an outward diffuse glow: `0 0 0 3px rgba(14, 165, 233, 0.15)`.

- **Selection Controls (Checkboxes & Radios)**:
  - Resting: `#ffffff` canvas with `#cbd5e1` border.
  - Checked: `#0284c7` fill, white optical check mark, and subtle ice refraction outline.

- **Glacial Metrics & Banners**:
  - Metric counters feature Space Grotesk figures directly accompanied by trend arrows rendered in `#0284c7` on `#e0f2fe` badge surfaces.
