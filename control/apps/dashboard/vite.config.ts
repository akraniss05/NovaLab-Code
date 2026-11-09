import {defineConfig} from 'vite';
import tailwind from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),plugins:[tailwind()],build:{outDir:'../../dist',emptyOutDir:true}});
