import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#030712' }],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-950 text-gray-100 p-6 min-h-32">
        <Story />
      </div>
    ),
  ],
}

export default preview
