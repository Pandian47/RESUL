import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath, splitVendorChunkPlugin } from 'vite';
import path from 'path';
import postcssNesting from 'postcss-nesting';
import { createHtmlPlugin } from 'vite-plugin-html';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Hunspell for Genie Typo.js: copy from resul-genie-ui dist into public before dev/build. */
function copyGenieDictionariesPlugin() {
    return {
        name: 'copy-genie-dictionaries',
        buildStart() {
            const src = path.resolve(__dirname, 'node_modules/resul-genie-ui/dist/dictionaries');
            const dest = path.resolve(__dirname, 'public/dictionaries');
            if (!existsSync(src)) {
                console.warn(
                    '[copy-genie-dictionaries] Skipped: not found',
                    src,
                    '— run `npm run build` in Genie-UI, then `npm install` here.',
                );
                return;
            }
            mkdirSync(path.resolve(__dirname, 'public'), { recursive: true });
            cpSync(src, dest, { recursive: true });
        },
    };
}

/** Genie logos, preview frames, etc.: copy from resul-genie-ui into public before dev/build. */
function copyGenieAssetsPlugin() {
    return {
        name: 'copy-genie-assets',
        buildStart() {
            const pkgRoot = path.resolve(__dirname, 'node_modules/resul-genie-ui');
            const distSrc = path.join(pkgRoot, 'dist/genie-assets');
            const pubSrc = path.join(pkgRoot, 'public/genie-assets');
            const src = existsSync(distSrc) ? distSrc : pubSrc;
            const dest = path.resolve(__dirname, 'public/genie-assets');
            if (!existsSync(src)) {
                return;
            }
            mkdirSync(path.resolve(__dirname, 'public'), { recursive: true });
            cpSync(src, dest, { recursive: true });
        },
    };
}

