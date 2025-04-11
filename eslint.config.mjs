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
      "import/order": [
        "error", {
          "groups": [
            "builtin",
            ["sibling", "parent"],
            "index",
            "object",
          ],
        }
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
