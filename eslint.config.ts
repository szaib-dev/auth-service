import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'test/**',
            '**/*.spec.ts',
            '**/*.test.ts',
            'src/generated/**',
        ],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: {
            'unused-imports': unusedImports,
        },
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            'unused-imports/no-unused-imports': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
]);