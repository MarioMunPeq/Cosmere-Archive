import type { Meta, StoryObj } from '@storybook/react-vite'
import SplitPane from '@/components/common/SplitPane'

const DummySplitPane = () => (
  <div className="h-64">
    <SplitPane
      left={
        <div className="bg-gray-800 p-4 h-full flex items-center justify-center text-gray-300">
          Left Panel
        </div>
      }
      right={
        <div className="bg-gray-700 p-4 h-full flex items-center justify-center text-gray-300">
          Right Panel
        </div>
      }
    />
  </div>
)

const meta = {
  title: 'Common/SplitPane',
  component: DummySplitPane,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DummySplitPane>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
