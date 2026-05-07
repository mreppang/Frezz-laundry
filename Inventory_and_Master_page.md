---
name: Aquatic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#424753'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d5'
  surface-tint: '#005ac4'
  primary: '#00459a'
  on-primary: '#ffffff'
  primary-container: '#005cc8'
  on-primary-container: '#cfdcff'
  inverse-primary: '#aec6ff'
  secondary: '#00696e'
  on-secondary: '#ffffff'
  secondary-container: '#80f4fb'
  on-secondary-container: '#007075'
  tertiary: '#414a4f'
  on-tertiary: '#ffffff'
  tertiary-container: '#596267'
  on-tertiary-container: '#d4dde3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004396'
  secondary-fixed: '#80f4fb'
  secondary-fixed-dim: '#61d7de'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#dbe4ea'
  tertiary-fixed-dim: '#bfc8ce'
  on-tertiary-fixed: '#141d21'
  on-tertiary-fixed-variant: '#3f484d'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 32px
  gutter: 24px
  card-padding: 24px
  section-gap: 48px
---

## Brand & Style

The design system for this application is built on the pillars of **efficiency, hygiene, and clarity**. It adopts a **Corporate Modern** aesthetic—blending the reliability of a high-end enterprise tool with the freshness of a premium consumer service. 

The visual direction prioritizes high-contrast legibility and a sense of "digital cleanliness" through generous whitespace and a restricted, cool-toned palette. The goal is to instill trust in the user, ensuring that complex laundry logistics feel organized and manageable. The interface avoids unnecessary ornamentation, focusing instead on structural integrity and task completion.

## Colors

The palette is anchored by **Deep Stream Blue**, a primary color that evokes depth, water, and professional reliability. This is complemented by **Soft Glacial Cyan**, used for high-frequency interactions and highlights to maintain a refreshing feel.

- **Primary**: Used for core actions, branding, and active states.
- **Secondary**: Used for accent elements, iconography backgrounds, and subtle callouts.
- **Neutrals**: A range of cool grays (Slate) to maintain the "clean" atmosphere without the harshness of pure black.
- **Semantic Palette**: Distinct colors for operational statuses. *Pending* uses an amber to signal attention; *Ready* uses a vibrant emerald for completion of service; *Completed* uses a soft indigo to represent archived or settled tasks.

## Typography

This design system utilizes **Inter** exclusively to ensure a systematic and utilitarian feel. The hierarchy is strictly enforced to guide the user through dense data.

- **Headlines**: Use heavy weights and tight letter-spacing for a bold, authoritative presence.
- **Body Text**: Standardized on a 16px baseline for optimal readability on web dashboards.
- **Data Display**: Tabular numbers are activated for tables and metrics to ensure that figures align vertically, aiding quick scanning of weight (kg) or currency.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The side navigation is fixed for constant access to management tools, while the main content area utilizes a 12-column fluid grid.

- **Rhythm**: All spacing is derived from an 8px base unit. 
- **Density**: The interface maintains a "Medium-Airy" density. While laundry management requires seeing many items at once, generous gutters (24px) prevent the UI from feeling cluttered or overwhelming.
- **Vertical Alignment**: Dashboard widgets are aligned to a consistent top-line to maintain a structured, professional appearance.

## Elevation & Depth

To maintain the "clean" aesthetic, this design system avoids heavy shadows. Depth is primarily communicated through **Tonal Layering** and **Low-Contrast Outlines**.

- **Background**: The lowest layer is a very subtle cool-gray tint (#F8FAFC).
- **Cards/Containers**: These sit on the background with a pure white fill and a 1px border (#E2E8F0).
- **Interactive Elevation**: Only when an element is hovered or active does it receive a "Soft Ambient Shadow"—a subtle 10% opacity blue-tinted drop shadow—to simulate the physical lifting of a clean surface.
- **Overlays**: Modals and dropdowns use a backdrop blur (12px) to maintain context while focusing the user on the task at hand.

## Shapes

The shape language is **Soft and Precise**. A 4px (0.25rem) base radius is used for most UI components (inputs, small buttons) to convey efficiency. Larger components like cards and containers use 8px (0.5rem) to soften the overall appearance of the dashboard. This balance ensures the UI feels modern and friendly without losing its professional, "square-jawed" corporate edge.

## Components

### Status Badges
Badges are designed as high-visibility "Pills." They use a light background (10% opacity of the status color) with high-contrast bold text for maximum legibility.
- **Pending**: Amber text on Light Amber.
- **Ready**: Emerald text on Light Emerald.
- **Completed**: Indigo text on Light Indigo.

### Data Tables
Tables are the heart of the management system. They feature:
- Sticky headers for long order lists.
- Zebra striping using the tertiary color (#F0F9FF) for readability.
- Inline actions that appear on hover to reduce visual noise.

### Cards & Data Visualization
- **Cards**: Use a simple white background with a primary blue top-border (2px) to signify active or "fresh" modules.
- **Charts**: Data visualizations should use the primary and secondary colors for the main data series. Use a soft dashed line for "Last Week" comparisons to provide historical context without distracting from current totals.

### Inputs & Buttons
- **Inputs**: Focused states use a 2px secondary cyan glow to represent a "sanitized" or active area.
- **Buttons**: Primary buttons are solid Blue. Secondary buttons are outlined in Blue with a Soft Cyan hover state.