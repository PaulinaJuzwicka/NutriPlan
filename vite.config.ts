import { defineConfig, loadEnv, PluginOption, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import type { NextFunction } from 'connect';

// Custom plugin to handle /api/* routes
function apiPlugin(): PluginOption {
  return {
    name: 'vite-plugin-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {

        if (req.url && req.url.startsWith('/api/')) {
          const apiRouteWithQuery = req.url.substring('/api/'.length);
          const [apiRouteBase] = apiRouteWithQuery.split('?');
          // Ensure apiRouteBase does not contain path traversal characters for security
          if (apiRouteBase.includes('..')) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Bad Request: Invalid API route.');
            return;
          }
          const filePath = path.resolve(__dirname, 'api', `${apiRouteBase}.js`);

          if (fs.existsSync(filePath)) {
            try {
              // Clear module cache
              const modulePath = filePath;
              // @ts-expect-error - Dynamic require for API handlers
               
              delete require.cache[require.resolve(modulePath)];
              // @ts-expect-error - Dynamic require for API handlers
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const handler = require(modulePath);
              if (typeof handler === 'function') {
                // Node.js http module's ServerResponse doesn't directly support await on end()
                // The handler itself should manage the response ending.
                handler(req, res); 
              } else {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end(`Handler at ${filePath} is not a function.`);
              }
            } catch (error: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              res.end('Internal Server Error: ' + errorMessage);
            }
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`API endpoint not found: ${req.url}`);
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), apiPlugin()],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src')
        },
        {
          find: '@components',
          replacement: path.resolve(__dirname, './src/components')
        },
        {
          find: '@lib',
          replacement: path.resolve(__dirname, './src/lib')
        },
        {
          find: '@app',
          replacement: path.resolve(__dirname, './src/app')
        },
        {
          find: '@types',
          replacement: path.resolve(__dirname, './src/types')
        },
        {
          find: '@components/ui/Textarea',
          replacement: path.resolve(__dirname, './src/components/ui/Textarea.tsx')
        },
        {
          find: '@components/ui/Label',
          replacement: path.resolve(__dirname, './src/components/ui/Label.tsx')
        },
        {
          find: '@components/ui/Checkbox',
          replacement: path.resolve(__dirname, './src/components/ui/Checkbox.tsx')
        },
        {
          find: '@components/ui/Select',
          replacement: path.resolve(__dirname, './src/components/ui/Select.tsx')
        }
      ]
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor libraries
            vendor: ['react', 'react-dom'],
            // UI libraries
            ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
            // Supabase
            supabase: ['@supabase/supabase-js', '@supabase/auth-js'],
            // Date utilities
            date: ['date-fns'],
            // Form libraries
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Router
            router: ['react-router-dom'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      target: 'esnext',
      minify: 'esbuild',
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom', 'date-fns'],
      force: true // Force rebuild dependencies
    },
    server: {
      hmr: false, // Wyłączamy Hot Module Replacement
      watch: {
        usePolling: false, // Wyłączamy polling
        interval: 1000 // Zwiększamy interval
      }
    },
    define: {
      'process.env': env,
    },
  };
});
