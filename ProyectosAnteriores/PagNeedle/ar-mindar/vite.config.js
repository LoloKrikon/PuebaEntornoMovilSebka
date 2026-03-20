import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(async ({ command }) => {
    const { needlePlugins, useGzip, loadConfig } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();
    return {
        base: "./",
        plugins: [
            // gzip desactivado para que funcione en github pages sin servidor especial
            needlePlugins(command, needleConfig, { noPoster: true, allowHotReload: false }),
        ],
        server: {
            https: false,
            proxy: {
                'https://localhost:3000': 'https://localhost:3000',
            },
            strictPort: true,
            port: 3000,
            hmr: false,
        },
        build: {
            outDir: "./dist",
            emptyOutDir: true,
        }
    }
});