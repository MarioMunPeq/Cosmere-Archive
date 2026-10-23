import { memo } from 'react'
import Scene from '@/components/aharietiam/Scene'
import { useSEOMeta } from '@/hooks/useSEOMeta'

export default memo(function AharietiamPage() {
  useSEOMeta({
    title: 'Aharietiam — Cosmere Archive',
    description:
      'The rockbed at Aharietiam at dusk, where all ten Honorblades stand planted in a broken circle of stone.',
  })

  return <Scene />
})
