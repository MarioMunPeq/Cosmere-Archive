import { useSEOMeta } from '@/hooks/useSEOMeta'
import ArchiveError from '@/components/error/ArchiveError'

export default function NotFound() {
  useSEOMeta({ title: '404 — Cosmere Archive', description: 'Page not found — Cosmere Archive' })
  return <ArchiveError type="404" />
}
