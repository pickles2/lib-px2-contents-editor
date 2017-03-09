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
	var nodePhpBinOptions;

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
		options.customFieldsIncludePath = options.customFieldsIncludePath || {}; // custom fields include path (for cliend libs)
		options.log = options.log || function(msg){
			console.error(msg);
		};
		this.entryScript = options.entryScript;
		this.page_path = options.page_path;

		nodePhpBinOptions = (function(cmds){
			try {
				var nodePhpBinOptions = cmds.php;
				if(!nodePhpBinOptions){
					return undefined;
				}
				if( typeof(nodePhpBinOptions) == typeof('') ){
					nodePhpBinOptions = {
						'bin': nodePhpBinOptions,
						'ini': null
					};
				}
				return nodePhpBinOptions;
			} catch (e) {
			}
			return undefined;
		})(options.commands);

		this.px2proj = require('px2agent').createProject(options.entryScript, nodePhpBinOptions);
		this.options = options;

		this.page_path = this.page_path.replace( new RegExp('^(alias[0-9]*\\:)?\\/+'), '/' );
		this.page_path = this.page_path.replace( new RegExp('\\{(?:\\*|\\$)[\s\S]*\\}'), '' );

		this.getProjectInfo(function(pjInfo){
			// console.log(pjInfo);
			_this.pjInfo = pjInfo;
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

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.query(_this.page_path+'?PX=px2dthelper.get.all', {
					"output": "json",
					"complete": function(data, code){
						try {
							var allData = JSON.parse(data);
							if( typeof(allData) !== typeof({}) ){
								console.error("Error: Parsed JSON from `PX=px2dthelper.get.all` is NOT a object.", allData);
								rlv();
								return;
							}
							if( typeof(allData.config) !== typeof({}) ){
								console.error("Error: Parsed JSON from `PX=px2dthelper.get.all` is NOT conains a config object.", allData);
								rlv();
								return;
							}
							// console.log(allData, code);

							pjInfo.conf = allData.config;
							pjInfo.pageInfo = allData.page_info;
							pjInfo.contRoot = allData.path_controot;
							pjInfo.documentRoot = allData.realpath_docroot;
							pjInfo.realpathFiles = allData.realpath_files;
							pjInfo.pathFiles = allData.path_files;
							pjInfo.realpathDataDir = allData.realpath_data_dir;
							pjInfo.pathResourceDir = allData.path_resource_dir;
							pjInfo.realpath_homedir = allData.realpath_homedir;
							callback(pjInfo);
							return;

						} catch (e) {
							// うまく解析できなかったら、
							// 旧来の方法で個別に取得する
							console.error("Error: FAILED to parse JSON from `PX=px2dthelper.get.all`.");
							rlv();
							return;
						}
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.get_config(function(conf){
					pjInfo.conf = conf;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.get_page_info(_this.page_path, function(pageInfo){
					pjInfo.pageInfo = pageInfo;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.get_path_controot(function(contRoot){
					pjInfo.contRoot = contRoot;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.get_path_docroot(function(documentRoot){
					pjInfo.documentRoot = documentRoot;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.realpath_files(_this.page_path, '', function(realpathFiles){
					pjInfo.realpathFiles = realpathFiles;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.path_files(_this.page_path, '', function(pathFiles){
					pjInfo.pathFiles = pathFiles;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.query(_this.page_path+'?PX=px2dthelper.get.realpath_data_dir', {
					"output": "json",
					"complete": function(data, code){
						// console.log(data, code);
						pjInfo.realpathDataDir = JSON.parse(data);
						rlv();
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.px2proj.query(_this.page_path+'?PX=px2dthelper.get.path_resource_dir', {
					"output": "json",
					"complete": function(data, code){
						// console.log(data, code);
						pjInfo.pathResourceDir = JSON.parse(data);
						rlv();
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log(pjInfo);
				callback(pjInfo);
			}); })
		;

		return;
	} // getProjectInfo()

	/**
	 * コンテンツファイルを初期化する
	 */
	this.initContentFiles = function(editorMode, callback){
		_this.px2proj.query(
			_this.page_path+'?PX=px2dthelper.init_content&editor_mode='+editorMode, {
				"output": "json",
				"complete": function(data, code){
					// console.log(data, code);
					var rtn = JSON.parse(data);
					callback(rtn);
					return;
				}
			}
		);
		return;
	}

	/**
	 * ページの編集方法を取得する
	 */
	this.checkEditorMode = function(callback){
		_this.px2proj.query(
			_this.page_path+'?PX=px2dthelper.check_editor_mode', {
				"output": "json",
				"complete": function(data, code){
					// console.log(data, code);
					var rtn = JSON.parse(data);
					callback(rtn);
					return;
				}
			}
		);
		return;
	}

	/**
	 * create initialize options for broccoli-html-editor
	 */
	this.createBroccoliInitOptions = function(callback){
		callback = callback||function(){};
		var broccoliInitializeOptions = {};
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
		var page_content = _this.page_path;
		try {
			page_content = pageInfo.content;
		} catch (e) {
		}

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// フィールドを拡張

				// px2ce が拡張するフィールド
				customFields.table = require('broccoli-field-table').get({'php': nodePhpBinOptions});

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
				// モジュールてプレートを収集
				for( var idx in px2conf.plugins.px2dt.paths_module_template ){
					px2conf.plugins.px2dt.paths_module_template[idx] = require('path').resolve( px2ce.entryScript, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				broccoliInitializeOptions = {
					'appMode': px2ce.getAppMode() ,
					'paths_module_template': px2conf.plugins.px2dt.paths_module_template ,
					'documentRoot': documentRoot,// realpath
					'pathHtml': require('path').resolve(px2conf.path_controot, './'+page_content),
					'pathResourceDir': _this.pathResourceDir,
					'realpathDataDir':  _this.realpathDataDir,
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
				}
				rlv();
				return;
			}); })
			.then(function(){
				callback( broccoliInitializeOptions );
				return;
			})
		;

		return;
	}

	/**
	 * create broccoli-html-editor object
	 */
	this.createBroccoli = function(callback){
		callback = callback||function(){};
		var broccoliInitializeOptions = {};
		var Broccoli = require('broccoli-html-editor');
		var broccoli = new Broccoli();

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.createBroccoliInitOptions(function(opts){
					broccoliInitializeOptions = opts;
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				broccoli.init(
					broccoliInitializeOptions,
					function(){
						rlv();
					}
				);
				return;
			}); })
			.then(function(){
				callback(broccoli);
			})
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
