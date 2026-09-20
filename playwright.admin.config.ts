import { defineConfig,devices } from '@playwright/test';
export default defineConfig({testDir:'./tests/admin',workers:1,timeout:120000,use:{baseURL:'http://127.0.0.1:3101',trace:'retain-on-failure'},projects:[{name:'admin-desktop',use:{...devices['Desktop Chrome']}}],reporter:[['list'],['html',{outputFolder:'artifacts/admin-report',open:'never'}]]});
