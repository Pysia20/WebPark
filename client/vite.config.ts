import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        // Bind to all network interfaces so Nginx can connect to it
        host: '0.0.0.0',
        port: 5173,

        // Fixes the "Blocked request. Host is not allowed" error
        allowedHosts: [
            'webpark.mywire.org'
        ],

        // Route Hot Module Replacement (HMR) WebSofckets through Nginx

        //hmr: {
        //    host: 'webpark.mywire.org',
        //    clientPort: 443, // Use 443 if you use HTTPS, or 80 if HTTP
        //    protocol: 'wss', // Use 'wss' for HTTPS, or 'ws' for HTTP
        //},

        // 💡 CRITICAL: Forwards your room fetches to your teammate's backend server!
        proxy: {
            '/api': {
                target: 'http://localhost:3005',
                changeOrigin: true
            }
        }
    },

    // Pixi.js Specific Optimizations
    assetsInclude: ['**/*.vert', '**/*.frag', '**/*.wgsl'],

    build: {
        chunkSizeWarningLimit: 1000,
        target: 'esnext',
    }
});