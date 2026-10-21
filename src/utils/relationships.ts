/**
 * Relationship resolution — one answer per person, labelled from the viewer's
 * side.
 *
 * ## The two bugs this replaces
 *
 * The Records card used to walk `CHARACTER_RELATIONSHIPS` directly and push a
 * row for every entry that mentioned the subject. Because a pair is stored in
 * both directions when both labels are wanted, Adolin's card listed Shallan
 * twice: once as "Wife" (correct) and once as "Husband" (Adolin's own role,
 * read from the mirrored row). Vin's card called Elend her wife for the same
 * reason. The duplicate also desynchronised the index count from the list
 * length, because the index counts distinct people and the card counted rows.
 *
 * ## The rule
 *
 * `label` names the **first** character of a row (see
 * `src/types/relationships.ts`). For a subject and one other person, the
 * answer is therefore:
 *
 *   1. a row where the other person is first — its `label` is exactly what the
 *      subject's card should print;
 *   2. otherwise that row's `inverseLabel`, when the neutral type word would be
 *      false ("Uncle", "Mentor", "Liege");
 *   3. otherwise the neutral word for the type ("Spouse", "Ally", "Rival").
 *
 * No gender is inferred from names, and no label is invented. A relationship
 * the table cannot phrase from both sides is described by its type, which is
 * imprecise but never wrong.
 */

import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { RELATIONSHIP_LABELS } from '@/types/relationships'
import type { CharacterRelationship, RelationshipType } from '@/types/relationships'

/** One link as a record page needs it: who, what they are, and the machine type. */
export interface RelationshipLink {
  otherId: string
  label: string
  type: RelationshipType
}

/** The answer for one person inside one pair, before a fallback is applied. */
interface Endpoint {
  type: RelationshipType
  label?: string
}

/** Order-independent key, so a pair is one pair whichever row mentions it. */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

/**
 * Build `pair -> (person -> endpoint)` from the table.
 *
 * `label` populates the first character; `inverseLabel` populates the second.
 * Nothing is overwritten: the first label written for each person wins, which
 * keeps the result stable if a row is duplicated by mistake.
 */
function buildIndex(table: readonly CharacterRelationship[]): Map<string, Map<string, Endpoint>> {
  const index = new Map<string, Map<string, Endpoint>>()

  for (const rel of table) {
    const [first, second] = rel.characters
    if (!first || !second || first === second) continue

    const key = pairKey(first, second)
    let endpoints = index.get(key)
    if (!endpoints) {
      endpoints = new Map()
      index.set(key, endpoints)
    }

    const firstEndpoint = endpoints.get(first)
    if (!firstEndpoint) endpoints.set(first, { type: rel.type, label: rel.label })
    else if (!firstEndpoint.label && rel.label) firstEndpoint.label = rel.label

    const secondEndpoint = endpoints.get(second)
    if (!secondEndpoint) endpoints.set(second, { type: rel.type, label: rel.inverseLabel })
    else if (!secondEndpoint.label && rel.inverseLabel) secondEndpoint.label = rel.inverseLabel
  }

  return index
}

/**
 * Every person the given character is recorded with, once each, labelled from
 * that character's point of view, in table order.
 *
 * Table order is kept rather than sorting here: the caller knows the names and
 * the context. `ConnectionsView` sorts alphabetically; the record card keeps
 * the authored order, which puts the important links first.
 */
export function relationshipsFor(
  characterId: string,
  table: readonly CharacterRelationship[] = CHARACTER_RELATIONSHIPS,
): RelationshipLink[] {
  const index = buildIndex(table)
  const links: RelationshipLink[] = []
  const seen = new Set<string>()

  for (const rel of table) {
    const [first, second] = rel.characters
    const otherId = first === characterId ? second : second === characterId ? first : null
    if (!otherId || otherId === characterId || seen.has(otherId)) continue

    const endpoint = index.get(pairKey(first, second))?.get(otherId)
    if (!endpoint) continue

    seen.add(otherId)
    links.push({
      otherId,
      label: endpoint.label ?? RELATIONSHIP_LABELS[endpoint.type],
      type: endpoint.type,
    })
  }

  return links
}

/**
 * How many distinct people each character is recorded with.
 *
 * The connection index promises a count that matches the list it opens, so it
 * must count this way rather than by table rows. Pairs are counted once even
 * when the table states them twice.
 */
export function relationshipCounts(
  table: readonly CharacterRelationship[] = CHARACTER_RELATIONSHIPS,
): Map<string, number> {
  const counts = new Map<string, number>()
  const counted = new Set<string>()

  for (const rel of table) {
    const [first, second] = rel.characters
    if (!first || !second || first === second) continue

    const key = pairKey(first, second)
    if (counted.has(key)) continue
    counted.add(key)

    counts.set(first, (counts.get(first) ?? 0) + 1)
    counts.set(second, (counts.get(second) ?? 0) + 1)
  }

  return counts
}
