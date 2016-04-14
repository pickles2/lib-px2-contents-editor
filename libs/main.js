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

		this.entryScript = options.entryScript;
		this.px2proj = require('px2agent').createProject(options.entryScript);
		this.options = options;

		callback();
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
	this.openUrlInBrowser = function( url ){
		console.log('open URL: ' + url);
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

					_this.px2proj.get_path_docroot(function(contRoot){
						if( fs.existsSync( contRoot + contPath ) ){
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

						var pathInfo = parsePath( contRoot + contPath );
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
			if( utils79.is_file( pjInfo.documentRoot + pjInfo.pageInfo.content ) ){
				rtn = 'html';
				if( utils79.is_file( pjInfo.realpathDataDir + '/data.json' ) ){
					rtn = 'html.gui';
				}

			}else if( utils79.is_file( pjInfo.documentRoot + pjInfo.pageInfo.content + '.md' ) ){
				rtn = 'md';
			}
			callback(rtn);
		});
		return;
	}

	/**
	 * 汎用API
	 */
	this.gpi = function(data, callback){
		callback = callback||function(){};
		this.page_path = data.page_path;
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

}
