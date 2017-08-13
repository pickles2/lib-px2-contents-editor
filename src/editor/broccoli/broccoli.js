/**
 * broccoli/broccoli.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;
	var Promise = require('es6-promise').Promise;
	var px2conf = {}
		moduleCssJs = {css: '', js: ''};

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var broccoli;
	var $elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView;

	var show_instanceTreeView = true;

	function getPreviewUrl(){
		if( px2ce.target_mode == 'theme_layout' ){
			var path_html = px2ce.__dirname + '/editor/broccoli/canvas.html'
			path_html += '?css='+utils79.base64_encode(moduleCssJs.css);
			path_html += '&js='+utils79.base64_encode(moduleCssJs.js);
			return path_html;
		}
		var pathname = px2conf.path_controot + page_path;
		pathname = pathname.replace( new RegExp('\/+', 'g'), '/' );
		return px2ce.options.preview.origin + pathname;
	}

	/**
	 * 初期化
	 */
	this.init = function(editorOption, callback){
		callback = callback || function(){};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2ce.gpiBridge(
					{
						'api': 'getProjectConf'
					},
					function(_px2conf){
						px2conf = _px2conf;
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				toolbar.init({
					"btns":[
						{
							"label": px2ce.lb.get('ui_label.toggle_instance_treeview'),
							"click": function(){
								show_instanceTreeView = (show_instanceTreeView ? false : true);
								_this.redraw(function(){
									// alert('完了');
								});
							}
						},
						{
							"label": px2ce.lb.get('ui_label.open_in_browser'),
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
				// モジュールのCSS, JS ソースを取得する
				if( px2ce.target_mode != 'theme_layout' ){
					// テーマ編集時のみ必要。
					rlv();
					return;
				}

				px2ce.gpiBridge(
					{
						'api': 'getModuleCssJsSrc'
					},
					function(CssJs){
						moduleCssJs = CssJs;
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				$elmCanvas.attr({
					"data-broccoli-preview": getPreviewUrl()
				});
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// broccoli-html-editor オブジェクトを生成
				broccoli = new Broccoli();
				px2ce.createBroccoliInitOptions(function( broccoliInitOptions ){
					broccoliInitOptions.elmCanvas = $elmCanvas.get(0);
					broccoliInitOptions.elmModulePalette = $elmModulePalette.get(0);
					broccoliInitOptions.elmInstanceTreeView = $elmInstanceTreeView.get(0);
					broccoliInitOptions.elmInstancePathView = $elmInstancePathView.get(0);
					broccoli.init(
						broccoliInitOptions ,
						function(){
							rlv();
						}
					);
				});
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
