const fs = require('fs');
const path = require('path');

// Create .storybook directory
const sbDir = '.storybook';
if (!fs.existsSync(sbDir)) {
  fs.mkdirSync(sbDir, { recursive: true });
  console.log('✅ Created', sbDir);
}

// Create main.ts
const mainTs = `import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  framework: '@storybook/nextjs',
  stories: ['../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/blocks',
  ],
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
`;
fs.writeFileSync(path.join(sbDir, 'main.ts'), mainTs);
console.log('✅ Created .storybook/main.ts');

// Create preview.ts
const previewTs = `import type { Preview } from '@storybook/react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
`;
fs.writeFileSync(path.join(sbDir, 'preview.ts'), previewTs);
console.log('✅ Created .storybook/preview.ts');

// Create manager-head.html
const managerHead = `<style>
  /* Custom Storybook theming */
  :root {
    --color-primary: #3b82f6;
    --color-secondary: #8b5cf6;
  }
</style>
`;
fs.writeFileSync(path.join(sbDir, 'manager-head.html'), managerHead);
console.log('✅ Created .storybook/manager-head.html');

console.log('🎨 Storybook configuration files created successfully!');
