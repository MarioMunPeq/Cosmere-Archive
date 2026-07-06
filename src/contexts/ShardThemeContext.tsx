import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { getShardTheme, type ShardTheme } from '@/data/static/shard-themes'

interface ShardThemeCtx {
  theme: ShardTheme | null
  isActive: boolean
  activePlanetIds: string[]
  primaryPlanetId: string | null
}

export const ShardThemeContext = createContext<ShardThemeCtx>({
  theme: null,
  isActive: false,
  activePlanetIds: [],
  primaryPlanetId: null,
})

export function useShardTheme() {
  return useContext(ShardThemeContext)
}

interface Props {
  activeShardNames: string[]
  children: ReactNode
}

export function ShardThemeProvider({ activeShardNames, children }: Props) {
  const value = useMemo<ShardThemeCtx>(() => {
    if (activeShardNames.length !== 1) {
      return { theme: null, isActive: false, activePlanetIds: [], primaryPlanetId: null }
    }
    const name = activeShardNames[0]!
    const theme = getShardTheme(name)
    if (!theme) {
      return { theme: null, isActive: false, activePlanetIds: [], primaryPlanetId: null }
    }
    return {
      theme,
      isActive: true,
      activePlanetIds: theme.planets,
      primaryPlanetId: theme.primaryPlanet,
    }
  }, [activeShardNames])

  return <ShardThemeContext.Provider value={value}>{children}</ShardThemeContext.Provider>
}
