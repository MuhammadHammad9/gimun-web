import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({ resolve:{alias:{'@':path.resolve('src'),'@frontend':path.resolve('frontend'),'@backend':path.resolve('backend'),'@shared':path.resolve('shared'),'server-only':path.resolve('tests/unit/server-only.ts')}},test:{include:['tests/unit/**/*.test.ts'],environment:'node'} });
