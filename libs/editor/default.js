/**
 * default
 */
module.exports = function(px2ce){
	var utils79 = require('utils79');
	var fs = require('fs');
	var fsx = require('fs-extra');
	var utils79 = require('utils79');
	var Promise = require('es6-promise').Promise;
	var _this = this;

	/**
	 * コンテンツのソースを取得する
	 */
	this.getContentsSrc = function(callback){
		callback = callback||function(){};

		var pageInfo;
		var rtn = {
			'html': '',
			'css': '',
			'js': ''
		};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2ce.px2proj.get_page_info(px2ce.page_path, function(_pageInfo){
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
				px2ce.px2proj.get_path_content(px2ce.page_path, function(contPath){
					// console.log(contPath);

					px2ce.px2proj.get_path_docroot(function(contRoot){

						px2ce.px2proj.realpath_files(px2ce.page_path, '', function(realpath_resource_dir){
							realpath_resource_dir = require('path').resolve(realpath_resource_dir);
							var _contentsPath = require('path').resolve(contRoot + contPath);
							var strLoaderCSS = '<?php ob_start(); ?><link rel="stylesheet" href="./' + utils79.basename( realpath_resource_dir ) + '/style.css" /><?php $px->bowl()->send( ob_get_clean(), \'head\' );?>'+"\n";
							var strLoaderJS = '<?php ob_start(); ?><script src="./' + utils79.basename( realpath_resource_dir ) + '/script.js"></script><?php $px->bowl()->send( ob_get_clean(), \'foot\' );?>'+"\n";

							// console.log(_contentsPath);
							// console.log(realpath_resource_dir);
							// console.log(strLoaderCSS);
							// console.log(strLoaderJS);

							try {
								if( utils79.is_file( _contentsPath ) ){
									rtn.html = fs.readFileSync(_contentsPath).toString('utf8');
									rtn.html = rtn.html.replace( strLoaderCSS, '' );
									rtn.html = rtn.html.replace( strLoaderJS, '' );
								}
							} catch (e) {
							}
							try {
								if( utils79.is_file( realpath_resource_dir + '/style.css.scss' ) ){
									rtn.css = fs.readFileSync( realpath_resource_dir + '/style.css.scss' ).toString('utf8');
								}
							} catch (e) {
							}
							try {
								if( utils79.is_file( realpath_resource_dir + '/script.js' ) ){
									rtn.js = fs.readFileSync( realpath_resource_dir + '/script.js' ).toString('utf8');
								}
							} catch (e) {
							}

							rlv();
						});

					});
				});

			}); })
			.then(function(){
				callback(rtn);
			})
			.catch(function (err) {
				callback(rtn);
			})
		;

		return;
	}

	/**
	 * コンテンツのソースを保存する
	 */
	this.saveContentsSrc = function(codes, callback){
		callback = callback||function(){};
		// console.log(codes);

		var pageInfo;
		var result = {
			'result': true,
			'message': 'OK'
		};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2ce.px2proj.get_page_info(px2ce.page_path, function(_pageInfo){
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
				px2ce.px2proj.get_path_content(px2ce.page_path, function(contPath){
					// console.log(contPath);

					px2ce.px2proj.get_path_docroot(function(contRoot){

						px2ce.px2proj.realpath_files(px2ce.page_path, '', function(realpath_resource_dir){
							realpath_resource_dir = require('path').resolve(realpath_resource_dir);
							var _contentsPath = require('path').resolve(contRoot + contPath);
							var strLoaderCSS = '<?php ob_start(); ?><link rel="stylesheet" href="./' + utils79.basename( realpath_resource_dir ) + '/style.css" /><?php $px->bowl()->send( ob_get_clean(), \'head\' );?>'+"\n";
							var strLoaderJS = '<?php ob_start(); ?><script src="./' + utils79.basename( realpath_resource_dir ) + '/script.js"></script><?php $px->bowl()->send( ob_get_clean(), \'foot\' );?>'+"\n";

							// console.log(_contentsPath);
							// console.log(realpath_resource_dir);
							// console.log(strLoaderCSS);
							// console.log(strLoaderJS);

							try {
								fs.writeFileSync(_contentsPath, strLoaderCSS + strLoaderJS + codes.html);
							} catch (e) {
							}
							try {
								fsx.mkdirpSync( realpath_resource_dir );
								fs.writeFileSync( realpath_resource_dir + '/style.css.scss', codes.css );
								fs.writeFileSync( realpath_resource_dir + '/script.js', codes.js );
							} catch (e) {
							}

							rlv();
						});

					});
				});

			}); })
			.then(function(){
				callback(result);
			})
			.catch(function (err) {
				result = {
					'result': true,
					'message': (typeof(err) == typeof('') ? err : err.message)
				};
				callback(result);
			})
		;

		return;
	}


	return;
}
