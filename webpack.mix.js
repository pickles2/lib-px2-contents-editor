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
				"path": require.resolve("path-browserify"),
				"crypto": require.resolve("crypto-browserify"),
				"stream": require.resolve("stream-browserify"),
				"vm": false,
			}
		}
	})


	// --------------------------------------
	// Pickles 2 Contents Editor
	.js('src/pickles2-contents-editor.js', 'dist/pickles2-contents-editor.js')
	.js('src/pickles2-preview-contents.js', 'dist/pickles2-preview-contents.js')
	.sass('src/pickles2-contents-editor.css.scss', 'dist/pickles2-contents-editor.css').options({
		processCssUrls: false,
	})
	.sass('src/themes/auto.css.scss', 'dist/themes/auto.css')
	.sass('src/themes/lightmode.css.scss', 'dist/themes/lightmode.css')
	.sass('src/themes/darkmode.css.scss', 'dist/themes/darkmode.css')
	.copyDirectory('node_modules/bootstrap-icons/font/fonts', 'dist/fonts')

	// --------------------------------------
	// Static Frontend Libraries
	.copyDirectory('src/editor/broccoli/canvas.pass.html', 'dist/editor/broccoli/canvas.pass.html')
	.copyDirectory('node_modules/broccoli-field-table/dist', 'dist/libs/broccoli-field-table/dist')
;
