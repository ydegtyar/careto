import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import tanstackRouterPlugin from '@tanstack/eslint-plugin-router';
import maxMapCallbackLinesRule from './eslint-rules/max-map-callback-lines.js';

const localPlugin = {
  rules: {
    'max-map-callback-lines': maxMapCallbackLinesRule,
  },
};

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '.vite/**',
      'routeTree.gen.ts',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
      '@tanstack/query': tanstackQueryPlugin,
      '@tanstack/router': tanstackRouterPlugin,
      local: localPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...tanstackQueryPlugin.configs.recommended.rules,
      ...tanstackRouterPlugin.configs.recommended.rules,

      // Custom rules as requested by spec
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
      'local/max-map-callback-lines': ['error', { max: 10 }],

      // Additional sensible defaults for modern TS/React
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
