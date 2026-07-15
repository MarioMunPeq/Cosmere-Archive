export class InteractionSystem {
  mx = 0
  my = 0
  worldX = 0
  worldY = 0

  updateMouse(sx: number, sy: number, worldX: number, worldY: number): void {
    this.mx = sx
    this.my = sy
    this.worldX = worldX
    this.worldY = worldY
  }
}
