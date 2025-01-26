import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './', // Use relative paths for production
    build: {
        outDir: 'dist', // Ensure the output is in the `dist` folder
        emptyOutDir: true, // Clear the output directory before building
    },
    server: {
        port: 3000, // Port for development
    },
});
