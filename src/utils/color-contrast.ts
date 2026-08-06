/**
 * Minimal OKLCH → linear-sRGB → WCAG relative-luminance/contrast pipeline.
 * Implements the OKLab conversion matrices from the CSS Color 4 spec.
 * No external dependency — this project is vanilla-first.
 */

type Rgb = [number, number, number]

export function oklchToLinearSrgb(l: number, c: number, hDeg: number): Rgb {
  const hRad = (hDeg * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  const lCubed = l_ ** 3
  const mCubed = m_ ** 3
  const sCubed = s_ ** 3

  const r = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed
  const bl = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.7076147010 * sCubed

  // Clamp to [0, 1] — naive per-channel clipping, not CSS Color 4 gamut mapping.
  // Some Direction A tokens (e.g. gold accent) are out-of-gamut; this produces
  // approximate results for those colors. A proper implementation would use
  // chroma reduction via binary search, but that's out of scope for this
  // one-off verification utility.
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  return [clamp(r), clamp(g), clamp(bl)]
}

export function relativeLuminance([r, g, b]: Rgb): number {
  // r, g, b are already linear-light (pre-gamma) values from the OKLab
  // conversion, which is exactly what the WCAG luminance formula needs.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}
