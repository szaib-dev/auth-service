import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.jest.json',
            },
        ],
    },
    moduleNameMapper: {
        // tsx requires .js extensions in imports, but ts-jest can't resolve them.
        // this mapper strips .js at test time so both can coexist without touching imports.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};

export default config;
