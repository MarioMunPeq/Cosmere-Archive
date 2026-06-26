import type { Meta, StoryObj } from '@storybook/react-vite'
import ShardLegend from '@/components/map/ShardLegend'

const shardData = [
  { name: 'Honor', color: '#eab308', planets: ['Roshar'] },
  { name: 'Preservation', color: '#60a5fa', planets: ['Scadrial'] },
]

const DummyShardLegend = ({ activeShards = [] }: { activeShards?: string[] }) => (
  <ShardLegend
    show={true}
    onToggle={() => {}}
    shardData={shardData}
    activeShards={activeShards}
    onToggleShard={() => {}}
    onClear={() => {}}
  />
)

const meta = {
  title: 'Map/ShardLegend',
  component: DummyShardLegend,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DummyShardLegend>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const WithActiveFilter: Story = {
  args: { activeShards: ['Honor'] },
}
