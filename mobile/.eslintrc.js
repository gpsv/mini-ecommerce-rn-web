const FEATURES = ['cart', 'catalog', 'checkout'];

const APP_IMPORT_PATTERN = {
  group: ['**/app', '**/app/**'],
  message: 'Solo app/ compone la aplicación; nadie más importa de app/.',
};

// A feature imports another feature only through its index.ts (`../../catalog`).
// `!@core/**` keeps `@core/catalog/...` allowed: it is domain code, not a feature.
const otherFeaturePatterns = feature =>
  FEATURES.filter(other => other !== feature).map(other => ({
    group: [`**/${other}/**`, '!@core/**'],
    message: `Importa el feature "${other}" solo desde su index.ts.`,
  }));

module.exports = {
  root: true,
  extends: '@react-native',
  settings: {
    // Linting ../core resolves "react" from core/, which has no node_modules:
    // read the version installed in this app instead of "detect".
    react: { version: require('react/package.json').version },
  },
  overrides: [
    {
      // The @react-native preset registers the TypeScript plugin only for these files.
      files: ['*.ts', '*.tsx'],
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
    // One override per feature: a later override replaces no-restricted-imports
    // instead of merging it, so each one carries all of its patterns.
    ...FEATURES.map(feature => ({
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
  ],
};
