import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: '../backend/docs/openapi.yaml',
    output: 'src/client',
    plugins: [
        '@tanstack/react-query',
    ],
});