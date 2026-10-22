/**
 * LineagesCodex — Volume II of the Biographical Archives.
 *
 * The volume has two chapters: houses, read as fold-out genealogies, and the
 * recorded bonds between people. It shares the codex engine, desk and page
 * stock with Volume I, but has its own pagination, ribbon and fore-edge index.
 * That is the whole point of a second volume: it can be read without losing the
 * place in the first.
 */

import { useEffect, useMemo } from 'react'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { useCodexRoute } from '@/hooks/useCodexRoute'
import { readCodexRibbon, useCodexSession } from '@/hooks/useCodexSession'
import Codex, { type CodexSpreadView } from '@/components/codex/Codex'
import ThumbTabs, { type ThumbTab } from '@/components/codex/ThumbTabs'
import { ALL_CHARACTERS } from '@/data/static'
import { FAMILY_TREES } from '@/data/static/family-data'
import { buildSpreads, spreadIndexById, type CodexSection } from '@/utils/codex-pages'
import { ARCANUM_CONTENTS_ID, toArcanumSpreadId } from '@/utils/arcanum-pages'
import { recordSpreadId } from '@/utils/codex-records'
import { relationshipCounts } from '@/utils/relationships'
import { RecordLeftPage } from './RecordSpread'
import VolumeSwitcher from './VolumeSwitcher'
import {
  BloodlinesIndex,
  BloodlinesOverview,
  ConnectionLedger,
  ConnectionsIndex,
  ConnectionsOverview,
  FamilyPlate,
  FamilyTreeChart,
  LineagesContents,
  LineagesTitlePage,
  type ConnectedEntry,
} from './LineagePages'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'

const CONTENTS_ID = 'lineages-contents'
const TITLE_ID = 'lineages-title'
const BLOODLINES_ID = 'lineages-bloodlines'
const BLOODLINES_OVERVIEW_ID = 'lineages-bloodlines-overview'
const CONNECTIONS_ID = 'lineages-connections'
const CONNECTIONS_OVERVIEW_ID = 'lineages-connections-overview'

const CHARACTERS_BY_ID = new Map(ALL_CHARACTERS.map((character) => [character.id, character]))
const FAMILIES_BY_ID = new Map(FAMILY_TREES.map((family) => [family.id, family]))

