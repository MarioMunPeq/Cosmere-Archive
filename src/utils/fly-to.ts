export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function calculateFlyTarget(
  planetX: number,
  planetY: number,
  targetZoom: number,
  viewBoxCenterX = 450,
  viewBoxCenterY = 300,
): { x: number; y: number } {
  return {
    x: viewBoxCenterX - planetX * targetZoom,
    y: viewBoxCenterY - planetY * targetZoom,
  }
}
