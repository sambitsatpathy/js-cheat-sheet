---
paths: ["**/*.tsx", "**/*.css"]
---

# Impeccable Frontend Rules

Follow these rules to avoid "AI slop" and ensure high-quality UI:

## 1. Layout & Spacing
- **Anti-pattern:** Generic SaaS card grids or app UIs made of stacked cards.
- **Rule:** Commit to an explicit aesthetic direction (Editorial/Product). Use a baseline grid for vertical rhythm.
- **Visual Anchor:** Ensure each view has one primary visual anchor.

## 2. Typography
- **Anti-pattern:** Using 'Inter' for everything by default without considering hierarchy.
- **Rule:** Use a fluid type scale. Pay attention to line-height (leading) for readability.

## 3. Color & Contrast
- **Rule:** Use OKLCH for color definitions if possible. Favor tinted neutrals over pure grays. Avoid pure black (#000) for backgrounds; use a deep tinted neutral.

## 4. Interaction
- **Rule:** Motion should only be used where it adds to the hierarchy or provides necessary feedback.
