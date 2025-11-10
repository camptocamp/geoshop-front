import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  angular.configs.tsRecommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.configs.typescript,
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-globals": [
        "error",
        {
          "name": "alert",
          "message": "Do not use alert(); use a proper UI dialog instead."
        }
      ],
      "import/order": [
        "error", {
          "newlines-between": "always",
          "alphabetize": {
            order: "asc",
          },
          "groups": [
            "type",
            "internal",
            ["unknown"],
            "external",
            "builtin",
            ["parent", "sibling", "index"],
          ],
          "pathGroups": [
            {
              "pattern": "rxjs",
              "group": "internal"
            },
            {
              "pattern": "rxjs/**",
              "group": "internal"
            },
            {
              "pattern": "ol",
              "group": "unknown"
            },
            {
              "pattern": "ol/**",
              "group": "unknown"
            }
          ],
        },
      ],
      '@angular-eslint/directive-selector': [
        'error', {
          type: 'attribute',
          prefix: 'gs2',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error', {
          type: 'element',
          prefix: 'gs2',
          style: 'kebab-case',
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: './tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json', // Ensure this path is correct
        },
      },
    },
  },
);
