/**
 * Pickles2ContentsEditor
 */
(function(){
	var __dirname = (function() {
		if (document.currentScript) {
			return document.currentScript.src;
		} else {
			var scripts = document.getElementsByTagName('script'),
			script = scripts[scripts.length-1];
			if (script.src) {
				return script.src;
			}
		}
	})().replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');

	// bootstrap をロード
	document.write('<link rel="stylesheet" href="'+__dirname+'/libs/bootstrap/dist/css/bootstrap.css" />');
	document.write('<script src="'+__dirname+'/libs/bootstrap/dist/js/bootstrap.js"></script>');

	// px2style をロード
	document.write('<link rel="stylesheet" href="'+__dirname+'/libs/px2style/dist/styles.css" />');
	document.write('<script src="'+__dirname+'/libs/px2style/dist/scripts.js"></script>');

	// broccoli-html-editor をロード
	document.write('<link rel="stylesheet" href="'+__dirname+'/libs/broccoli-html-editor/client/dist/broccoli.css" />');
	document.write('<script src="'+__dirname+'/libs/broccoli-html-editor/client/dist/broccoli.js"></script>');
	document.write('<script src="'+__dirname+'/libs/broccoli-field-table/dist/broccoli-field-table.js"></script>');

	window.Pickles2ContentsEditor = function(){
		var $ = require('jquery');
		var it79 = require('iterate79');
		var $canvas;
		var _this = this;
		this.__dirname = __dirname;
		this.options = {};
		this.page_path;

		var serverConfig;
		var editor;

		var LangBank = require('langbank');
		this.lb = {};

		/**
		* initialize
		*/
		this.init = function(options, callback){
			callback = callback || function(){};
			var _this = this;
			// console.log(options);
			this.options = options;
			this.options.customFields = this.options.customFields || {}; // custom fields
			this.options.gpiBridge = this.options.gpiBridge || function(){ alert('gpiBridge required.'); };
			this.options.complete = this.options.complete || function(){ alert('finished.'); };
			this.options.onClickContentsLink = this.options.onClickContentsLink || function(uri, data){ alert('onClickContentsLink: '+uri); };
			this.options.onMessage = this.options.onMessage || function(message){ alert('onMessage: '+message); };
			this.options.preview = this.options.preview || {};
			this.options.lang = this.options.lang || 'en';
			this.page_path = this.options.page_path;

			this.page_path = this.page_path.replace( new RegExp('^(alias[0-9]*\\:)?\\/+'), '/' );
			this.page_path = this.page_path.replace( new RegExp('\\{(?:\\*|\\$)[\s\S]*\\}'), '' );

			$canvas = $(options.elmCanvas);
			$canvas.addClass('pickles2-contents-editor');

			it79.fnc(
				{},
				[
					function(it1, data){
						_this.gpiBridge(
							{
								'api':'getConfig'
							} ,
							function(config){
								// console.log(config);
								serverConfig = config;
								it1.next(data);
							}
						);
					} ,
					function(it1, data){
						_this.gpiBridge(
							{
								'api':'getLanguageCsv'
							} ,
							function(csv){
								// console.log(csv);
								_this.lb = new LangBank(csv, function(){
									console.log('pickles2-contents-editor: set language "'+_this.options.lang+'"');
									_this.lb.setLang( _this.options.lang );
									// console.log( _this.lb.get('ui_label.close') );
									it1.next(data);
								});
							}
						);
					} ,
					function(it1, data){
						_this.gpiBridge(
							{
								'page_path':_this.page_path,
								'api':'checkEditorMode'
							},
							function(editorMode){
								// console.log(editorMode);
								var editorOption = {
									'editorMode': editorMode,
									'serverConfig': serverConfig
								};
								switch(editorMode){
									case '.page_not_exists':
										// ページ自体が存在しない。
										$canvas.html('<p>ページが存在しません。</p>');
										it1.next(data);
										break;

									case '.not_exists':
										// コンテンツが存在しない
										$canvas.html('<p>コンテンツが存在しません。</p>');
										editor = new (require('./editor/not_exists/not_exists.js'))(_this);
										editor.init(editorOption, function(){
											it1.next(data);
										});
										break;

									case 'html.gui':
										// broccoli
										$canvas.html('<p>GUIエディタを起動します。</p>');
										editor = new (require('./editor/broccoli/broccoli.js'))(_this);
										editor.init(editorOption, function(){
											it1.next(data);
										});
										break;

									case 'html':
									case 'md':
									default:
										// defaultテキストエディタ
										$canvas.html('<p>テキストエディタを起動します。</p>');
										editor = new (require('./editor/default/default.js'))(_this);
										editor.init(editorOption, function(){
											it1.next(data);
										});
										break;
								}
							}
						);
					} ,
					function(it1, data){
						callback();
					}
				]
			);


		} // init()

		/**
		* canvas要素を取得する
		*/
		this.getElmCanvas = function(){
			return $canvas;
		}

		/**
		* ブラウザでURLを開く
		*/
		this.openUrlInBrowser = function( url ){
			if( serverConfig.appMode == 'web' ){
				window.open(url);
				return;
			}
			this.gpiBridge(
				{
					'url':url,
					'api':'openUrlInBrowser'
				},
				function(res){
					console.log('open URL: ' + url);
				}
			);
			return;
		}

		/**
		* リソースフォルダを開く
		*/
		this.openResourceDir = function(){
			if( serverConfig.appMode == 'web' ){
				alert('ウェブモードではフォルダを開けません。');
				return;
			}
			this.gpiBridge(
				{
					'page_path':_this.page_path,
					'api':'openResourceDir'
				},
				function(res){
					console.log('open resource directory of: ' + _this.page_path);
					console.log(res);
				}
			);
			return;
		}

		/**
		 * プレビュー上のリンククリックイベント
		 */
		this.onClickContentsLink = function( uri, data ){
			this.options.onClickContentsLink( uri, data );
			return;
		}

		/**
		 * コマンドキー名を得る
		 * Mac OS X では Cmdキー(`cmd`)、 Windows では Ctrlキー(`ctrl`) を返す。
		 */
		this.getCmdKeyName = function(){
			var ua = window.navigator.userAgent;
			// console.log(ua);
			var idxOf = ua.indexOf( 'Mac OS X' );
			if( idxOf >= 0 ){
				return 'cmd';
			}
			return 'ctrl';
		}

		/**
		 * ユーザーへのメッセージを表示する
		 */
		this.message = function(message, callback){
			callback  = callback||function(){};
			// console.info(message);
			this.options.onMessage(message);
			callback();
			return this;
		}

		/**
		* gpiBridgeを呼び出す
		*/
		this.gpiBridge = function(data, callback){
			return this.options.gpiBridge(data, callback);
		}

		/**
		* 再描画
		*/
		this.redraw = function( callback ){
			callback = callback || function(){};
			if(editor){
				editor.redraw(function(){
					callback();
				});
				return;
			}else{
				callback();
			}
			return;
		}

		/**
		* 編集操作を完了する
		*/
		this.finish = function(){
			this.options.complete();
		}
	}
})();
