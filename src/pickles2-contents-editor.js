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

	// broccoli-field-table をロード
	document.write('<script src="'+__dirname+'/libs/broccoli-field-table/dist/broccoli-field-table.js"></script>');

	window.Pickles2ContentsEditor = function(){
		var $ = require('jquery');
		var it79 = require('iterate79');
		var $canvas;
		var _this = this;
		this.__dirname = __dirname;
		this.options = {};
		this.page_path;
		this.target_mode;
		this.theme_id;
		this.layout_id;

		var serverConfig;
		var editor;
		var bootupInfomations;

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
			this.options.clipboard = this.options.clipboard || {};
			this.options.clipboard.set = this.options.clipboard.set || null;
			this.options.clipboard.get = this.options.clipboard.get || null;

			this.page_path = this.options.page_path;

			try {
				this.page_path = this.page_path.replace( new RegExp('^(alias[0-9]*\\:)?\\/+'), '/' );
				this.page_path = this.page_path.replace( new RegExp('\\{(?:\\*|\\$)[\s\S]*\\}'), '' );
			} catch (e) {
			}
			if(!this.page_path){
				// page_path option is required
				return false;
			}

			$canvas = $(options.elmCanvas);
			$canvas.addClass('pickles2-contents-editor');
			$canvas
				.on('dragover', function(e){
					e.stopPropagation();
					e.preventDefault();
					return;
				})
				.on('drop', function(e){
					e.stopPropagation();
					e.preventDefault();
					return;
				})
			;

			it79.fnc(
				{},
				[
					function(it1, data){
						_this.gpiBridge(
							{
								'page_path':_this.page_path,
								'api':'getBootupInfomations'
							} ,
							function(_bootupInfomations){
								bootupInfomations = _bootupInfomations;
								console.log('=----=----=', bootupInfomations);
								serverConfig = bootupInfomations.conf;

								it1.next(data);
							}
						);
					},
					function(it1, data){
						// config
						serverConfig = bootupInfomations.conf;
						_this.target_mode = serverConfig.target_mode;
						_this.theme_id = serverConfig.theme_id;
						_this.layout_id = serverConfig.layout_id;
						it1.next(data);
					} ,
					function(it1, data){
						var csv = bootupInfomations.languageCsv;
						_this.lb = new LangBank(csv, function(){
							console.log('pickles2-contents-editor: set language "'+_this.options.lang+'"');
							_this.lb.setLang( _this.options.lang );
							// console.log( _this.lb.get('ui_label.close') );
							it1.next(data);
						});
					} ,
					function(it1, data){
						var editorMode = bootupInfomations.editorMode;
						console.log(editorMode);
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
		 * create initialize options for broccoli-html-editor
		 */
		this.createBroccoliInitOptions = function(callback){
			callback = callback||function(){};
			var broccoliInitializeOptions = {};
			var px2ce = this;
			var px2conf;
			var customFields = {};

			new Promise(function(rlv){rlv();})
				.then(function(){ return new Promise(function(rlv, rjt){
					px2conf = bootupInfomations.projectConf;
					rlv();
				}); })
				.then(function(){ return new Promise(function(rlv, rjt){
					// プロジェクトが拡張するフィールド
					// クライアントサイドのライブラリをロードしておく
					var scripts = bootupInfomations.customFieldsClientSideLibs;
					it79.ary(scripts,
						function(itAry, scriptUrl, idx){
							var scr = document.createElement('script');
							scr.src = scriptUrl;
							scr.onload = function(e){
								// console.log('custom script loaded.', this, e);
								itAry.next();
							};
							// console.log(scr);
							scr.onerror = function(e){
								console.error('custom script NOT loaded.', this, e);
								itAry.next();
							};
							document.body.appendChild(scr);
						},
						function(){
							rlv();
						}
					);

				}); })
				.then(function(){ return new Promise(function(rlv, rjt){
					// フィールドを拡張

					// px2ce が拡張するフィールド
					customFields.table = window.BroccoliFieldTable;

					// 呼び出し元アプリが拡張するフィールド
					for( var idx in px2ce.options.customFields ){
						if( typeof(px2ce.options.customFields[idx]) == typeof(function(){}) ){
							customFields[idx] = px2ce.options.customFields[idx];
						}else{
							console.error( 'FAILED to load custom field: ' + idx + ' (frontend); Is NOT a Function.' );
						}
					}

					// プロジェクトが拡張するフィールド
					var confCustomFields = {};
					try {
						confCustomFields = px2conf.plugins.px2dt.guieditor.custom_fields;
						for( var fieldName in confCustomFields ){
							try {
								if( confCustomFields[fieldName].frontend.file && confCustomFields[fieldName].frontend.function ){
									// console.log(eval( confCustomFields[fieldName].frontend.function ));
									var tmpCustomFieldFunction = eval( confCustomFields[fieldName].frontend.function );
									if( typeof(tmpCustomFieldFunction) == typeof(function(){}) ){
										customFields[fieldName] = tmpCustomFieldFunction;
									}else{
										console.error( 'FAILED to load custom field: ' + fieldName + ' (frontend); Is NOT a Function.' );
									}
								}else{
									console.error( 'FAILED to load custom field: ' + fieldName + ' (frontend); unknown type.' );
								}
							} catch (e) {
								console.error( 'FAILED to load custom field: ' + fieldName + ' (frontend);', e );
							}
						}
					} catch (e) {
					}

					// console.log(customFields);

					rlv();
				}); })
				.then(function(){ return new Promise(function(rlv, rjt){
					var contents_area_selector = px2conf.plugins.px2dt.contents_area_selector;
					var contents_bowl_name_by = px2conf.plugins.px2dt.contents_bowl_name_by;
					if(_this.target_mode == 'theme_layout'){
						contents_area_selector = '[data-pickles2-theme-editor-contents-area]';
						contents_bowl_name_by = 'data-pickles2-theme-editor-contents-area';
					}

					broccoliInitializeOptions = {
						'elmCanvas': document.createElement('div'),
						'elmModulePalette': document.createElement('div'),
						'elmInstanceTreeView': document.createElement('div'),
						'elmInstancePathView': document.createElement('div'),
						'contents_area_selector': contents_area_selector,
							// ↑編集可能領域を探すためのクエリを設定します。
							//  この例では、data-contents属性が付いている要素が編集可能領域として認識されます。
						'contents_bowl_name_by': contents_bowl_name_by,
							// ↑bowlの名称を、data-contents属性値から取得します。
						'customFields': customFields,
						'lang': px2ce.options.lang,
						'gpiBridge': function(api, options, callback){
							// GPI(General Purpose Interface) Bridge
							// broccoliは、バックグラウンドで様々なデータ通信を行います。
							// GPIは、これらのデータ通信を行うための汎用的なAPIです。
							px2ce.gpiBridge(
								{
									'api': 'broccoliBridge',
									'page_path': _this.page_path,
									'forBroccoli':{
										'api': api,
										'options': options
									}
								},
								function(data){
									callback(data);
								}
							);
							return;
						},
						'clipboard': px2ce.options.clipboard,
						'onClickContentsLink': function( uri, data ){
							px2ce.onClickContentsLink( uri, data );
						},
						'onMessage': function( message ){
							// ユーザーへ知らせるメッセージを表示する
							px2ce.message(message);
						}
					};

					rlv();
				}); })
				.then(function(){ return new Promise(function(rlv, rjt){
					callback( broccoliInitializeOptions );
				}); })
			;

			return;
		}

		/**
		 * create broccoli-html-editor object
		 */
		this.createBroccoli = function(callback){
			callback = callback||function(){};

			var broccoli = new Broccoli();
			this.createBroccoliInitOptions(function( broccoliInitOptions ){
				broccoli.init(
					broccoliInitOptions ,
					function(){
						callback( broccoli );
					}
				);
			});
			return;
		}

		/**
		 * エディタオブジェクトを取得する
		 */
		this.getEditor = function(){
			return editor;
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
		 * 初期起動時にロードした情報を取得する
		 */
		this.getBootupInfomations = function(){
			return bootupInfomations;
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