const CONNECTIONS: ConnectedEntry[] = (() => {
  const counts = relationshipCounts()
  return ALL_CHARACTERS.map((character) => ({ character, count: counts.get(character.id) ?? 0 }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.character.name.localeCompare(b.character.name))
})()

const SECTIONS: CodexSection[] = [
  {
    leaves: [
      { id: CONTENTS_ID, title: 'Contents', frontMatter: true, view: 'contents' },
      { id: TITLE_ID, title: 'Bloodlines & Connections', frontMatter: true, view: 'contents' },
    ],
  },
  {
    leaves: [
      { id: BLOODLINES_ID, title: 'Bloodlines', view: 'bloodlines' },
      { id: BLOODLINES_OVERVIEW_ID, title: 'Houses of the Cosmere', view: 'bloodlines' },
    ],
  },
  ...FAMILY_TREES.map((family) => ({
    leaves: [
      { id: familySpreadId(family.id), title: family.name, familyIds: [family.id], view: 'bloodlines' },
      {
        id: `${familySpreadId(family.id)}-tree`,
        title: `${family.name} lineage`,
        familyIds: [family.id],
        view: 'bloodlines',
      },
    ],
  })),
  {
    leaves: [
      { id: CONNECTIONS_ID, title: 'Connections', view: 'connections' },
      { id: CONNECTIONS_OVERVIEW_ID, title: 'Recorded Bonds', view: 'connections' },
    ],
  },
  ...CONNECTIONS.map(({ character }) => ({
    leaves: [
      {
        id: connectionSpreadId(character.id),
        title: character.name,
        characterIds: [character.id],
        view: 'connections',
      },
      {
        id: `${connectionSpreadId(character.id)}-ledger`,
        title: `${character.name} · Connections`,
        characterIds: [character.id],
        view: 'connections',
      },
    ],
  })),
]

function familySpreadId(familyId: string): string {
  return `lineage-${familyId}`
}

function connectionSpreadId(characterId: string): string {
  return `connection-${characterId}`
}

function shortHouse(name: string): string {
  const first = name.split(' ')[0] ?? name
  return first.slice(0, 2)
}

export default function LineagesCodex() {
  const navigate = useViewTransitionNavigate()
  const session = useCodexSession('lineages')
  const spreads = useMemo(() => buildSpreads(SECTIONS), [])
  const fallbackId = session.ribbon && spreadIndexById(spreads, session.ribbon) >= 0 ? session.ribbon : CONTENTS_ID
  const route = useCodexRoute({ spreads, fallbackId })

  const spreadId = route.spread?.id
  const rememberSpread = session.rememberSpread
  useEffect(() => {
    if (spreadId) rememberSpread(spreadId)
  }, [rememberSpread, spreadId])

  const activeFamilyId = route.spread?.familyIds[0]
  const activeCharacterId = route.spread?.characterIds[0]

  const openFamily = (familyId: string) => route.openSpread(familySpreadId(familyId))
  const openConnection = (characterId: string) => route.openSpread(connectionSpreadId(characterId))
  const openBloodlines = () => route.openSpread(BLOODLINES_ID)
  const openConnections = () => route.openSpread(CONNECTIONS_ID)
  const openContents = () => route.openSpread(CONTENTS_ID)
  const openRecords = (characterId: string) =>
    navigate(`/characters?spread=${encodeURIComponent(recordSpreadId(characterId))}`)
  const openRecordsIndex = () => navigate('/characters?spread=records-contents')
  const openRecordsVolume = () => {
    const ribbon = readCodexRibbon('records')
    navigate(`/characters?spread=${encodeURIComponent(ribbon ?? 'records-contents')}`)
  }
  const openArcanumVolume = () => {
    const ribbon = readCodexRibbon('investiture')
    const spread = ribbon ? toArcanumSpreadId(ribbon) : ARCANUM_CONTENTS_ID
    navigate(`/characters?spread=${encodeURIComponent(spread)}`)
  }
  const allVolumes = () => navigate('/characters')

  const views: CodexSpreadView[] = spreads.map((entry) => {
    const family: FamilyDefinition | undefined = entry.familyIds[0] ? FAMILIES_BY_ID.get(entry.familyIds[0]) : undefined
    const character: Character | undefined = entry.characterIds[0]
      ? CHARACTERS_BY_ID.get(entry.characterIds[0])
      : undefined

    const common = {
      id: entry.id,
      title: entry.title,
      leftFolio: entry.folios[0] ?? undefined,
      rightFolio: entry.folios[1] ?? undefined,
    }

    if (entry.id === CONTENTS_ID) {
      return {
        ...common,
        left: (
          <LineagesContents
            families={FAMILY_TREES}
            connections={CONNECTIONS}
            onOpenBloodlines={openBloodlines}
            onOpenConnections={openConnections}
            onOpenFamily={openFamily}
            onOpenConnection={openConnection}
            onOpenRecords={openRecordsIndex}
          />
        ),
        right: <LineagesTitlePage familyCount={FAMILY_TREES.length} bondCount={CONNECTIONS.length} />,
        leftHeader: 'Bloodlines & Connections',
        rightHeader: 'Title page',
      }
    }

    if (entry.id === BLOODLINES_ID) {
      return {
        ...common,
        left: <BloodlinesIndex families={FAMILY_TREES} onOpenFamily={openFamily} />,
        right: <BloodlinesOverview families={FAMILY_TREES} onOpenFamily={openFamily} />,
        leftHeader: 'Bloodlines',
        rightHeader: 'Houses of the Cosmere',
      }
    }

    if (entry.id === CONNECTIONS_ID) {
      return {
        ...common,
        left: <ConnectionsIndex connections={CONNECTIONS} onOpenConnection={openConnection} />,
        right: <ConnectionsOverview bondCount={CONNECTIONS.length} />,
        leftHeader: 'Connections',
        rightHeader: 'Recorded Bonds',
      }
    }

    if (family) {
      return {
        ...common,
        left: <FamilyPlate family={family} onOpenCharacter={openRecords} />,
        right: <FamilyTreeChart key={family.id} family={family} onOpenCharacter={openRecords} />,
        leftHeader: 'Bloodlines',
        rightHeader: family.name,
        rightNoScroll: true,
      }
    }

    if (character) {
      return {
        ...common,
        left: <RecordLeftPage character={character} />,
        right: <ConnectionLedger character={character} />,
        leftHeader: 'Connections',
        rightHeader: character.name,
      }
    }

    return {
      ...common,
      left: null,
      right: null,
      leftHeader: 'Bloodlines & Connections',
      rightHeader: 'Blank',
    }
  })

  const tabs: ThumbTab[] = [
    {
      id: CONTENTS_ID,
      label: 'In',
      ariaLabel: 'In — contents of Bloodlines & Connections',
      active: route.spread?.id === CONTENTS_ID,
      onSelect: openContents,
    },
    ...FAMILY_TREES.map((family) => ({
      id: familySpreadId(family.id),
      label: shortHouse(family.name),
      ariaLabel: `${shortHouse(family.name)} — ${family.name}, ${family.members.length} members`,
      active: activeFamilyId === family.id,
      onSelect: () => openFamily(family.id),
    })),
    {
      id: CONNECTIONS_ID,
      label: 'Bo',
      ariaLabel: `Bo — connections, ${CONNECTIONS.length} people with recorded links`,
      active: Boolean(activeCharacterId) || route.spread?.id === CONNECTIONS_ID || route.spread?.view === 'connections',
      onSelect: openConnections,
    },
  ]

  return (
    <Codex
      spreads={views}
      index={route.index}
      onTurn={(next) => {
        const target = spreads[next]
        if (target) route.turnTo(target.id)
      }}
      progress={route.total > 1 ? route.index / (route.total - 1) : 0}
      edition={session.edition}
      part="lineages"
      label="Bloodlines & Connections"
      startOpen
      aside={
        <VolumeSwitcher
          current="lineages"
          onOpen={(volume) => {
            if (volume === 'records') openRecordsVolume()
            else if (volume === 'arcanum') openArcanumVolume()
            else openContents()
          }}
          onAllVolumes={allVolumes}
        />
      }
      thumbs={<ThumbTabs label="Volume II index" tabs={tabs} />}
    />
  )
}
