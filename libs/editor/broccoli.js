/**
 * broccoli
 */
module.exports = function(px2ce, data, callback){
	callback = callback || function(){};

	var px2proj = px2ce.px2proj,
		page_path = px2ce.page_path,
		px2conf,
		pageInfo,
		documentRoot,
		realpathDataDir,
		pathResourceDir;


	px2proj.get_config(function(_px2conf){
		px2conf = _px2conf;
		// console.log(px2conf);
		px2proj.get_page_info(page_path, function(_pageInfo){
			pageInfo = _pageInfo;
			// console.log(pageInfo);

			px2proj.get_path_docroot(function(_documentRoot){
				documentRoot = _documentRoot;

				px2proj.realpath_files(page_path, '', function(_realpathDataDir){
					realpathDataDir = require('path').resolve(_realpathDataDir, 'guieditor.ignore')+'/';

					px2proj.path_files(page_path, '', function(_pathResourceDir){
						pathResourceDir = require('path').resolve(_pathResourceDir, 'resources')+'/';
						pathResourceDir = pathResourceDir.replace(new RegExp('\\\\','g'), '/').replace(new RegExp('^[a-zA-Z]\\:\\/'), '/');
							// Windows でボリュームラベル "C:" などが含まれるようなパスを渡すと、
							// broccoli-html-editor内 resourceMgr で
							// 「Uncaught RangeError: Maximum call stack size exceeded」が起きて落ちる。
							// ここで渡すのはウェブ側からみえる外部のパスでありサーバー内部パスではないので、
							// ボリュームラベルが付加された値を渡すのは間違い。

						broccoliStandby(data.forBroccoli.api, data.forBroccoli.options, function(bin){
							callback(bin);
						});

					});

				});


			});

		});
	});

	function broccoliStandby(api, options, callback){

		var Broccoli = require('broccoli-html-editor');
		var broccoli = new Broccoli();
		for( var idx in px2conf.plugins.px2dt.paths_module_template ){
			px2conf.plugins.px2dt.paths_module_template[idx] = require('path').resolve( px2ce.entryScript, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
		}
		// console.log(px2conf.plugins.px2dt.paths_module_template);
		// console.log({
		// 	'paths_module_template': px2conf.plugins.px2dt.paths_module_template ,
		// 	'documentRoot': documentRoot,// realpath
		// 	'pathHtml': pageInfo.content,
		// 	'pathResourceDir': pathResourceDir,
		// 	'realpathDataDir':  realpathDataDir,
		// 	'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
		// });

		broccoli.init(
			{
				'appMode': px2ce.getAppMode() ,
				'paths_module_template': px2conf.plugins.px2dt.paths_module_template ,
				'documentRoot': documentRoot,// realpath
				'pathHtml': pageInfo.content,
				'pathResourceDir': pathResourceDir,
				'realpathDataDir':  realpathDataDir,
				'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
				'customFields': {
					// 'custom1': function(broccoli){
					// 	// カスタムフィールドを実装します。
					// 	// この関数は、fieldBase.js を基底クラスとして継承します。
					// 	// customFields オブジェクトのキー(ここでは custom1)が、フィールドの名称になります。
					// }
					'table': require('broccoli-field-table')
				} ,
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
