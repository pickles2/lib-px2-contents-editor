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

	window.Pickles2ContentsEditor = function(){
		var _this = this;
		var $ = require('jquery');
		var it79 = require('iterate79');
		const Twig = require('twig');
		var $canvas;
		this.__dirname = __dirname;
		this.options = {};
		this.page_path;
		this.module_id;
		this.target_mode;
		this.theme_id;
		this.layout_id;

		require('px2style/dist/px2style.js');
		var px2style = window.px2style;
		this.px2style = px2style;

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

			this.options = options;
			this.options.customFields = this.options.customFields || {}; // custom fields
			this.options.gpiBridge = this.options.gpiBridge || function(){ alert('gpiBridge required.'); };
			this.options.complete = this.options.complete || function(){ alert('finished.'); };
			this.options.onOpenFilesDirectory = this.options.onOpenFilesDirectory || null;
			this.options.onClickContentsLink = this.options.onClickContentsLink || function(uri, data){ alert('onClickContentsLink: '+uri); };
			this.options.onMessage = this.options.onMessage || function(message){ alert('onMessage: '+message); };
			this.options.preview = this.options.preview || {};
			this.options.lang = this.options.lang || 'en';
			this.options.appearance = this.options.appearance || 'auto';
			this.options.clipboard = this.options.clipboard || {};
			this.options.clipboard.set = this.options.clipboard.set || null;
			this.options.clipboard.get = this.options.clipboard.get || null;

			this.page_path = this.options.page_path;
			this.module_id = this.options.module_id;

			try {
				this.page_path = this.page_path.replace( new RegExp('^(alias[0-9]*\\:)?\\/+'), '/' );
				this.page_path = this.page_path.replace( new RegExp('\\{(?:\\*|\\$)[\s\S]*\\}'), '' );
			} catch (e) {
			}
			if(!this.page_path){
				// page_path option is required
				return false;
			}

			var $canvasWrap = $(options.elmCanvas);
			$canvasWrap.addClass('pickles2-contents-editor');
			$canvasWrap.html('<div class="pickles2-contents-editor__inner">');
			$canvas = $canvasWrap.find('.pickles2-contents-editor__inner');
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
								serverConfig = bootupInfomations.conf;
								it1.next(data);
							}
						);
					},
					function(it1, data){
						// config
						serverConfig = bootupInfomations.conf;
						_this.target_mode = serverConfig.target_mode;
						_this.module_id = serverConfig.module_id;
						_this.theme_id = serverConfig.theme_id;
						_this.layout_id = serverConfig.layout_id;
						it1.next(data);
					} ,
					function(it1, data){
						var csv = bootupInfomations.languageCsv;
						_this.lb = new LangBank(csv, function(){
							_this.lb.setLang( _this.options.lang );
							it1.next(data);
						});
					} ,
					function(it1, data){
						var editorMode = bootupInfomations.editorMode;
						var editorOption = {
							'editorMode': editorMode,
							'serverConfig': serverConfig
						};

						if( !bootupInfomations.permission ){
							// 権限が不足している場合
							$canvas.html('<p>Insufficient permissions.</p>');
							editor = new (require('./editor/not_permitted/not_permitted.js'))(_this);
							editor.init(editorOption, function(){
								it1.next(data);
							});
							return;
						}

						if(_this.target_mode == 'module'){
							switch(editorMode){
								case '.page_not_exists':
								case '.not_exists':
									// コンテンツが存在しない場合
									$canvas.html('<p>Content does not exist.</p>');
									editor = new (require('./moduleEditor/not_exists/not_exists.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case '.clip':
									// クリップモジュール
									$canvas.html('<p>Start the text editor.</p>');
									editor = new (require('./moduleEditor/clip/clip.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case 'kflow':
									// ビジュアルエディタ(kflow)を起動
									$canvas.html('<p>Start the visual editor.</p>');
									editor = new (require('./moduleEditor/kflow/kflow.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case 'html':
								case 'twig':
								default:
									// defaultテキストエディタを起動
									$canvas.html('<p>Start the text editor.</p>');
									editor = new (require('./moduleEditor/default/default.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;
							}
						}else{
							switch(editorMode){
								case '.page_not_exists':
									// ページ自体が存在しない場合
									$canvas.html('<p>Page does not exist.</p>');
									editor = new (require('./editor/not_exists/not_exists.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case '.not_exists':
									// コンテンツが存在しない場合
									$canvas.html('<p>Content does not exist.</p>');
									editor = new (require('./editor/not_exists/not_exists.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case 'html.gui':
									// ブロックエディタを起動
									$canvas.html('<p>Start the block editor.</p>');
									editor = new (require('./editor/broccoli/broccoli.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case 'kflow':
									// ビジュアルエディタ(kflow)を起動
									$canvas.html('<p>Start the visual editor.</p>');
									editor = new (require('./editor/kflow/kflow.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;

								case 'html':
								case 'md':
								default:
									// defaultテキストエディタを起動
									$canvas.html('<p>Start the text editor.</p>');
									editor = new (require('./editor/default/default.js'))(_this);
									editor.init(editorOption, function(){
										it1.next(data);
									});
									break;
							}
						}
					} ,
					function(it1, data){
						callback();
					}
				]
			);
		}

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
					// console.log('open URL: ' + url);
				}
			);
			return;
		}

		/**
		 * リソースフォルダを開く
		 */
		this.openResourceDir = function(){
			if( this.options.onOpenFilesDirectory ){
				this.options.onOpenFilesDirectory();
				return;
			}

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
					// console.log('open resource directory of:', _this.page_path, res);
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
			var droppedFileOperator = {};

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
								itAry.next();
							};
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

					// ファイルのドロップに対する処理の追加
					var confDroppedFileOperator = {};
					try {
						confDroppedFileOperator = px2conf.plugins.px2dt.guieditor.dropped_file_operator;
						for( var extOrMimetypeName in confDroppedFileOperator ){
							try {
								if( confDroppedFileOperator[extOrMimetypeName].file && confDroppedFileOperator[extOrMimetypeName].function ){
									var tmpCustomFieldFunction = eval( confDroppedFileOperator[extOrMimetypeName].function );
									if( typeof(tmpCustomFieldFunction) == typeof(function(){}) ){
										droppedFileOperator[extOrMimetypeName] = tmpCustomFieldFunction;
									}else{
										console.error( 'FAILED to load custom field: ' + extOrMimetypeName + ' (frontend); Is NOT a Function.' );
									}
								}else{
									console.error( 'FAILED to load custom field: ' + extOrMimetypeName + ' (frontend); unknown type.' );
								}
							} catch (e) {
								console.error( 'FAILED to load custom field: ' + extOrMimetypeName + ' (frontend);', e );
							}
						}
					} catch (e) {
					}

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
						'droppedFileOperator': droppedFileOperator,
						'lang': px2ce.options.lang,
						'appearance': px2ce.options.appearance,
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
		 * 画像のプレースホルダーを取得する
		 * @return string プレースホルダ画像のデータURL
		 */
		this.getNoimagePlaceholder = function(){
			return bootupInfomations.noimagePlaceholder;
		}

		/**
		 * Twig テンプレートにデータをバインドする
		 */
		this.bindTwig = function(tpl, data, funcs){
			let rtn = '';
			let twig;
			try {
				twig = Twig.twig;

				if(funcs && typeof(funcs) == typeof({})){
					Object.keys(funcs).forEach( ($fncName, index) => {
						const $callback = funcs[$fncName];
						Twig.extendFunction($fncName, $callback);
					});
				}

				const bindData = {
					...data,
					lb: this.lb,
				};

				rtn = new twig({
					'data': tpl,
					'autoescape': true,
				}).render(bindData);
			} catch(e) {
				const errorMessage = 'TemplateEngine "Twig" Rendering ERROR.';
				console.error( errorMessage );
				rtn = errorMessage;
			}
			return rtn;
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
		 * 位置合わせ
		 */
		this.adjust = function( callback ){
			callback = callback || function(){};
			if(editor){
				editor.adjust(function(){
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
