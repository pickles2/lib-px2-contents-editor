/**
 * pickles2-contents-editor.js
 */
module.exports = function(){
	var px2agent = require('px2agent');
	var fs = require('fs');
	var fsx = require('fs-extra');
	var utils79 = require('utils79');
	var Promise = require('es6-promise').Promise;
	var _this = this;

	this.entryScript;
	this.px2proj;
	this.page_path;
	this.options;

	this.init = function(options, callback){
		callback = callback||function(){};
		// console.log(options);
		options = options || {};
		options.appMode = options.appMode || 'web'; // web | desktop
		options.customFields = options.customFields || {}; // custom fields
		options.log = options.log || function(msg){
			console.error(msg);
		};
		this.entryScript = options.entryScript;
		this.page_path = options.page_path;
		this.px2proj = require('px2agent').createProject(options.entryScript);
		this.options = options;

		this.page_path = this.page_path.replace( new RegExp('^(alias[0-9]*\\:)?\\/+'), '/' );
		this.page_path = this.page_path.replace( new RegExp('\\{(?:\\*|\\$)[\s\S]*\\}'), '' );

		this.getProjectInfo(function(pjInfo){
			// console.log(pjInfo);
			_this.px2conf = pjInfo.conf;
			_this.pageInfo = pjInfo.pageInfo;
			_this.documentRoot = pjInfo.documentRoot;
			_this.contRoot = pjInfo.contRoot;
			_this.realpathDataDir = pjInfo.realpathDataDir;
			_this.pathResourceDir = pjInfo.pathResourceDir;
			callback();
		});
	}

	/**
	 * プロジェクトの設定情報を取得する
	 */
	this.getProjectConf = function(callback){
		callback = callback || function(){};
		this.px2proj.get_config(function(val){
			callback(val);
		});
		return;
	}

	/**
	 * アプリケーションの実行モード設定を取得する (同期)
	 * @return string 'web'|'desktop'
	 */
	this.getAppMode = function(){
		var rtn = this.options.appMode;
		switch(rtn){
			case 'web':
			case 'desktop':
				break;
			default:
				rtn = 'web';
				break;
		}
		return rtn;
	}

	/**
	 * ブラウザでURLを開く
	 */
	this.openUrlInBrowser = function( url, callback ){
		console.log('open URL: ' + url);
		// console.log(px2ce.getAppMode());
		if( this.getAppMode() != 'desktop' ){
			callback(false);
			return;
		}
		var desktopUtils = require('desktop-utils');
		desktopUtils.open( url );
		callback(true);
		return;
	}

	/**
	 * リソースフォルダを開く
	 */
	this.openResourceDir = function( path, callback ){
		console.log('open resource dir: ' + path + ' of ' + _this.page_path);
		// console.log(px2ce.getAppMode());
		if( _this.getAppMode() != 'desktop' ){
			callback(false);
			return;
		}
		var desktopUtils = require('desktop-utils');
		_this.px2proj.realpath_files(_this.page_path, path, function(pathDir){
			// console.log(pathDir);
			desktopUtils.open( pathDir );
			callback(true);
		});
		return;
	}

	/**
	 * プロジェクト情報をまとめて取得する
	 */
	this.getProjectInfo = function(callback){
		callback = callback || function(){};
		var pjInfo = {};
		_this.px2proj.get_config(function(conf){
			pjInfo.conf = conf;

			_this.px2proj.get_page_info(_this.page_path, function(pageInfo){
				pjInfo.pageInfo = pageInfo;

				_this.px2proj.get_path_controot(function(contRoot){
					pjInfo.contRoot = contRoot;

					_this.px2proj.get_path_docroot(function(documentRoot){
						pjInfo.documentRoot = documentRoot;

						_this.px2proj.realpath_files(_this.page_path, '', function(realpathDataDir){
							realpathDataDir = require('path').resolve(realpathDataDir, 'guieditor.ignore')+'/';
							pjInfo.realpathDataDir = realpathDataDir;

							_this.px2proj.path_files(_this.page_path, '', function(pathResourceDir){
								pathResourceDir = require('path').resolve(pathResourceDir, 'resources')+'/';
								pathResourceDir = pathResourceDir.replace(new RegExp('\\\\','g'), '/').replace(new RegExp('^[a-zA-Z]\\:\\/'), '/');
									// Windows でボリュームラベル "C:" などが含まれるようなパスを渡すと、
									// broccoli-html-editor内 resourceMgr で
									// 「Uncaught RangeError: Maximum call stack size exceeded」が起きて落ちる。
									// ここで渡すのはウェブ側からみえる外部のパスでありサーバー内部パスではないので、
									// ボリュームラベルが付加された値を渡すのは間違い。

								pjInfo.pathResourceDir = pathResourceDir;

								callback(pjInfo);

							});
						});
					});
				});
			});
		});
	}

	/**
	 * コンテンツファイルを初期化する
	 */
	this.initContentFiles = function(editorType, callback){
		// console.log(_this.page_path);
		// console.log(editorType);
		var result = {
			'result': true,
			'message': 'OK'
		};

		callback = callback||function(){};
		editorType = editorType||'html';

		var pageInfo,
			prop = {}
		;

		/**
		 * パス文字列を解析する
		 */
		function parsePath( path ){
			var rtn = {};
			rtn.path = path;
			rtn.basename = utils79.basename( rtn.path );
			rtn.dirname = utils79.dirname( rtn.path );
			rtn.ext = rtn.basename.replace( new RegExp('^.*\\.'), '' );
			rtn.basenameExtless = rtn.basename.replace( new RegExp('\\.'+utils79.regexp_quote(rtn.ext)+'$'), '' );
			return rtn;
		}

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.get_page_info(_this.page_path, function(_pageInfo){
					pageInfo = _pageInfo;
					// console.log(pageInfo);
					if( pageInfo == null ){
						rjt('Page not Exists.');
						return;
					}
					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.get_path_content(_this.page_path, function(contPath){
					// console.log(contPath);

					_this.px2proj.get_path_controot(function(contRoot){
						_this.px2proj.get_path_docroot(function(docRoot){
							if( fs.existsSync( docRoot + contRoot + contPath ) ){
								rjt('Content Already Exists.');
								return;
							}
							switch( editorType ){
								case 'html.gui':
								case 'html':
								case 'md':
									// OK
									break;
								default:
									rjt('Unknown editor-type "'+editorType+'".');
									return;
									break;
							}

							var pathInfo = parsePath( docRoot + contRoot + contPath );
							prop.realpath_cont = pathInfo.path;

							_this.px2proj.realpath_files(_this.page_path, '', function(realpath_resource_dir){
								prop.realpath_resource_dir = realpath_resource_dir;
								prop.editor_type = editorType;
								if( prop.editor_type == 'md' ){
									prop.realpath_cont += '.'+prop.editor_type;
								}

								rlv();

							});

						});
					});
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// 格納ディレクトリを作る
				if( utils79.is_dir( utils79.dirname( prop.realpath_cont ) ) ){
					rlv();
					return;
				}
				// 再帰的に作る fsx.mkdirpSync()
				var dirpath = utils79.dirname( prop.realpath_cont );
				if( !fsx.mkdirpSync( dirpath ) ){
					rjt('FAILED to mkdirp - '+dirpath);
					return;
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// コンテンツ自体を作る
				fs.writeFile( prop.realpath_cont, '', function(err){
					if( err ){
						rjt(err);
						return;
					}
					rlv();
				} );
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// リソースディレクトリを作る
				if( !utils79.is_dir( prop.realpath_resource_dir ) ){
					fsx.mkdirpSync( prop.realpath_resource_dir );
				}
				if( prop.editor_type == 'html.gui' ){
					try {
						fs.mkdirSync( prop.realpath_resource_dir + '/guieditor.ignore/' );
					} catch (e) {
						rlv();
					} finally {
						fs.writeFile( prop.realpath_resource_dir + '/guieditor.ignore/data.json', '{}', function(err){
							if( err ){
								rjt(err);
								return;
							}
							rlv();
						} );
					}

				}else{
					rlv();
				}
			}); })
			.then(function(){
				callback(result);
			})
			.catch(function (err) {
				result = {
					'result': false,
					'message': (typeof(err) == typeof('') ? err : err.message)
				};
				callback(result);
			})
		;

		return;
	}

	/**
	 * ページの編集方法を取得する
	 */
	this.checkEditorType = function(callback){
		callback = callback||function(){};
		this.getProjectInfo(function(pjInfo){
			// console.log(pjInfo);
			var rtn = '.not_exists';
			if( pjInfo.pageInfo === null ){
				callback('.page_not_exists');
				return;
			}
			if( utils79.is_file( pjInfo.documentRoot + pjInfo.contRoot + pjInfo.pageInfo.content ) ){
				rtn = 'html';
				if( utils79.is_file( pjInfo.realpathDataDir + '/data.json' ) ){
					rtn = 'html.gui';
				}

			}else if( utils79.is_file( pjInfo.documentRoot + pjInfo.contRoot + pjInfo.pageInfo.content + '.md' ) ){
				rtn = 'md';
			}
			callback(rtn);
		});
		return;
	}

	/**
	 * create broccoli-html-editor object
	 */
	this.createBroccoli = function(callback){
		callback = callback||function(){};
		var Broccoli = require('broccoli-html-editor');
		var broccoli = new Broccoli();
		var px2ce = this;

		var px2proj = px2ce.px2proj,
			page_path = px2ce.page_path,
			px2conf = px2ce.px2conf,
			pageInfo = px2ce.pageInfo,
			contRoot = px2ce.contRoot,
			documentRoot = px2ce.documentRoot,
			realpathDataDir = px2ce.realpathDataDir,
			pathResourceDir = px2ce.pathResourceDir
		;
		var customFields = {};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// フィールドを拡張

				// px2ce が拡張するフィールド
				customFields.table = require('broccoli-field-table');

				// 呼び出し元アプリが拡張するフィールド
				for( var idx in px2ce.options.customFields ){
					customFields[idx] = px2ce.options.customFields[idx];
				}

				// プロジェクトが拡張するフィールド
				var confCustomFields = {};
				try {
					confCustomFields = px2conf.plugins.px2dt.guieditor.custom_fields;
					for( var fieldName in confCustomFields ){
						try {
							if( confCustomFields[fieldName].backend.require ){
								var path_backend_field = require('path').resolve(px2ce.entryScript, '..', confCustomFields[fieldName].backend.require);
								customFields[fieldName] = require( path_backend_field );
							}else{
								console.error( 'FAILED to load custom field: ' + fieldName + ' (backend);' );
								console.error( 'unknown type' );
							}
						} catch (e) {
							console.error( 'FAILED to load custom field: ' + fieldName + ' (backend);' );
							console.error(e);
						}
					}
				} catch (e) {
				}

				// console.log(customFields);

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				for( var idx in px2conf.plugins.px2dt.paths_module_template ){
					px2conf.plugins.px2dt.paths_module_template[idx] = require('path').resolve( px2ce.entryScript, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log(px2conf.plugins.px2dt);
				function bind( tpl ){
					var data = {
						'dirname' : utils79.normalize_path( utils79.dirname( pageInfo.content ) ),
						'filename' : utils79.basename( (function(path){
							var rtn = path.replace( new RegExp('\\.[a-zA-Z0-9\\_\\-]+$'), '' );
							return rtn;
						})( pageInfo.content ) ),
						'ext' : (function(path){
							path.match( new RegExp('\\.([a-zA-Z0-9\\_\\-]+)$') );
							var rtn = (RegExp.$1).toLowerCase();
							return rtn;
						})( pageInfo.content )
					};

					tpl = tpl.replace( '{$dirname}', data['dirname'] );
					tpl = tpl.replace( '{$filename}', data['filename'] );
					tpl = tpl.replace( '{$ext}', data['ext'] );

					tpl = utils79.normalize_path( tpl );

					return tpl;
				}

				try {
					if( px2conf.plugins.px2dt.guieditor.path_resource_dir ){
						pathResourceDir = bind( px2conf.plugins.px2dt.guieditor.path_resource_dir );
						pathResourceDir = require('path').resolve('/' + px2conf.path_controot + '/' + pathResourceDir)+'/';
						// console.log(pathResourceDir);
					}
				} catch (e) {
				}

				try {
					if( px2conf.plugins.px2dt.guieditor.path_data_dir ){
						realpathDataDir = bind( px2conf.plugins.px2dt.guieditor.path_data_dir );
						realpathDataDir = require('path').resolve('/', documentRoot+'/'+px2conf.path_controot + '/' + realpathDataDir)+'/';
						// console.log(realpathDataDir);
					}
				} catch (e) {
				}

				// console.log(pathResourceDir);
				// console.log(realpathDataDir);
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				broccoli.init(
					{
						'appMode': px2ce.getAppMode() ,
						'paths_module_template': px2conf.plugins.px2dt.paths_module_template ,
						'documentRoot': documentRoot,// realpath
						'pathHtml': require('path').resolve(px2conf.path_controot, './'+pageInfo.content),
						'pathResourceDir': pathResourceDir,
						'realpathDataDir':  realpathDataDir,
						'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
						'customFields': customFields ,
						'bindTemplate': function(htmls, callback){
							var fin = '';
							for( var bowlId in htmls ){
								if( bowlId == 'main' ){
									fin += htmls['main'];
								}else{
									fin += "\n";
									fin += "\n";
									fin += '<?php ob_start(); ?>'+"\n";
									fin += htmls[bowlId]+"\n";
									fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
									fin += "\n";
								}
							}
							callback(fin);
							return;
						},
						'log': function(msg){
							// エラー発生時にコールされます。
							px2ce.log(msg);
						}
					},
					function(){
						rlv();
					}
				);
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				callback(broccoli);
			}); })
		;

		return;
	}

	/**
	 * 汎用API
	 */
	this.gpi = function(data, callback){
		callback = callback||function(){};
		// this.page_path = data.page_path;
		// console.log(this.page_path);
		var gpi = require( __dirname+'/gpi.js' );
		gpi(
			this,
			data,
			function(rtn){
				callback(rtn);
			}
		);
		return this;
	}

	/**
	 * ログファイルにメッセージを出力する
	 */
	this.log = function(msg){
		this.options.log(msg);
		return;
	}
}
