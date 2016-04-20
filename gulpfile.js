var conf = require('config');
// console.log(conf);
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
	'.css.scss',
	'test/contents.js',
	'pickles2-contents-editor.js',
	'pickles2-preview-contents.js',
	'client-libs'
];


// client-libs (frontend) を処理
gulp.task("client-libs", function() {
	gulp.src(["node_modules/broccoli-html-editor/client/dist/**/*"])
		.pipe(gulp.dest( './dist/libs/broccoli-html-editor/client/dist/' ))
	;
	gulp.src(["node_modules/broccoli-field-table/dist/**/*"])
		.pipe(gulp.dest( './dist/libs/broccoli-field-table/dist/' ))
	;
	gulp.src(["node_modules/bootstrap/dist/fonts/**/*"])
		.pipe(gulp.dest( './dist/libs/bootstrap/dist/fonts/' ))
	;
	gulp.src(["node_modules/bootstrap/dist/js/**/*"])
		.pipe(gulp.dest( './dist/libs/bootstrap/dist/js/' ))
	;
	gulp.src(["node_modules/ace-builds/src-noconflict/**/*"])
		.pipe(gulp.dest( './tests/app/client/libs/ace-builds/src-noconflict/' ))
	;
});

// src 中の *.css を処理
gulp.task('.css', function(){
	gulp.src("src/**/*.css")
		.pipe(plumber())
		.pipe(gulp.dest( './dist/' ))
	;
});

// src 中の *.css.scss を処理
gulp.task('.css.scss', function(){
	gulp.src("src/**/*.css.scss")
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

gulp.task("pickles2-preview-contents.js", function() {
	gulp.src(["src/pickles2-preview-contents.js"])
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

// *.js を処理
gulp.task("test/contents.js", function() {
	gulp.src(["tests/app/client/index_files/contents.src.js"])
		.pipe(plumber())
		.pipe(browserify({
		}))
		// .pipe(uglify())
		.pipe(concat('contents.js'))
		.pipe(gulp.dest( 'tests/app/client/index_files/' ))
	;
});

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	gulp.watch(["src/**/*"], _tasks);
});

// ブラウザを立ち上げてプレビューする
gulp.task("preview", function() {
	require('child_process').spawn('open',[conf.origin+'/']);
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
