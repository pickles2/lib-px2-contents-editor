/**
 * broccoli
 */
modules.export = function(){
	var $ = require('jquery');

	$.get(
		'/apis/getProjectConf',
		{},
		function(px2conf){
			// console.log(px2conf);

			var $elmTitleBar = $('.cont_title_bar');
			var $elmButtons = $('.cont_buttons');
			var $elmCanvas = $('.cont_canvas');
			var $elmModulePalette = $('.cont_palette');
			var $elmInstanceTreeView = $('.cont_instanceTreeView');
			var $elmInstancePathView = $('.cont_instancePathView');

			$('.cont_canvas .cont_canvas--main').attr({
				"data-broccoli-preview": 'http://127.0.0.1:8081'+params.page_path
			});


			var broccoli = new Broccoli();
			broccoli.init(
				{
					'elmCanvas': $elmCanvas.find('.cont_canvas--main').get(0),
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
						$.ajax({
							"url": "/apis/broccoliApi",
							"type": 'post',
							'data': {
								'page_path': params.page_path,
								'api': JSON.stringify(api) ,
								'options': JSON.stringify(options)
							},
							"success": function(data){
								// console.log(data);
								callback(data);
							}
						})
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
	)

}
