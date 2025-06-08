import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['public/**', 'node_modules/**', '*.js'],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-empty-object-type': ['warn', { allowInterfaces: 'always' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-namespace': 'off', 
            '@typescript-eslint/no-explicit-any': 'off',
            'no-debugger': 'off',
            'unused-imports/no-unused-imports': 'warn',
            'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1, maxBOF: 0 }]
        },
    },
];