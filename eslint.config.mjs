import js from '@eslint/js'
import globals from 'globals'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

// Flat-config port of the previous .eslintrc. The .mjs extension is required:
// this package is "type": "module", so a .js config cannot use require().
export default [
  {
    ignores: ['coverage/**']
  },
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    }
  }
]
