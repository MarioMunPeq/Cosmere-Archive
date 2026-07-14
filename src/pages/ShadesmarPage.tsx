import { memo } from 'react'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import ShadesmarScene from '@/components/shadesmar/ShadesmarScene'

const seo = {
  title: 'Shadesmar — Cosmere Archive',
  description: 'Explore the cognitive realm — an endless ocean of glass beads.',
  path: '/shadesmar',
}

function ShadesmarPageInner() {
  useSEOMeta(seo)
  return <ShadesmarScene />
}

export const ShadesmarPage = memo(ShadesmarPageInner)
export default ShadesmarPage
