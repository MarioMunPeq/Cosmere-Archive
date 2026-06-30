import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'
import type { RelationshipType } from '@/types/relationships'

export interface GraphNode extends SimulationNodeDatum {
  id: string
  name: string
  color: string
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  type: RelationshipType
  label?: string
}
