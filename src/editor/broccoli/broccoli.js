/**
 * broccoli/broccoli.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var toolbar = new (require('../../toolbar.js'))(px2ce);

	var broccoli;
	var $elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView;

	var show_instanceTreeView = true;

	/**
	 * 初期化
	 */
	this.init = function(callback){
		callback = callback || function(){};

		toolbar.init({
			"btns":[
				{
					"label": "toggle instanceTreeView",
					"click": function(){
						show_instanceTreeView = (show_instanceTreeView ? false : true);
						_this.redraw(function(){
							// alert('完了');
						});
					}
				}
			],
			"onFinish": function(){
				// 完了イベント
				alert('保存しました。');
			}
		},function(){
			$canvas.append((function(){
				var fin = '';
				fin += '<div class="pickles2-contents-editor--broccoli">';
				fin += 	'<div class="pickles2-contents-editor--broccoli-canvas" data-broccoli-preview=""></div>';
				fin += 	'<div class="pickles2-contents-editor--broccoli-palette"></div>';
				fin += 	'<div class="pickles2-contents-editor--broccoli-instance-tree-view"></div>';
				fin += 	'<div class="pickles2-contents-editor--broccoli-instance-path-view"></div>';
				fin += '</div>';
				return fin;
			})());

			$elmCanvas = $canvas.find('.pickles2-contents-editor--broccoli-canvas');
			$elmModulePalette = $canvas.find('.pickles2-contents-editor--broccoli-palette');
			$elmInstanceTreeView = $canvas.find('.pickles2-contents-editor--broccoli-instance-tree-view');
			$elmInstancePathView = $canvas.find('.pickles2-contents-editor--broccoli-instance-path-view');

			_this.redraw(function(){
				px2ce.gpiBridge(
					{
						'api': 'getProjectConf'
					},
					function(px2conf){
						// console.log(px2conf);

						$elmCanvas.attr({
							"data-broccoli-preview": px2ce.preview.origin + page_path
						});

						broccoli = new Broccoli();
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
									'table': window.BroccoliFieldTable
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

								px2ce.redraw = function(callback){
									callback = callback || function(){};
									_this.redraw(function(){
										// broccoli.redraw();
									});
									return;
								}
								_this.redraw(function(){
									// broccoli.redraw();
								});

								callback();
							}
						);
					}
				);

			});

		});

	};

	/**
	 * window.resize イベントハンドラ
	 */
	_this.redraw = function( callback ){
		callback = callback || function(){};

		var $toolbar = toolbar.getElm();
		var tbHeight = $toolbar.outerHeight();

		$canvas.css({
			'position': 'relative'
		});
		$elmInstancePathView.css({
			'position': 'absolute',
			'bottom': 0,
			'left': 0,
			'right': 0,
			'width': '100%'
		});
		var pathViewHeight = $elmInstancePathView.outerHeight();
		if(!show_instanceTreeView){
			$elmCanvas.css({
				'position': 'absolute',
				'top': tbHeight,
				'left': 0,
				'width': '80%',
				'height': $canvas.height() - pathViewHeight - tbHeight
			});
			$elmInstanceTreeView.hide();
		}else{
			$elmInstanceTreeView.show();
			$elmInstanceTreeView.css({
				'position': 'absolute',
				'top': tbHeight,
				'left': 0,
				'width': '20%',
				'height': $canvas.height() - pathViewHeight - tbHeight
			});
			$elmCanvas.css({
				'position': 'absolute',
				'top': tbHeight,
				'left': '20%',
				'width': '60%',
				'height': $canvas.height() - pathViewHeight - tbHeight
			});
		}
		$elmModulePalette.css({
			'position': 'absolute',
			'top': tbHeight,
			'right': 0,
			'width': '20%',
			'height': $canvas.height() - pathViewHeight - tbHeight
		});

		if(broccoli){
			broccoli.redraw(function(){
				callback();
			});
		}else{
			callback();
		}
		return;
	}

}
