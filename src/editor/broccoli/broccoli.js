/**
 * broccoli/broccoli.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var it79 = require('iterate79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;
	var Promise = require('es6-promise').Promise;
	var px2conf = {};

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var broccoli;
	var $elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView;

	var show_instanceTreeView = true;

	function getPreviewUrl(){
		var pathname = px2conf.path_controot + page_path;
		pathname = pathname.replace( new RegExp('\/+', 'g'), '/' );
		return px2ce.options.preview.origin + pathname;
	}

	/**
	 * 初期化
	 */
	this.init = function(editorOption, callback){
		callback = callback || function(){};

		var customFields = {};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2ce.gpiBridge(
					{
						'api': 'getProjectConf'
					},
					function(_px2conf){
						px2conf = _px2conf;

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
								},
								{
									"label": "ブラウザでプレビュー",
									"click": function(){
										px2ce.openUrlInBrowser( getPreviewUrl() );
									}
								}
							],
							"onFinish": function(){
								// 完了イベント
								px2ce.finish();
							}
						},function(){
							rlv();
						});

					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
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
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				$elmCanvas.attr({
					"data-broccoli-preview": getPreviewUrl()
				});
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// プロジェクトが拡張するフィールド
				// クライアントサイドのライブラリをロードしておく
				px2ce.gpiBridge(
					{
						'api': 'loadCustomFieldsClientSideLibs'
					},
					function(scripts){
						for(var i in scripts){
							$('body').append(scripts[i]);
						}
						rlv();
					}
				);

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// フィールドを拡張

				// px2ce が拡張するフィールド
				customFields.table = window.BroccoliFieldTable;

				// 呼び出し元アプリが拡張するフィールド
				for( var idx in px2ce.options.customFields ){
					customFields[idx] = px2ce.options.customFields[idx];
				}

				// プロジェクトが拡張するフィールド
				var confCustomFields = {};
				try {
					confCustomFields = px2conf.plugins.px2dt.guieditor.custom_fields;
					for( var fieldName in confCustomFields ){
						try {
							if( confCustomFields[fieldName].frontend.file && confCustomFields[fieldName].frontend.function ){
								// console.log(eval( confCustomFields[fieldName].frontend.function ));
								customFields[fieldName] = eval( confCustomFields[fieldName].frontend.function );
							}else{
								console.error( 'FAILED to load custom field: ' + fieldName + ' (frontend);' );
								console.error( 'unknown type' );
							}
						} catch (e) {
							console.error( 'FAILED to load custom field: ' + fieldName + ' (frontend);' );
							console.error(e);
						}
					}
				} catch (e) {
				}

				// console.log(customFields);

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

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
						'customFields': customFields,
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
							px2ce.onClickContentsLink( uri, data );
						},
						'onMessage': function( message ){
							// ユーザーへ知らせるメッセージを表示する
							px2ce.message(message);
						}
					} ,
					function(){
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// 初期化が完了すると呼びだされるコールバック関数です。
				setKeyboardEvent(function(){
					_this.redraw(function(){
						// broccoli.redraw();
					});

					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				callback();
			}); })
		;

	};

	/**
	 * キーボードイベントハンドラ
	 */
	function setKeyboardEvent(callback){
		callback = callback || function(){};
		if( !window.keypress ){ callback(true); return; }
		if( !broccoli ){ callback(true); return; }

		// キーボードイベントセット
		_Keypress = new window.keypress.Listener();
		_this.Keypress = _Keypress;
		_Keypress.simple_combo("backspace", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.remove(function(){
				console.log('remove instance done.');
			});
			return true;
		});
		_Keypress.simple_combo("delete", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.remove(function(){
				console.log('remove instance done.');
			});
			return true;
		});
		_Keypress.simple_combo("escape", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.unselectInstance();
			return true;
		});
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" c", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			// e.preventDefault();
			broccoli.copy(function(result){
				if(result){
					console.log('copy instance done.');
				}
			});
			return true;
		});
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" v", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.paste(function(){
				console.log('paste instance done.');
			});
			return true;
		});
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" z", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.historyBack(function(){
				console.log('historyBack done.');
			});
			return true;
		});
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" y", function(e) {
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.historyGo(function(){
				console.log('historyGo done.');
			});
			return true;
		});
		// _Keypress.simple_combo(px2ce.getCmdKeyName()+" x", function(e) {
		// 	px.message('cmd x');
		// 	e.preventDefault();
		// });
		callback(true);
		return;
	}

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
