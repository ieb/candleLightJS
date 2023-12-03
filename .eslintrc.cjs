module.exports = {
  root: true,
  globals: {
  },
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: [
    'dist', 
    '.eslintrc.cjs',
    'forge.config.js'
    ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { },
  rules: {
  },
}
