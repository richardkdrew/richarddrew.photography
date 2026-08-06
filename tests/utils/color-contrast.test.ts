import { describe, it, expect } from 'vitest'
import { oklchToLinearSrgb, contrastRatio } from '../../src/utils/color-contrast'

// Direction A token values (see design-system.css after Task 2)
const paper = oklchToLinearSrgb(0.99, 0.002, 80)       // --color-pure, light
const inkDark = oklchToLinearSrgb(0.24, 0.005, 60)     // --color-pure, dark
const ink = oklchToLinearSrgb(0.16, 0.004, 60)         // --color-primary, light
const fgDark = oklchToLinearSrgb(0.95, 0.003, 60)      // --color-primary, dark
const stone = oklchToLinearSrgb(0.45, 0.005, 60)       // --color-secondary, light
const stoneDark = oklchToLinearSrgb(0.65, 0.005, 60)   // --color-secondary, dark
const goldLight = oklchToLinearSrgb(0.64, 0.15, 85)      // --color-interactive, light
const goldDark = oklchToLinearSrgb(0.72, 0.15, 85)       // --color-interactive, dark
const goldHoverLight = oklchToLinearSrgb(0.56, 0.15, 85) // --color-interactive-hover, light (out-of-gamut before clamping; contrast is approximate)
const goldHoverDark = oklchToLinearSrgb(0.80, 0.15, 85)  // --color-interactive-hover, dark

describe('color-contrast: Direction A palette', () => {
  it('primary text on background meets WCAG AA (4.5:1) — light mode', () => {
    expect(contrastRatio(ink, paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('primary text on background meets WCAG AA (4.5:1) — dark mode', () => {
    expect(contrastRatio(fgDark, inkDark)).toBeGreaterThanOrEqual(4.5)
  })

  it('secondary/muted text meets WCAG AA (4.5:1) — light mode', () => {
    expect(contrastRatio(stone, paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('secondary/muted text meets WCAG AA (4.5:1) — dark mode', () => {
    expect(contrastRatio(stoneDark, inkDark)).toBeGreaterThanOrEqual(4.5)
  })

  it('gold accent meets the large-text/UI-component threshold (3:1) — light mode', () => {
    expect(contrastRatio(goldLight, paper)).toBeGreaterThanOrEqual(3.0)
  })

  it('gold accent meets the large-text/UI-component threshold (3:1) — dark mode', () => {
    expect(contrastRatio(goldDark, inkDark)).toBeGreaterThanOrEqual(3.0)
  })

  it('gold hover state meets the large-text/UI-component threshold (3:1) — light mode', () => {
    expect(contrastRatio(goldHoverLight, paper)).toBeGreaterThanOrEqual(3.0)
  })

  it('gold hover state meets the large-text/UI-component threshold (3:1) — dark mode', () => {
    expect(contrastRatio(goldHoverDark, inkDark)).toBeGreaterThanOrEqual(3.0)
  })
})
