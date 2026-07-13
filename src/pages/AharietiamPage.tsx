import { memo } from 'react'
import Scene from '@/components/aharietiam/Scene'
import { useSEOMeta } from '@/hooks/useSEOMeta'

export default memo(function AharietiamPage() {
  useSEOMeta({
    title: 'Aharietiam — Cosmere Archive',
    description:
      'The ceremonial stone circle of Aharietiam, where nine Honorblades were abandoned and one remains empty.',
  })

  return <Scene />
})
