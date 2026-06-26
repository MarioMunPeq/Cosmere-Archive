import type { Meta, StoryObj } from '@storybook/react-vite'
import { CloseIcon, MinusIcon, ResetIcon } from '@/components/common/icons'

const IconsList = () => (
  <div className="flex gap-6 items-center">
    {[CloseIcon, MinusIcon, ResetIcon].map((Icon, i) => (
      <div key={i} className="flex flex-col items-center gap-1">
        <Icon />
        <span className="text-[10px] text-gray-500">{['CloseIcon', 'MinusIcon', 'ResetIcon'][i]}</span>
      </div>
    ))}
  </div>
)

const meta = {
  title: 'Common/Icons',
  component: IconsList,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof IconsList>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
