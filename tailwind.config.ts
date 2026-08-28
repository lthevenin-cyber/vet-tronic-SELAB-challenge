import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#10231f', tech: '#0f766e', leaf: '#16a34a', field: '#ecf7ef', amber: '#f59e0b' } } }, plugins: [] };
export default config;
