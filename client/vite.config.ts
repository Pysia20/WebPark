import { defineConfig } from 'vite';

export default defineConfig({
  // ==========================================
  // 1. Network & Domain Config (For Nginx)
  // ==========================================
  server: {
    // Bind to all network interfaces so Nginx can connect to it
    host: '0.0.0.0',
    port: 5173,

    // Fixes the "Blocked request. Host is not allowed" error
    allowedHosts: [
      'webpark.mywire.org'
    ],

    // Route Hot Module Replacement (HMR) WebSockets through Nginx
    hmr: {
      host: 'webpark.mywire.org',
      clientPort: 443, // Use 443 if you use HTTPS, or 80 if HTTP
      protocol: 'wss', // Use 'wss' for HTTPS, or 'ws' for HTTP
    },
  },

  // ==========================================
  // 2. Pixi.js Specific Optimizations
  // ==========================================
  // If you use custom GLSL/WGSL shaders, add them so Vite treats them as assets
  assetsInclude: ['**/*.vert', '**/*.frag', '**/*.wgsl'],

  build: {
    // Pixi.js is a large library. Vite defaults to warning at 500 kB;
    // bumping this suppresses false warning flags during 'npm run build'.
    chunkSizeWarningLimit: 1000,
    
    // Modern WebGL/WebGPU targets
    target: 'esnext',
  }
});