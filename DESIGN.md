# Design Brief

## Purpose & Direction
Scientific botanical field analysis tool. Precision instrument aesthetic with organic warmth. Clinical confidence (bounding boxes, percentages, labels) balanced by botanical color grounding.

## Tone & Differentiation
Professional, approachable, trustworthy. Maturity stage colors embedded in detection results — small bud (cool green), big bud (warm yellow), bloom (rose orange) — grounded in flower biology, not arbitrary UI choice.

## Color Palette (OKLCH)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `0.55 0.18 125` | `0.65 0.16 125` | Botanical green, action buttons, focus states |
| Accent | `0.6 0.15 32` | `0.68 0.14 32` | Bloom detection highlight, call-to-action |
| Chart-1 (Small Bud) | `0.55 0.18 125` | `0.65 0.16 125` | Cool green maturity stage indicator |
| Chart-2 (Big Bud) | `0.72 0.18 90` | `0.72 0.18 90` | Warm yellow development indicator |
| Chart-3 (Bloom) | `0.65 0.2 32` | `0.75 0.18 32` | Rose orange bloom indicator |
| Background | `0.98 0.01 70` | `0.14 0.01 50` | Warm cream/dark slate, non-distracting |
| Foreground | `0.2 0.01 60` | `0.92 0.01 80` | Text, high contrast |
| Border | `0.92 0.01 70` | `0.25 0.01 65` | Subtle dividers, minimal noise |

## Typography
- **Display**: Figtree (modern geometric, distinctive headline presence)
- **Body**: Inter (clean, readability at small sizes, scientific precision)
- **Scale**: 3 levels (h1: 32px, h2: 24px, body: 16px, label: 14px)

## Shape & Elevation
- **Radius**: `0.375rem` (6px) — clinical precision, not rounded
- **Shadows**: Subtle (`shadow-subtle`: 1px 3px rgba), elevated (`shadow-elevated`: 4px 12px rgba) — avoid glow
- **Borders**: 1px only, minimal presence, guide visual hierarchy

## Structural Zones

| Zone | Surface | Treatment | Content |
|------|---------|-----------|---------|
| Header | Background | Title + image info | "Jasmine Analyzer" + dimensions/confidence stats |
| Canvas Area | Card | Centered, elevated | Uploaded/captured image or detection canvas |
| Controls | Background | Below canvas, flex row | Upload, Camera buttons OR Detect Objects, Reset buttons |
| Results | Card | Overlay on image or below | Bounding boxes, maturity labels, confidence % |
| Footer | Muted | Minimal text | Legend: stage colors + confidence thresholds |

## Spacing & Rhythm
- Tight functional layout, no wasted space
- Gap: 16px between major sections
- Padding: 24px inside cards, 16px inside buttons
- Dense information layout aligned with scientific precision tool aesthetic

## Component Patterns
- **Buttons**: Primary (solid green background, white text), Secondary (outlined, green border), Destructive (outlined red)
- **Image Canvas**: Max-width centered, respects viewport, SVG overlay for bounding boxes
- **Bounding Boxes**: Stage-colored strokes (3px), labels inside top-left corner with semi-transparent background
- **Confidence Badge**: Icon + percentage, positioned over box label

## Motion & Animation
- **Transitions**: All interactive 0.3s cubic-bezier(0.4, 0, 0.2, 1) — snappy, not bouncy
- **Loading**: Subtle pulse on detection canvas (keyframes optional)
- **Interactions**: Hover darkens button (1–2% lightness), focus ring appears on keyboard nav

## Constraints
- No gradients on backgrounds, gradients only on accent elements (buttons, highlights)
- No bounce animations, no scale transforms on click
- No decorative orbs, blur, or glassmorphism — clinical precision
- All colors use OKLCH via CSS variables, never hex or rgb literals
- Max 2 fonts, max 5 core colors

## Signature Detail
Maturity stage detection labels render in stage-specific border colors directly on bounding boxes — small bud in cool green, big bud in warm yellow, bloom in rose orange. This botanical grounding differentiates from generic object detection UIs.
