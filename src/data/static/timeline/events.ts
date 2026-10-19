export interface TimelineEvent {
  id: string
  title: string
  description: string
  year: number
  endYear?: number
  type: 'historical' | 'book' | 'cataclysm' | 'discovery' | 'birth' | 'death' | 'arrival' | 'departure'
  saga: string
  planets: string[]
  characters?: string[]
  worldhoppers?: string[]
  importance: number
  archivistNote?: string
}
import eventsData from '@/data/generated/events.json'

/**
 * The 118 events, generated from content/events/.
 *
 * The largest collection in the archive, and the one where duplication
 * would have cost the most: a timeline is only as good as its completeness,
 * and a copy that silently stopped receiving events would look like history
 * that had not happened.
 *
 * saga holds a **series**, not an era. That mismatch between the field
 * name and the taxonomy it points at is the reason the generator validates
 * against series.json and not eras.json.
 */
export const TIMELINE_EVENTS: TimelineEvent[] = eventsData as TimelineEvent[]
