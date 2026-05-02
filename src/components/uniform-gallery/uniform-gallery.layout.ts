export interface LayoutItem {
  aspectRatio: number
  width: number
}

export interface LayoutRow {
  items: LayoutItem[]
  height: number
  isLastRow: boolean
}

export function computeRows(
  aspectRatios: number[],
  containerWidth: number,
  targetHeight: number,
  gap: number,
  minRowRatio: number
): LayoutRow[] {
  if (containerWidth <= 0 || aspectRatios.length === 0) return []

  const minHeight = targetHeight * minRowRatio
  const rows: LayoutRow[] = []
  let currentARs: number[] = []
  let currentSum = 0

  for (const ar of aspectRatios) {
    const candidateSum = currentSum + ar
    const gaps = gap * currentARs.length
    const candidateHeight = (containerWidth - gaps) / candidateSum

    if (currentARs.length > 0 && candidateHeight < minHeight) {
      rows.push(finaliseRow(currentARs, currentSum, containerWidth, gap, false, targetHeight))
      currentARs = [ar]
      currentSum = ar
    } else {
      currentARs.push(ar)
      currentSum = candidateSum
    }
  }

  if (currentARs.length > 0) {
    rows.push(finaliseRow(currentARs, currentSum, containerWidth, gap, true, targetHeight))
  }

  return rows
}

function finaliseRow(
  ars: number[],
  sumAR: number,
  containerWidth: number,
  gap: number,
  isLastRow: boolean,
  targetHeight: number
): LayoutRow {
  const height = isLastRow
    ? targetHeight
    : (containerWidth - gap * (ars.length - 1)) / sumAR
  return {
    items: ars.map(ar => ({ aspectRatio: ar, width: ar * height })),
    height,
    isLastRow
  }
}
