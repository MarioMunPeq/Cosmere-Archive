export type ArchiveErrorType = 'import' | 'network' | 'runtime' | '404' | 'permission' | 'unknown'

export interface ArchiveErrorContent {
  title: string
  description: string
  status: string
  archive: string
  integrity: string
  recovery: string
  classification: string
  inscription: string
}

const CONTENT: Record<ArchiveErrorType, ArchiveErrorContent> = {
  import: {
    title: 'ARCHIVE RECORD LOST',
    description:
      'The requested volume appears to have been misplaced between Realms. Portions of the record appear to have been lost between Realms.',
    status: 'Lost',
    archive: 'Silverlight',
    integrity: '63%',
    recovery: 'Possible',
    classification: 'Restricted',
    inscription: 'RECORD LOST',
  },
  network: {
    title: 'REALM CONNECTION FAILED',
    description:
      'Connection to the Silverlight Archives has been interrupted. The record cannot be accessed at this time.',
    status: 'Unavailable',
    archive: 'Silverlight',
    integrity: '—',
    recovery: 'Unknown',
    classification: 'Pending',
    inscription: 'CONNECTION SEVERED',
  },
  runtime: {
    title: 'ARCHIVAL FAILURE',
    description:
      'The archivists encountered an unexpected anomaly while restoring this manuscript. The record may be corrupted.',
    status: 'Corrupted',
    archive: 'Silverlight',
    integrity: '31%',
    recovery: 'Uncertain',
    classification: 'Restricted',
    inscription: 'ARCHIVE CORRUPTED',
  },
  '404': {
    title: 'DOCUMENT NOT FOUND',
    description:
      'No known record exists under this designation. The manuscript may never have existed, or it has been erased from the Archives.',
    status: 'Missing',
    archive: 'Unknown',
    integrity: '—',
    recovery: 'Impossible',
    classification: 'Unlisted',
    inscription: 'RECORD LOST',
  },
  permission: {
    title: 'ACCESS DENIED',
    description:
      'Access restricted by order of the Seventeenth Shard. This record is sealed under inter-Realm jurisdiction.',
    status: 'Sealed',
    archive: 'Seventeenth Shard',
    integrity: '100%',
    recovery: 'Restricted',
    classification: 'Top Secret',
    inscription: 'SEALED',
  },
  unknown: {
    title: 'RECORD UNAVAILABLE',
    description:
      'The requested manuscript could not be recovered. The cause of this anomaly is unknown to the Archivists.',
    status: 'Unknown',
    archive: 'Silverlight',
    integrity: '—',
    recovery: 'Unknown',
    classification: 'Unclassified',
    inscription: 'RECORD LOST',
  },
}

export function getErrorContent(type: ArchiveErrorType): ArchiveErrorContent {
  return CONTENT[type]
}

export function detectErrorType(error: unknown): ArchiveErrorType {
  if (!(error instanceof Error)) return 'unknown'

  const msg = (error.message ?? '').toLowerCase()
  const name = (error.name ?? '').toLowerCase()

  if (
    name === 'chunkloaderror' ||
    name === 'syntaxerror' ||
    msg.includes('dynamically imported module') ||
    msg.includes('chunk') ||
    msg.includes('import')
  )
    return 'import'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('load'))
    return 'network'
  if (msg.includes('permission') || msg.includes('forbidden') || msg.includes('403') || msg.includes('denied'))
    return 'permission'
  if (msg.includes('404') || msg.includes('not found')) return '404'

  return 'unknown'
}
