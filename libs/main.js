/**
 * pickles2-contents-editor.js
 */
module.exports = function(){
	var px2agent = require('px2agent');
	var ejs = require('ejs');
	var fs = require('fs');
	var fsx = require('fs-extra');
	var utils79 = require('utils79');
	var Promise = require('es6-promise').Promise;
	var _this = this;
	var nodePhpBinOptions;

	/**
	 * 編集対象のモード
	 * コンテンツ以外にも対応範囲を拡大
	 * - `page_content` = ページコンテンツ(デフォルト)
	 * - `theme_layout` = テーマレイアウトテンプレート(px2-multithemeの仕様に準拠)
	 */
	this.target_mode;

	/**
	 * ページのパス
	 * `target_mode` が `theme_layout` の場合、
	 * `page_path` は `{$theme_id}/{$layout_id}.html` の形式を取る
	 */
	this.page_path;

	this.entryScript;
	this.px2proj;

	/**
	 * テーマID
	 * `target_mode` が `theme_layout` の場合に値を持つ。
	 * `this.page_path` をパースして生成。
	 */
	this.theme_id;
	/**
	 * レイアウトID
	 * `target_mode` が `theme_layout` の場合に値を持つ。
	 * `this.page_path` をパースして生成。
	 */
	this.layout_id;

	this.options;

	/**
	 * Initialize
	 */
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
		this.target_mode = options.target_mode || 'page_content';
		this.page_path = options.page_path;
		if(typeof(this.page_path) !== typeof('')){
			// 編集対象ページが指定されていない場合
			return;
		}

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
			_this.realpathFiles = pjInfo.realpathFiles;
			if( _this.target_mode == 'theme_layout' ){
				if( _this.page_path.match(/^\/([\s\S]+?)\/([\s\S]+)\.html$/) ){
					_this.theme_id = RegExp.$1;
					_this.layout_id = RegExp.$2;
				}
				_this.documentRoot = pjInfo.realpathThemeCollectionDir;
				_this.contRoot = '/';
				_this.realpathFiles = pjInfo.realpathThemeCollectionDir+_this.theme_id+'/theme_files/layouts/'+_this.layout_id+'/';
				_this.pathResourceDir = pjInfo.realpathThemeCollectionDir+_this.theme_id+'/theme_files/layouts/'+_this.layout_id+'/resources/';
				_this.realpathDataDir = pjInfo.realpathThemeCollectionDir+_this.theme_id+'/guieditor.ignore/'+_this.layout_id+'/data/';
				// console.log(_this, '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
			}
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
							pjInfo.realpathThemeCollectionDir = allData.realpath_theme_collection_dir;
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
	 * モジュールCSS,JSソースを取得する
	 */
	this.getModuleCssJsSrc = function(callback){
		callback = callback || function(){};
		var rtn = {};
		_this.createBroccoli(function(broccoli){
			broccoli.buildModuleCss(function(data){
				rtn.css = data;
				broccoli.buildModuleJs(function(data){
					rtn.js = data;
					callback(rtn);
				});
			});
		});
		return;
	}

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
		if( this.target_mode == 'theme_layout' ){
			// ドキュメントルートの設定上書きがある場合
			// テーマレイアウトの編集等に利用するモード
			// console.log([_this.documentRoot,
			// 	_this.contRoot,
			// 	_this.realpathFiles,
			// 	_this.pathResourceDir,
			// 	_this.realpathDataDir]);

			if( !utils79.is_file( _this.documentRoot + _this.page_path ) ){
				callback('.not_exists');
				return;
			}
			if( utils79.is_file( _this.realpathDataDir + 'data.json' ) ){
				callback('html.gui');
				return;
			}
			callback('html');
			return;
		}
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
		var px2ce = this;

		var px2proj = px2ce.px2proj,
			page_path = px2ce.page_path,
			px2conf = px2ce.px2conf,
			pageInfo = px2ce.pageInfo,
			contRoot = px2ce.contRoot,
			documentRoot = px2ce.documentRoot,
			realpathDataDir = px2ce.realpathDataDir,
			pathResourceDir = px2ce.pathResourceDir,
			pathsModuleTemplate = [],
			bindTemplate = function(){}
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
				// モジュールテンプレートを収集
				// (指定モジュールをロード)
				for( var idx in px2conf.plugins.px2dt.paths_module_template ){
					pathsModuleTemplate[idx] = require('path').resolve( px2ce.entryScript, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// モジュールテンプレートを収集
				// (モジュールフォルダからロード)
				var pathModuleDir = px2conf.plugins.px2dt.path_module_templates_dir;
				if( typeof(pathModuleDir) != typeof('') ){
					// モジュールフォルダの指定がない場合
					rlv();
					return;
				}
				pathModuleDir = require('path').resolve( px2ce.entryScript, '..', pathModuleDir )+'/';
				if( !utils79.is_dir(pathModuleDir) ){
					// 指定されたモジュールフォルダが存在しない場合
					rlv();
					return;
				}

				// info.json を読み込み
				var infoJson = {};
				if( utils79.is_file(pathModuleDir+'/info.json') ){
					try {
						var srcInfoJson = require('fs').readFileSync(pathModuleDir+'/info.json');
						infoJson = JSON.parse(srcInfoJson);
					} catch (e) {
						console.error('Failed to info.json; '+pathModuleDir+'/info.json');
					}
				}
				if( typeof(infoJson.sort) == typeof([]) ){
					// 並び順の指定がある場合
					for( var idx in infoJson.sort ){
						if( pathsModuleTemplate[infoJson.sort[idx]] ){
							// 既に登録済みのパッケージIDは上書きしない
							// (= paths_module_template の設定を優先)
							continue;
						}
						if( utils79.is_dir(pathModuleDir+infoJson.sort[idx]) ){
							pathsModuleTemplate[infoJson.sort[idx]] = pathModuleDir+infoJson.sort[idx];
						}
					}
				}

				// モジュールディレクトリ中のパッケージをスキャンして一覧に追加
				var fileList = require('fs').readdirSync(pathModuleDir);
				fileList.sort(); // sort
				for( var idx in fileList ){
					if( pathsModuleTemplate[fileList[idx]] ){
						// 既に登録済みのパッケージIDは上書きしない
						// (= paths_module_template の設定を優先)
						continue;
					}
					if( utils79.is_dir(pathModuleDir+fileList[idx]) ){
						pathsModuleTemplate[fileList[idx]] = pathModuleDir+fileList[idx];
					}
				}

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// モジュールテンプレートを収集
				// (テーマエディタの拡張モジュールをロード)
				if( _this.target_mode == 'theme_layout' ){
					var tmpPathsModuleTemplate = {};
					tmpPathsModuleTemplate['themeEditorModules'] = require('path').resolve(__dirname, '../broccoli_assets/modules/theme_templates/')+'/';
					pathsModuleTemplate = Object.assign(tmpPathsModuleTemplate, pathsModuleTemplate);
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				if( _this.target_mode == 'theme_layout' ){
					bindTemplate = function(htmls, callback){
						var fin = '';
						for( var bowlId in htmls ){
							if( bowlId == 'main' ){
								fin += htmls['main'];
							}else{
								fin += "\n";
								fin += "\n";
								fin += '<?php ob_start(); ?>'+"\n";
								fin += (utils79.toStr(htmls[bowlId]).length ? htmls[bowlId]+"\n" : '');
								fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
								fin += "\n";
							}
						}
						var template = fs.readFileSync( __dirname+'/tpls/broccoli_theme_layout.html' ).toString();
						fin = ejs.render(template, {'body': fin}, {delimiter: '%'});

						var baseDir = _this.documentRoot+_this.theme_id+'/theme_files/';
						fsx.ensureDirSync( baseDir );
						_this.getModuleCssJsSrc(function(CssJs){
							fs.writeFileSync(baseDir+'modules.css', CssJs.css);
							fs.writeFileSync(baseDir+'modules.js', CssJs.js);
							callback(fin);
						});

						return;
					}
				}else{
					bindTemplate = function(htmls, callback){
						var fin = '';
						for( var bowlId in htmls ){
							if( bowlId == 'main' ){
								fin += htmls['main'];
							}else{
								fin += "\n";
								fin += "\n";
								fin += '<?php ob_start(); ?>'+"\n";
								fin += (utils79.toStr(htmls[bowlId]).length ? htmls[bowlId]+"\n" : '');
								fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
								fin += "\n";
							}
						}
						callback(fin);
						return;
					}
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				broccoliInitializeOptions = {
					'appMode': px2ce.getAppMode() ,
					'paths_module_template': pathsModuleTemplate ,
					'documentRoot': documentRoot,// realpath
					'pathHtml': require('path').resolve(_this.contRoot, './'+page_content),
					'pathResourceDir': _this.pathResourceDir,
					'realpathDataDir':  _this.realpathDataDir,
					'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
					'customFields': customFields ,
					'bindTemplate': bindTemplate,
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
