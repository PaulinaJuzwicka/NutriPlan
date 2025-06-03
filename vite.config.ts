import { defineConfig, loadEnv, PluginOption, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { NextHandleFunction } from 'connect';

// Custom plugin to handle /api/* routes
function apiPlugin(): PluginOption {
  return {
    name: 'vite-plugin-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: NextHandleFunction) => {
        console.log(`[Vite API Middleware] Received request: ${req.method} ${req.url}`);

        if (req.url && req.url.startsWith('/api/')) {
          console.log(`[Vite API Middleware] Processing API request: ${req.url}`);
          const apiRouteWithQuery = req.url.substring('/api/'.length);
          const [apiRouteBase] = apiRouteWithQuery.split('?');
          // Ensure apiRouteBase does not contain path traversal characters for security
          if (apiRouteBase.includes('..')) {
            console.error(`[Vite API Middleware] Invalid API route (path traversal): ${apiRouteBase}`);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Bad Request: Invalid API route.');
            return;
          }
          const filePath = path.resolve(__dirname, 'api', `${apiRouteBase}.js`);
          console.log(`[Vite API Middleware] Attempting to load handler from: ${filePath}`);

          if (fs.existsSync(filePath)) {
            console.log(`[Vite API Middleware] Handler file found: ${filePath}`);
            try {
              delete require.cache[require.resolve(filePath)];
              const handler = require(filePath);
              if (typeof handler === 'function') {
                console.log(`[Vite API Middleware] Executing handler for: ${req.url}`);
                // Node.js http module's ServerResponse doesn't directly support await on end()
                // The handler itself should manage the response ending.
                handler(req, res); 
              } else {
                console.error(`[Vite API Middleware] Handler at ${filePath} is not a function.`);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end(`Handler at ${filePath} is not a function.`);
              }
            } catch (error: any) {
              console.error(`[Vite API Middleware] Error handling API request ${req.url}:`, error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Internal Server Error: ' + error.message);
            }
          } else {
            console.log(`[Vite API Middleware] Handler file NOT found: ${filePath}`);
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`API endpoint not found: ${req.url}`);
          }
        } else {
          console.log(`[Vite API Middleware] Passing non-API request to next middleware: ${req.url}`);
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), apiPlugin()], // Added custom API plugin
    // server: { ... } // Removed previous server configuration for middleware
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src')
        },
        {
          find: '@components/ui/Input',
          replacement: path.resolve(__dirname, './src/components/ui/Input.tsx')
        },
        {
          find: '@components/ui/Button',
          replacement: path.resolve(__dirname, './src/components/ui/Button.tsx')
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
      ],
    },
    define: {
      'process.env': env,
    },
  };
});
