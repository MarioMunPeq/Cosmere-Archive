import type { Meta, StoryObj } from '@storybook/react-vite'
import ZoomControls from '@/components/map/ZoomControls'

const meta = {
  title: 'Map/ZoomControls',
  component: ZoomControls,
  parameters: { layout: 'centered' },
  args: {
    onZoomIn: () => alert('Zoom in'),
    onZoomOut: () => alert('Zoom out'),
    onReset: () => alert('Reset'),
  },
} satisfies Meta<typeof ZoomControls>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
