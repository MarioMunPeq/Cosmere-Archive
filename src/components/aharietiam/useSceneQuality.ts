import useMediaQuery from '@/hooks/useMediaQuery'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

export interface SceneQuality {
  /** Phones get fewer stones, no shadow pass and a narrower pixel budget. */
  light: boolean
  reducedMotion: boolean
  maxDpr: number
}

export default function useSceneQuality(): SceneQuality {
  const light = useMediaQuery('(max-width: 900px)')
  const reducedMotion = usePrefersReducedMotion()

  return {
    light,
    reducedMotion,
    maxDpr: light ? 1.5 : 1.75,
  }
}
