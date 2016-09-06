/**
 * broccoli
 */
module.exports = function(px2ce, data, callback){
	callback = callback || function(){};

	var utils79 = require('utils79');
	var Promise = require('es6-promise').Promise;
	var px2proj = px2ce.px2proj,
		page_path = px2ce.page_path,
		px2conf = px2ce.px2conf,
		pageInfo = px2ce.pageInfo,
		contRoot = px2ce.contRoot,
		documentRoot = px2ce.documentRoot,
		realpathDataDir = px2ce.realpathDataDir,
		pathResourceDir = px2ce.pathResourceDir
	;

	parseConfig(function(){
		broccoliStandby(data.forBroccoli.api, data.forBroccoli.options, function(bin){
			callback(bin);
		});
	});

	function parseConfig(callback){
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
			if( px2conf.plugins.px2dt.guieditor.pathResourceDir ){
				pathResourceDir = bind( px2conf.plugins.px2dt.guieditor.pathResourceDir );
				pathResourceDir = require('path').resolve('/' + px2conf.path_controot + '/' + pathResourceDir)+'/';
				// console.log(pathResourceDir);
			}
		} catch (e) {
		}

		try {
			if( px2conf.plugins.px2dt.guieditor.realpathDataDir ){
				realpathDataDir = bind( px2conf.plugins.px2dt.guieditor.realpathDataDir );
				realpathDataDir = require('path').resolve('/', documentRoot+'/'+px2conf.path_controot + '/' + realpathDataDir)+'/';
				// console.log(realpathDataDir);
			}
		} catch (e) {
		}

		// console.log(pathResourceDir);
		// console.log(realpathDataDir);
		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			callback();
		}); });
		return;
	}

	function broccoliStandby(api, options, callback){
		var Broccoli = require('broccoli-html-editor');
		var broccoli = new Broccoli();
		for( var idx in px2conf.plugins.px2dt.paths_module_template ){
			px2conf.plugins.px2dt.paths_module_template[idx] = require('path').resolve( px2ce.entryScript, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
		}
		var customFields = {};
		customFields.table = require('broccoli-field-table');
		for( var idx in px2ce.options.customFields ){
			customFields[idx] = px2ce.options.customFields[idx];
		}
		// console.log(customFields);

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

				// console.log('GPI called');
				// console.log(api);
				// console.log(options);
				broccoli.gpi(
					api,
					options,
					function(rtn){
						// console.log(rtn);
						// console.log('GPI responced');
						callback(rtn);
					}
				);

			}
		);
		return;
	}

	return;
}
