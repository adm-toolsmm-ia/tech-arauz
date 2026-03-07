import type { Preview } from '@storybook/react'
import '../src/globals.css'
import { themes } from '@storybook/theming'

// Import design tokens
import designTokens from '../design/tokens.json'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    // Design tokens integration
    designTokens: {
      tokens: designTokens,
      defaultTab: 'Design Tokens',
    },
  },

  tags: ['autodocs'],

  globalTypes: {
    theme: {
      description: 'Global theme for all stories',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
}

export default preview

// Decorator to apply theme class to document
export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return Story()
  },
]
