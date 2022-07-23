let conf = require('config');
// console.log(conf);
let Broccoli = require('broccoli-html-editor');
let path = require('path');
let gulp = require('gulp');
let sass = require('gulp-sass');//CSSコンパイラ
let minifyCss = require('gulp-minify-css');//CSSファイルの圧縮ツール
let autoprefixer = require("gulp-autoprefixer");//CSSにベンダープレフィックスを付与してくれる
let uglify = require("gulp-uglify");//JavaScriptファイルの圧縮ツール
let concat = require('gulp-concat');//ファイルの結合ツール
let plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
let rename = require("gulp-rename");//ファイル名の置き換えを行う
let twig = require("gulp-twig");//Twigテンプレートエンジン
let browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
let packageJson = require(__dirname+'/package.json');



// src 中の *.css を処理
gulp.task('.css', function(){
	return gulp.src("src/**/*.css")
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// src 中の *.css.scss を処理
gulp.task('.css.scss', function(){
	return gulp.src("src/**/*.css.scss")
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(rename({
			extname: ''
		}))
		.pipe(rename({
			extname: '.css'
		}))
		.pipe(gulp.dest( './dist/' ))

		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.js を処理
gulp.task("pickles2-contents-editor.js", function() {
	return gulp.src(["src/pickles2-contents-editor.js"])
		.pipe(plumber())
		.pipe(browserify({
		}))

		.pipe(concat('pickles2-contents-editor.js'))
		.pipe(gulp.dest( './dist/' ))

		.pipe(concat('pickles2-contents-editor.min.js'))
		.pipe(uglify())
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest( './dist/' ))
	;
});

gulp.task("pickles2-preview-contents.js", function() {
	return gulp.src(["src/pickles2-preview-contents.js"])
		.pipe(plumber())
		.pipe(browserify({}))

		.pipe(concat('pickles2-preview-contents.js'))
		.pipe(gulp.dest( './dist/' ))

		.pipe(concat('pickles2-preview-contents.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.html を処理
gulp.task(".html", function() {
	return gulp.src(["src/**/*.html", "src/**/*.htm"])
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.html.twig を処理
gulp.task(".html.twig", function() {
	return gulp.src(["src/**/*.html.twig"])
		.pipe(plumber())
		.pipe(twig({
			data: {
				packageJson: packageJson
			}
		}))
		.pipe(rename({extname: ''}))
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.js を処理
gulp.task("test/contents.js:js", function() {
	return gulp.src(["tests/app/client/index_files/contents.src.js"])
		.pipe(plumber())
		.pipe(browserify({
		}))
		// .pipe(uglify())
		.pipe(concat('contents.js'))
		.pipe(gulp.dest( 'tests/app/client/index_files/' ))
	;
});
gulp.task("test/contents.js:php", function() {
	return gulp.src(["tests/app/client_php/index_files/contents.src.js"])
		.pipe(plumber())
		.pipe(browserify({
		}))
		// .pipe(uglify())
		.pipe(concat('contents.js'))
		.pipe(gulp.dest( 'tests/app/client_php/index_files/' ))
	;
});



let _tasks = gulp.parallel(
	'.html',
	'.html.twig',
	'.css',
	'.css.scss',
	'test/contents.js:js',
	'test/contents.js:php',
	'pickles2-contents-editor.js',
	'pickles2-preview-contents.js'
);

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	return gulp.watch(["src/**/*", "tests/app/client/**/*.src.js", "tests/app/client_php/**/*.src.js"], _tasks);
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
