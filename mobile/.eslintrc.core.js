// Lint config for ../core. eslintrc rejects ".." in override globs, so core/
// gets its own file instead of an override in .eslintrc.js.
const PLATFORM_MESSAGE =
  'core/ es independiente de la plataforma: entra por interfaces (StorageAdapter) o se queda en la app.';

module.exports = {
  root: true,
  extends: './.eslintrc.js',
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: ['react-native', 'react-dom', 'react-router', 'react-router-dom'].map(
          name => ({ name, message: PLATFORM_MESSAGE }),
        ),
        patterns: [
          {
            group: [
              'react-native-*',
              '@react-native/*',
              '@react-native-*/*',
              'react-dom/*',
              'react-router/*',
              '@react-navigation/*',
            ],
            message: PLATFORM_MESSAGE,
          },
          {
            group: ['**/mobile/**', '**/web/**'],
            message: 'core/ no conoce a las apps (features → shared → core).',
          },
        ],
      },
    ],
    'no-restricted-globals': [
      'error',
      { name: 'window', message: PLATFORM_MESSAGE },
      { name: 'document', message: PLATFORM_MESSAGE },
      {
        name: '__DEV__',
        message: 'core/ no lee el entorno: recibe isDevelopment en createAppStore (D26).',
      },
    ],
  },
};
