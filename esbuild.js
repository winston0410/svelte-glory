import { preprocess } from 'svelte/compiler'
import { build } from "esbuild";
import { derver } from "derver";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import gloryPreprocess from "glory-svelte-preprocess";

const DEV = process.argv.includes('--dev');

// Development server configuration. To configure production server
// see `start` script in `package.json` file.

const HOST = 'localhost';
const PORT = 5050;

build({
    // esbuild configuration
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'public/build/bundle.js',
    mainFields: ['svelte', 'module', 'main'],
    minify: !DEV,
    incremental: DEV,
    sourcemap: DEV,  // Use `DEV && 'inline'` to inline sourcemaps to the bundle
    plugins: [
        sveltePlugin({

            compileOptions: {
                // Svelte compile options
                dev: DEV,
                css: false  //use `css:true` to inline CSS in `bundle.js`
            },

            preprocess: [
                // Place here any Svelte preprocessors
                {
                    async markup({ content, filename }) {
                        return preprocess(content, [
                            sveltePreprocess(),
                        ], { filename })
                    }
                },
                gloryPreprocess(),
            ]

        })
    ]

}).then(bundle => {
    DEV && derver({
        dir: 'public',
        host: HOST,
        port: PORT,
        watch: ['public', 'src'],
        onwatch: async (lr, item) => {
            if (item == 'src') {
                lr.prevent();
                bundle.rebuild().catch(err => lr.error(err.message, 'Svelte compile error'));
            }
        }
    })
});

