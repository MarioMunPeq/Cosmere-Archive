/**
 * Part II — Biographical Records.
 *
 * A record is one spread: the portrait plate and the identity ledger face the
 * biography, so a record never shares a spread with the next one. The thumb
 * index groups the alphabet into eight equal letter ranges (A–C … W–Z); those
 * ranges are also the contents page's sections, which keeps the printed index
 * and the fore-edge tabs on the same divisions.
 */

import type { Character } from '@/types/character'
import type { CodexSection } from './codex-pages'

/** Eight tabs fit a normal codex page without turning into a ladder. */
export const RECORD_RANGE_COUNT = 8

export interface RecordRange {
  /** Stable URL-safe id, e.g. `records-a-c`. */
  id: string
  /** Printed range, e.g. `A–C`. */
  label: string
  from: string
  to: string
  count: number
  /** The spread the tab opens. */
  firstSpreadId: string
  /** Every record in the range, alphabetically. */
  records: Character[]
}

export function recordSpreadId(characterId: string): string {
  return `record-${characterId}`
}

export function sortRecords(records: readonly Character[]): Character[] {
  return [...records].sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

function firstLetter(record: Character): string {
  return record.name.charAt(0).toUpperCase()
}

/**
 * Divide A–Z into `rangeCount` contiguous ranges using the same arithmetic as
 * an alphabet divided into equal shelves. Empty ranges are omitted; the first
 * and last ranges still run from A–C and W–Z for the current eight-way split.
 */
export function buildRecordRanges(records: readonly Character[], rangeCount = RECORD_RANGE_COUNT): RecordRange[] {
  if (!Number.isInteger(rangeCount) || rangeCount < 1 || rangeCount > 26) {
    throw new RangeError('rangeCount must be an integer between 1 and 26')
  }

  const sorted = sortRecords(records)
  const ranges: RecordRange[] = []
  const boundaries = Array.from({ length: rangeCount + 1 }, (_, index) => Math.floor((index * 26) / rangeCount))

  for (let index = 0; index < rangeCount; index += 1) {
    const from = String.fromCharCode(65 + boundaries[index]!)
    const to = String.fromCharCode(65 + boundaries[index + 1]! - 1)
    const inRange = sorted.filter((record) => {
      const letter = firstLetter(record)
      return letter >= from && letter <= to
    })
    if (inRange.length === 0) continue

    ranges.push({
      id: `records-${from.toLowerCase()}-${to.toLowerCase()}`,
      label: `${from}–${to}`,
      from,
      to,
      count: inRange.length,
      firstSpreadId: recordSpreadId(inRange[0]!.id),
      records: inRange,
    })
  }

  return ranges
}

/**
 * One section per record, two leaves per section. Block 5 supplies the record
 * content; the pagination model is already final here so thumb tabs and deep
 * links can point at it before the plate is drawn.
 */
export function buildRecordSections(records: readonly Character[]): CodexSection[] {
  return sortRecords(records).map((record) => {
    const leftId = recordSpreadId(record.id)
    return {
      leaves: [
        {
          id: leftId,
          title: record.name,
          characterIds: [record.id],
          view: 'record',
        },
        {
          id: `${leftId}-right`,
          title: record.name,
          characterIds: [record.id],
          view: 'record',
        },
      ],
    }
  })
}
