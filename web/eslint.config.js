import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const FEATURES = ['cart', 'catalog', 'checkout']

const APP_IMPORT_PATTERN = {
  group: ['**/app', '**/app/**'],
  message: 'Solo app/ compone la aplicación; nadie más importa de app/.',
}

// A feature imports another feature only through its index.ts (`../../catalog`).
// `!@core/**` keeps `@core/catalog/...` allowed: it is domain code, not a feature.
const otherFeaturePatterns = (feature) =>
  FEATURES.filter((other) => other !== feature).map((other) => ({
    group: [`**/${other}/**`, '!@core/**'],
    message: `Importa el feature "${other}" solo desde su index.ts.`,
  }))

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    // Already errors in `recommended`; stated here so they don't depend on the preset.
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-expect-error': 'allow-with-description',
        },
      ],
    },
  },
  // One block per feature: a later block replaces no-restricted-imports
  // instead of merging it, so each one carries all of its patterns.
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**`],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [APP_IMPORT_PATTERN, ...otherFeaturePatterns(feature)] },
      ],
    },
  })),
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            APP_IMPORT_PATTERN,
            {
              group: ['**/features', '**/features/**'],
              message: 'shared/ no conoce a los features (features → shared → core).',
            },
          ],
        },
      ],
    },
  },
])