export default defineConfig(({ mode }) => {
    const isProduction =
        mode === 'production' || mode === 'prod' || process.env.NODE_ENV === 'production';
    return {
          base: '/',
    root: './',
    build: {
        // Relative to the root
        outDir: './build',
              cssCodeSplit: true,
        modulePreload: {
            polyfill: false,
        },
        
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replace(/\\/g, '/');
                    if (normalizedId.includes('node_modules')) {
                        if (
                            id.includes('/react-dom/') ||
                            id.includes('/react-router-dom/') ||
                            id.includes('/react-router/') ||
                            /[/\\]node_modules[/\\]react[/\\]/.test(id)
                        ) {
                            return 'react-vendor';
                        }
                        // Group large libraries into separate chunks
                        if (normalizedId.includes('@progress/kendo')) return 'kendo-ui';
                        if (normalizedId.includes('highcharts')) return 'highcharts';
                        if (normalizedId.includes('react-email-editor') || normalizedId.includes('resul-template-builder')) return 'email-builder';
                        if (normalizedId.includes('d3') || normalizedId.includes('reactflow')) return 'visualization';
                        if (normalizedId.includes('@dnd-kit')) return 'dnd-kit';
                        if (normalizedId.includes('moment')) return 'moment';
                        if (normalizedId.includes('lodash')) return 'lodash';
                        // Other vendor chunks
                        return normalizedId.split('node_modules/')[1].split('/')[0].toString();
                    }
                    // Audience is not forced into a single chunk — avoids circular-import TDZ in prod.
                    // if (normalizedId.includes('/src/Pages/AuthenticationModule/Audience')) return 'audience';
                    if (normalizedId.includes('/src/Pages/AuthenticationModule/Communication')) return 'communication';
                    // Analytics is not forced into a single chunk — avoids circular-import TDZ in prod.
                    // if (normalizedId.includes('/src/Pages/AuthenticationModule/Analytics')) return 'analytics';
                    // Preferences is not forced into a single chunk — avoids circular-import TDZ in prod.
                    // if (normalizedId.includes('/src/Pages/AuthenticationModule/Preferences')) return 'preferences';
                },
            },
             plugins: isProduction ? [
                {
                    name: 'remove-console-arrow-functions',
                    transform(code, id) {
                        if (!id.includes('node_modules')) {
                            // Replace arrow functions that only contain console.log/debugger with empty functions
                            // Pattern: (key:)? (params) => console.method(args)
                            code = code.replace(
                                /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*)?\([^)]*\)\s*=>\s*console\.(log|debug|info|trace)\([^)]*\)/g,
                                (match, prefix) => {
                                    // Extract the parameter list from the match
                                    const paramMatch = match.match(/\(([^)]*)\)/);
                                    const params = paramMatch ? paramMatch[1] : '';
                                    return prefix ? `${prefix}(${params}) => {}` : `(${params}) => {}`;
                                }
                            );
                            // Replace arrow functions with debugger
                            code = code.replace(
                                /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*)?\([^)]*\)\s*=>\s*debugger/g,
                                (match, prefix) => {
                                    const paramMatch = match.match(/\(([^)]*)\)/);
                                    const params = paramMatch ? paramMatch[1] : '';
                                    return prefix ? `${prefix}(${params}) => {}` : `(${params}) => {}`;
                                }
                            );
                        }
                        return { code, map: null };
                    }
                }
            ] : []
        },
    }, define: {
      'process.env': {},
    },
    server: {
        open: '/',
        port: 4000,
        hot: true,
    },
     css: {
        postcss: { plugins: [postcssNesting] },
          preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'if-function'],
            }
        }
    },
    resolve: {
        dedupe: [
            '@progress/kendo-react-grid',
            '@progress/kendo-react-common',
            '@progress/kendo-react-buttons',
            '@progress/kendo-data-query',
            'react',
            'react-dom',
            'react-router',
            'react-router-dom',
        ],
        alias: {
            '@progress/kendo-react-grid': path.resolve(__dirname, 'node_modules/@progress/kendo-react-grid'),
            'react-router': path.resolve(__dirname, 'node_modules/react-router'),
            'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
            src: path.resolve(__dirname, 'src'),
            Assets: path.resolve(__dirname, 'src' + '/Assets'),
            Components: path.resolve(__dirname, 'src' + '/Components'),
            CommonComponents: path.resolve(__dirname, 'src' + '/CommonComponents'),
            Constants: path.resolve(__dirname, 'src' + '/Constants'),
            Hooks: path.resolve(__dirname, 'src' + '/Hooks'),
            Pages: path.resolve(__dirname, 'src' + '/Pages'),
            Styles: path.resolve(__dirname, 'src' + '/Styles'),
            Docs: path.resolve(__dirname, 'src/Styles/components_new/Docs'),
            Server: path.resolve(__dirname, 'src' + '/Server'),
            Store: path.resolve(__dirname, 'src' + '/Store'),
            Utils: path.resolve(__dirname, 'src' + '/Utils'),
            Reducers: path.resolve(__dirname, 'src' + '/Reducers'),
            Hoc: path.resolve(__dirname, 'src' + '/Hoc'),
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
    esbuild: {
        loader: 'jsx',
        include: ['src/**/*.jsx', 'node_modules/**/*.jsx', 'src/**/*.js', 'node_modules/**/*.js'],
        drop: isProduction ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@progress/kendo-react-grid',
            'react-router',
            'react-router-dom',
            'react-redux',
            'recharts',
            'use-sync-external-store/shim/with-selector',
            'use-sync-external-store/shim/with-selector.js',
        ],
        exclude: ['resul-genie-ui'],
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    publicDir: './public',

    plugins: [
        copyGenieDictionariesPlugin(),
        copyGenieAssetsPlugin(),
        createHtmlPlugin({
            // inject: {
            //     data: {
            //         title: 'Sample app',
            //     },
            // },
        }),
        react({
            include: '**/*.jsx',
        }),
        viteCommonjs(),
        // Compression plugin for production builds
        mode === 'production' && viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240, // Only compress files larger than 10kb
            algorithm: 'gzip',
            ext: '.gz',
        }),
        mode === 'production' && viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'brotliCompress',
            ext: '.br',
        }), mode === 'production' &&
        visualizer({
            filename: './build/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
        }),
    ].filter(Boolean),
    worker: {
        plugins: () => [react(), viteCommonjs(), viteCompression(), splitVendorChunkPlugin()],
    },
    };
});