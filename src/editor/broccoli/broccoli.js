/**
 * broccoli/broccoli.js
 */
module.exports = function(px2ce, callback){
	callback = callback || function(){};
	var $ = require('jquery');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	$canvas.html((function(){
		var fin = '';
			fin += '<div class="pickles2-contents-editor--broccoli">';
			fin += 	'<div class="pickles2-contents-editor--broccoli-canvas" data-broccoli-preview=""></div>';
			fin += 	'<div class="pickles2-contents-editor--broccoli-palette"></div>';
			fin += 	'<div class="pickles2-contents-editor--broccoli-instance-tree-view"></div>';
			fin += 	'<div class="pickles2-contents-editor--broccoli-instance-path-view"></div>';
			fin += '</div>';
		return fin;
	})());

	px2ce.gpiBridge(
		{
			'api': 'getProjectConf'
		},
		function(px2conf){
			// console.log(px2conf);

			var $elmCanvas = $canvas.find('.pickles2-contents-editor--broccoli-canvas');
			var $elmModulePalette = $canvas.find('.pickles2-contents-editor--broccoli-palette');
			var $elmInstanceTreeView = $canvas.find('.pickles2-contents-editor--broccoli-instance-tree-view');
			var $elmInstancePathView = $canvas.find('.pickles2-contents-editor--broccoli-instance-path-view');

			$elmCanvas.attr({
				"data-broccoli-preview": 'http://127.0.0.1:8081'+page_path
			});


			var broccoli = new Broccoli();
			broccoli.init(
				{
					'elmCanvas': $elmCanvas.get(0),
					'elmModulePalette': $elmModulePalette.get(0),
					'elmInstanceTreeView': $elmInstanceTreeView.get(0),
					'elmInstancePathView': $elmInstancePathView.get(0),
					'contents_area_selector': px2conf.plugins.px2dt.contents_area_selector,
					// ↑編集可能領域を探すためのクエリを設定します。
					//  この例では、data-contents属性が付いている要素が編集可能領域として認識されます。
					'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
					// ↑bowlの名称を、data-contents属性値から取得します。
					'customFields': {
						// 'href': require('./../common/broccoli/broccoli-field-href/server.js'),
						// // 'psd': require('broccoli-field-psd'),
						// 'table': require('broccoli-field-table')
					},
					'gpiBridge': function(api, options, callback){
						// GPI(General Purpose Interface) Bridge
						// broccoliは、バックグラウンドで様々なデータ通信を行います。
						// GPIは、これらのデータ通信を行うための汎用的なAPIです。
						px2ce.gpiBridge(
							{
								'api': 'broccoliBridge',
								'page_path': page_path,
								'forBroccoli':{
									'api': api,
									'options': options
								}
							},
							function(data){
								callback(data);
							}
						);
						return;
					},
					'onClickContentsLink': function( uri, data ){
						alert(uri + ' へ移動');
						console.log(data);
						return false;
					},
					'onMessage': function( message ){
						// ユーザーへ知らせるメッセージを表示する
						console.info('message: '+message);
					}
				} ,
				function(){
					// 初期化が完了すると呼びだされるコールバック関数です。

					$(window).resize(function(){
						// このメソッドは、canvasの再描画を行います。
						// ウィンドウサイズが変更された際に、UIを再描画するよう命令しています。
						broccoli.redraw();
					});

					// callback();
				}
			);
		}
	);

}
