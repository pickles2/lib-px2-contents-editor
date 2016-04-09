var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');//CSSコンパイラ
var minifyCss = require('gulp-minify-css');//CSSファイルの圧縮ツール
var autoprefixer = require("gulp-autoprefixer");//CSSにベンダープレフィックスを付与してくれる
var uglify = require("gulp-uglify");//JavaScriptファイルの圧縮ツール
var concat = require('gulp-concat');//ファイルの結合ツール
var plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
var rename = require("gulp-rename");//ファイル名の置き換えを行う
var twig = require("gulp-twig");//Twigテンプレートエンジン
var browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'.html',
	'.html.twig',
	'.css',
	'pickles2-contents-editor.css',
	'pickles2-contents-editor.js',
	'broccoli-client'
];


// broccoli-client (frontend) を処理
gulp.task("broccoli-client", function() {
	gulp.src(["node_modules/broccoli-html-editor/client/dist/**/*"])
		.pipe(gulp.dest( './dist/libs/broccoli-html-editor/client/dist/' ))
	;
	gulp.src(["node_modules/broccoli-field-table/dist/**/*"])
		.pipe(gulp.dest( './dist/libs/broccoli-field-table/dist/' ))
	;
	// gulp.src(["node_modules/broccoli-field-psd/dist/*"])
	// 	.pipe(gulp.dest( './app/libs/broccoli-field-psd/dist/' ))
	// ;
});

// src 中の *.css.scss を処理
gulp.task('pickles2-contents-editor.css', function(){
	gulp.src("src/pickles2-contents-editor.css.scss")
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(concat('pickles2-contents-editor.css'))
		.pipe(gulp.dest( './dist/' ))
		.pipe(concat('pickles2-contents-editor.min.css'))
		.pipe(minifyCss({compatibility: 'ie8'}))
		// .pipe(sourcemaps.write())
		// .pipe(uglify())
		.pipe(gulp.dest( './dist/' ))
	;
});

// src 中の *.css を処理
gulp.task('.css', function(){
	gulp.src("src/**/*.css")
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.js を処理
gulp.task("pickles2-contents-editor.js", function() {
	gulp.src(["src/pickles2-contents-editor.js"])
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

// *.html を処理
gulp.task(".html", function() {
	gulp.src(["src/**/*.html", "src/**/*.htm"])
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// *.html.twig を処理
gulp.task(".html.twig", function() {
	gulp.src(["src/**/*.html.twig"])
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


// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	gulp.watch(["src/**/*"], _tasks);
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
