// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react-hooks'

export default tseslint.config({ ignores: ['dist', '.storybook'] }, {
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ['src/**/*.{ts,tsx}'],
  plugins: { 'react-hooks': reactPlugin },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}, storybook.configs["flat/recommended"]);
