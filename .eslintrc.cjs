module.exports = {
  root: true,
  env: { browser: true, es2020: true},
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/prop-types': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/hardcoded-secret/]',
        message: 'Do not hardcode secrets. Use environment variables.',
      },
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
