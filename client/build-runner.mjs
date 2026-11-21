import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log('Starting client production build with in-memory config...');
  await build({
    root: __dirname,
    configFile: false,
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss({ config: path.resolve(__dirname, 'tailwind.config.js') }),
          autoprefixer()
        ]
      }
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: false,
    }
  });
  console.log('Vite build completed successfully!');
}

run().catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});
