/**
 * pickles2-contents-editor.js
 */
module.exports = function(){
	var px2agent = require('px2agent');
	var fsx = require('fs-extra');
	var utils79 = require('utils79');
	var Promise = require('es6-promise').Promise;
	var _this = this;

	this.px2proj;
	this.page_path;

	this.init = function(options, callback){
		callback = callback||function(){};
		// console.log(options);

		this.entryScript = options.entryScript;
		this.px2proj = require('px2agent').createProject(options.entryScript);

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
	 * ページの編集方法を取得する
	 */
	this.checkEditorType = function(callback){
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
