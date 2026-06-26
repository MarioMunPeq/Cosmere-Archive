import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import PlanetPanel from '@/components/map/PlanetPanel'
import { PLANETS } from '@/data/static/planets'
import { createRef } from 'react'

const roshar = PLANETS.find(p => p.id === 'roshar')!

const DummyPlanetPanel = () => (
  <div className="w-80 h-96">
    <MemoryRouter>
      <PlanetPanel
        selected={roshar}
        selectedCharacters={[]}
        onSelectPlanet={() => {}}
        onSelectCharacter={() => {}}
        onStartJourney={() => {}}
        panelRef={createRef<HTMLDivElement>()}
      />
    </MemoryRouter>
  </div>
)

const meta = {
  title: 'Map/PlanetPanel',
  component: DummyPlanetPanel,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DummyPlanetPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Roshar: Story = {}
