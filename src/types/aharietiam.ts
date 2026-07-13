export interface HonorbladeData {
  id: string
  name: string
  title: string
  order: string
  surges: [string, string]
  quote: string
  description: string
  books: string[]
  status: 'fallen' | 'standing' | 'missing'
  connections: string[]
  assetPath: string
  positionIndex: number
  color: string
  pronunciation?: string
}
