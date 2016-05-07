/**
 * broccoli
 */
module.exports = function(px2ce, data, callback){
	callback = callback || function(){};

	var px2proj = px2ce.px2proj,
		page_path = px2ce.page_path,
		px2conf = px2ce.px2conf,
		pageInfo = px2ce.pageInfo,
		documentRoot = px2ce.documentRoot,
		realpathDataDir = px2ce.realpathDataDir,
		pathResourceDir = px2ce.pathResourceDir
	;

	broccoliStandby(data.forBroccoli.api, data.forBroccoli.options, function(bin){
		callback(bin);
	});

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
				'pathHtml': pageInfo.content,
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
