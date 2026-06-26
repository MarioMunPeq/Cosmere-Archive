import type { Meta, StoryObj } from '@storybook/react-vite'
import { BrowserRouter } from 'react-router-dom'
import SearchBar from '@/components/common/SearchBar'

const meta = {
  title: 'Common/SearchBar',
  component: SearchBar,
  decorators: [
    (Story: () => React.ReactNode) => (
      <BrowserRouter>
        <div className="w-64">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
