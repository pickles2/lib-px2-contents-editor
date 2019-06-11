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

		var rtn = {
			'html': '',
			'css': '',
			'js': ''
		};

		var _targetPaths;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				generateTargetFilePath(function(paths){
					if( paths === false ){
						rjt('Page not Exists.');
						return;
					}
					_targetPaths = paths;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				var _contentsPath = _targetPaths.contentsPath;
				var realpath_resource_dir = _targetPaths.realpathFiles;
				var strLoaderCSS = _targetPaths.strLoaderCSS;
				var strLoaderJS = _targetPaths.strLoaderJS;

				try {
					if( utils79.is_file( _contentsPath ) ){
						rtn.html = fs.readFileSync(_contentsPath).toString('utf8');
						rtn.html = rtn.html.replace( strLoaderCSS, '' );
						rtn.html = rtn.html.replace( strLoaderJS, '' );

						// ↓古いメソッド名も削除
						rtn.html = rtn.html.replace( '<?php ob_start(); ?><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?>" /><?php $px->bowl()->send( ob_get_clean(), \'head\' );?>'+"\n", '' );
						rtn.html = rtn.html.replace( '<?php ob_start(); ?><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?>"></script><?php $px->bowl()->send( ob_get_clean(), \'foot\' );?>'+"\n", '' );
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

		var result = {
			'result': true,
			'message': 'OK'
		};

		var _targetPaths;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				generateTargetFilePath(function(paths){
					if( paths === false ){
						rjt('Page not Exists.');
						return;
					}
					_targetPaths = paths;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				var _contentsPath = _targetPaths.contentsPath;
				var realpath_resource_dir = _targetPaths.realpathFiles;
				var strLoaderCSS = _targetPaths.strLoaderCSS;
				var strLoaderJS = _targetPaths.strLoaderJS;

				try {
					if( codes.html !== undefined ){
						if( !codes.css.length ){
							strLoaderCSS = '';
						}
						if( !codes.js.length ){
							strLoaderJS = '';
						}

						if( px2ce.target_mode == 'theme_layout' ){
							codes.html = codes.html.replace( /(\s*\<\/head\>)/, strLoaderCSS+strLoaderJS+'$1' );
							fs.writeFileSync(_contentsPath, codes.html);
						}else{
							fs.writeFileSync(_contentsPath, strLoaderCSS + strLoaderJS + codes.html);
						}
					}

				} catch (e) {
				}

				try {
					if( codes.css !== undefined ){
						fsx.mkdirpSync( realpath_resource_dir );
						if( !codes.css.length ){
							fs.unlinkSync( realpath_resource_dir + '/style.css.scss' );
						}else{
							fs.writeFileSync( realpath_resource_dir + '/style.css.scss', codes.css );
						}
					}
				} catch (e) {
				}

				try {
					if( codes.js !== undefined ){
						fsx.mkdirpSync( realpath_resource_dir );
						if( !codes.js.length ){
							fs.unlinkSync( realpath_resource_dir + '/script.js' );
						}else{
							fs.writeFileSync( realpath_resource_dir + '/script.js', codes.js );
						}
					}
				} catch (e) {
				}

				rlv();

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

	/**
	 * 編集対象のパス情報を生成する
	 */
	function generateTargetFilePath(callback){
		var rtn = {
			realpathFiles: require('path').resolve(px2ce.realpathFiles),
			contentsPath: require('path').resolve(px2ce.documentRoot+px2ce.page_path),
			strLoaderCSS: '<?php ob_start(); ?><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?>" /><?php $px->bowl()->put( ob_get_clean(), \'head\' );?>'+"\n",
			strLoaderJS: '<?php ob_start(); ?><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?>"></script><?php $px->bowl()->put( ob_get_clean(), \'foot\' );?>'+"\n"
		};

		if( px2ce.target_mode == 'theme_layout' ){
			var tmpPathThemeLayoutDir = '/layouts/'+encodeURIComponent(px2ce.layout_id)+'/';
			rtn.strLoaderCSS = '<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files(\''+tmpPathThemeLayoutDir+'style.css\') ) ?>" />'+"\n";
			rtn.strLoaderJS = '<script src="<?= htmlspecialchars( $theme->files(\''+tmpPathThemeLayoutDir+'script.js\') ) ?>"></script>'+"\n";
		}

		px2ce.px2proj.get_page_info(px2ce.page_path, function(pageInfo){
			if( pageInfo == null ){
				if( !utils79.is_file(rtn.contentsPath) ){
					console.error('Page not Exists.');
					callback(false);
					return;
				}
			}
			px2ce.px2proj.get_path_content(px2ce.page_path, function(contPath){
				// console.log(contPath);
				if( !utils79.is_file(rtn.contentsPath) ){
					rtn.contentsPath = require('path').resolve(px2ce.documentRoot+px2ce.contRoot+contPath);
				}
				callback(rtn);
			});
		});

		return;
	}

	return;
}
