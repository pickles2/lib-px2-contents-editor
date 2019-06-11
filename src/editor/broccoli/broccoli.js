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
		moduleCssJs = {css: '', js: ''},
		pagesByLayout = [];
	var editorLib = null;
	if(window.ace){
		editorLib = 'ace';
	}

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var broccoli;
	var $elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView,
		$elmCssEditor,
		$elmJsEditor;

	var show_instanceTreeView = false;

	function getCanvasPageUrl(){
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
	function getPreviewUrl(){
		if( px2ce.target_mode == 'theme_layout' ){
			var page_path = '/index.html';
			if( pagesByLayout.length ){
				page_path = pagesByLayout[0].path;
			}
			var pathname = px2conf.path_controot + page_path;
			pathname = pathname.replace( new RegExp('\/+', 'g'), '/' );
			pathname += '?THEME='+encodeURIComponent(px2ce.theme_id);
			pathname += '&LAYOUT='+encodeURIComponent(px2ce.layout_id);
			return px2ce.options.preview.origin + pathname;
		}

		return getCanvasPageUrl();
	}

	/**
	 * 初期化
	 */
	this.init = function(editorOption, callback){
		callback = callback || function(){};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2conf = px2ce.getBootupInfomations().projectConf;
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				pagesByLayout = [];
				if( px2ce.target_mode != 'theme_layout' ){
					rlv();
					return;
				}
				pagesByLayout = px2ce.getBootupInfomations().pagesByLayout;
				rlv();
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
						},
						{
							"label": 'CSS',
							"click": function(){
								$elmCssEditor.show();
							}
						},
						{
							"label": 'JavaScript',
							"click": function(){
								$elmJsEditor.show();
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
					fin += 	'<div class="pickles2-contents-editor--broccoli-editor-body-css"></div>';
					fin += 	'<div class="pickles2-contents-editor--broccoli-editor-body-js"></div>';
					fin += '</div>';
					return fin;
				})());


				$elmCanvas = $canvas.find('.pickles2-contents-editor--broccoli-canvas');
				$elmModulePalette = $canvas.find('.pickles2-contents-editor--broccoli-palette');
				$elmInstanceTreeView = $canvas.find('.pickles2-contents-editor--broccoli-instance-tree-view');
				$elmInstancePathView = $canvas.find('.pickles2-contents-editor--broccoli-instance-path-view');
				$elmCssEditor = $canvas.find('.pickles2-contents-editor--broccoli-editor-body-css');
				$elmJsEditor = $canvas.find('.pickles2-contents-editor--broccoli-editor-body-js');

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
						'api': 'getModuleCssJsSrc',
						'theme_id': px2ce.theme_id
					},
					function(CssJs){
						moduleCssJs = CssJs;
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				px2ce.gpiBridge(
					{
						'api': 'getContentsSrc',
						'page_path': page_path
					},
					function(codes){
						// console.log(codes);
						$elmCssEditor.hide();
						$elmJsEditor.hide();

						if( editorLib == 'ace' ){
							$elmCssEditor.append('<div>').css({'height': 300});
							$elmJsEditor.append('<div>').css({'height': 300});

							var aceCss = {
								'position': 'relative',
								'width': '100%',
								'height': '100%'
							};
							$elmTextareas = {};
							$elmTextareas['css'] = ace.edit(
								$elmCssEditor.find('div').text(codes['css']).css(aceCss).get(0)
							);
							$elmTextareas['js'] = ace.edit(
								$elmJsEditor.find('div').text(codes['js']).css(aceCss).get(0)
							);
							for(var i in $elmTextareas){
								$elmTextareas[i].setFontSize(16);
								$elmTextareas[i].getSession().setUseWrapMode(true);// Ace 自然改行
								$elmTextareas[i].setShowInvisibles(true);// Ace 不可視文字の可視化
								$elmTextareas[i].$blockScrolling = Infinity;
								$elmTextareas[i].setTheme("ace/theme/github");
								$elmTextareas[i].getSession().setMode("ace/mode/html");
							}
							$elmTextareas['css'].setTheme("ace/theme/tomorrow");
							$elmTextareas['css'].getSession().setMode("ace/mode/scss");
							$elmTextareas['js'].setTheme("ace/theme/xcode");
							$elmTextareas['js'].getSession().setMode("ace/mode/javascript");

						}else{
							$elmTextareas = {};

							$elmCssEditor.append('<textarea>');
							$elmTextareas['css'] = $elmCssEditor.find('textarea');
							$elmTextareas['css'] .val(codes['css']);

							$elmJsEditor.append('<textarea>');
							$elmTextareas['js'] = $elmJsEditor.find('textarea');
							$elmTextareas['js']  .val(codes['js']);

						}

						$elmCssEditor.append($('<div>').append( $('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(){
								saveContentsSrc(function(){
									$elmCssEditor.hide();
								});
							})
						));
						$elmJsEditor.append($('<div>').append( $('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(){
								saveContentsSrc(function(){
									$elmJsEditor.hide();
								});
							})
						));

						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				$elmCanvas.attr({
					"data-broccoli-preview": getCanvasPageUrl()
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
				setKeyboardEvent(function(){
					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.redraw(function(){
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				callback();
			}); })
		;

	};


	/**
	 * 編集したコンテンツを保存する
	 */
	function saveContentsSrc(callback){
		var codes;
		if( editorLib == 'ace' ){
			codes = {
				'css':  $elmTextareas['css'].getValue(),
				'js':   $elmTextareas['js'].getValue()
			};
		}else{
			codes = {
				'css':  $elmTextareas['css'].val(),
				'js':   $elmTextareas['js'].val()
			};
		}
		px2ce.gpiBridge(
			{
				'api': 'saveContentsSrc',
				'page_path': page_path,
				'codes': codes
			},
			function(result){
				// console.log(result);
				callback(result);
			}
		);
	}

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
	 * broccoli client オブジェクトを取得する
	 */
	_this.getBroccoliClient = function(){
		return broccoli;
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
