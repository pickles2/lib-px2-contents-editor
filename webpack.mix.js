const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
	.webpackConfig({
		module: {
			rules:[
				{
					test: /\.txt$/i,
					use: ['raw-loader'],
				},
				{
					test: /\.csv$/i,
					loader: 'csv-loader',
					options: {
						dynamicTyping: true,
						header: false,
						skipEmptyLines: false,
					},
				},
				{
					test:/\.twig$/,
					use:['twig-loader']
				}
			]
		},
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false,
				"stream": require.resolve("stream-browserify"),
			}
		}
	})


	// --------------------------------------
	// Pickles 2 Contents Editor
	.js('src/pickles2-contents-editor.js', 'dist/pickles2-contents-editor.js')
	.js('src/pickles2-preview-contents.js', 'dist/pickles2-preview-contents.js')
	.sass('src/pickles2-contents-editor.css.scss', 'dist/pickles2-contents-editor.css')

	// .min files
	.copy('dist/pickles2-contents-editor.js', 'dist/pickles2-contents-editor.min.js')
	.copy('dist/pickles2-preview-contents.js', 'dist/pickles2-preview-contents.min.js')
	.copy('dist/pickles2-contents-editor.css', 'dist/pickles2-contents-editor.min.css')

	// --------------------------------------
	// DevScripts
	.js('tests/app/client_php/index_files/contents.src.js', 'tests/app/client_php/index_files/contents.js')
	.js('tests/app/client/index_files/contents.src.js', 'tests/app/client/index_files/contents.js')

	// --------------------------------------
	// Static Frontend Libraries
	.copyDirectory('src/editor/broccoli/canvas.html', 'dist/editor/broccoli/canvas.html')
	.copyDirectory('node_modules/broccoli-field-table/dist', 'dist/libs/broccoli-field-table/dist')
;
