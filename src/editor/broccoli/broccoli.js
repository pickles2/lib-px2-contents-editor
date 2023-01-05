/**
 * broccoli/broccoli.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var px2style = px2ce.px2style;
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;
	var Promise = require('es6-promise').Promise;
	var px2conf = {}
		moduleCssJs = {css: '', js: ''},
		localCssJs = {css: '', js: ''},
		pagesByLayout = [];
	var editorLib = null;
	if(window.ace){
		editorLib = 'ace';
	}
	var canvasWidth = 'auto';
	var dateformat = require('dateformat');

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var broccoli;
	var $elmMiddleBlock,
		$elmCanvasFrame,
		$elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstanceTreeViewOpener,
		$elmInstancePathView;

	function getCanvasPageUrl(){
		var rtn = getPreviewUrl();
		if( px2ce.target_mode == 'theme_layout' ){
			rtn = px2ce.__dirname + '/editor/broccoli/canvas.html'
		}
		var hash = '';
		var query = '';
		if(rtn.match(/^([\s\S]*?)\#([\s\S]*)$/g)){
			rtn = RegExp.$1;
			hash = RegExp.$2;
		}
		if(rtn.match(/^([\s\S]*?)\?([\s\S]*)$/g)){
			rtn = RegExp.$1;
			query = RegExp.$2;
		}
		rtn += (query.length ? '?'+query+'&' : '?') + 'PICKLES2_CONTENTS_EDITOR=broccoli';
		rtn += (hash.length ? '#'+hash : '');
		return rtn;
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

		var pathname = px2conf.path_controot + px2ce.page_path;
		pathname = pathname.replace( new RegExp('\/+', 'g'), '/' );
		var rtn = px2ce.options.preview.origin + pathname;
		return rtn;
	}

	function toggleInstanceTreeView(){
		$canvas.toggleClass('pickles2-contents-editor__broccoli-instance-tree-view-opened');

		_this.redraw(function(){
			// alert('完了');
		});
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
				var btns = [
					// --------------------------------------
					// プレビューボタン
					{
						"label": px2ce.lb.get('ui_label.open_in_browser'),
						"click": function(){
							px2ce.openUrlInBrowser( getPreviewUrl() );
						}
					},
				];

				// --------------------------------------
				// CSS, JS のカスタマイズ機能
				if( px2ce.target_mode == 'theme_layout' ){
					// ↓ CSSとJavaScriptをBroccoli編集画面から編集できる機能
					// 　テーマ編集にのみ適用する。
					// 　当初、コンテンツ編集に導入する想定で試作してみたが、
					// 　濫用された場合にコンテンツデザインの一貫性を損ねるリスクがあるため却下とし、
					// 　テーマ編集のみの適用範囲で再実装した。
					btns.push({
						"label": 'CSS',
						"click": function(){
							openCssJsEditor('css');
						}
					});
					btns.push({
						"label": 'JavaScript',
						"click": function(){
							openCssJsEditor('js');
						}
					});
				}

				// --------------------------------------
				// レスポンシブプレビュー機能
				var $viewPortSwitcher = $('<div class="px2-input-group">').html(`
					<button class="px2-btn" data-px2ce-broccoli-preview-viewport="pc"><i class="bi bi-pc-display-horizontal"></i></button>
					<button class="px2-btn" data-px2ce-broccoli-preview-viewport="tb"><i class="bi bi-tablet"></i></button>
					<button class="px2-btn" data-px2ce-broccoli-preview-viewport="sp"><i class="bi bi-phone"></i></button>
				`);
				$viewPortSwitcher.find('button').on('click', function(){
					var $this = $(this);
					var viewPortType = $this.attr('data-px2ce-broccoli-preview-viewport');
					if( $this.hasClass('px2-btn--toggle-on') ){
						$viewPortSwitcher.find('button').removeClass('px2-btn--toggle-on');
						$elmCanvas.css({"width": 'auto'});
					}else{
						$viewPortSwitcher.find('button').removeClass('px2-btn--toggle-on');
						$this.addClass('px2-btn--toggle-on');
						switch( viewPortType ){
							case 'pc': $elmCanvas.css({"width": 1400}); break;
							case 'tb': $elmCanvas.css({"width": 900}); break;
							case 'sp': $elmCanvas.css({"width": 460}); break;
						}
					}
					_this.redraw();
				});
				btns.push({
					"type": 'element',
					"elm": $viewPortSwitcher,
				});

				// --------------------------------------
				// 挿入
				btns.push({
					"label": px2ce.lb.get('ui_label.insert'),
					"click": function(){
						px2style.loading();
						try{
							broccoli.selectedInstanceToJsonString(function(jsonStr){
								if(!jsonStr){
									alert(px2ce.lb.get('ui_message.select_instance'));
									px2style.closeLoading();
									return;
								}
								broccoli.insertInstance(broccoli.getSelectedInstance());
								px2style.closeLoading();
							});
						}catch(e){
							console.error(e);
							alert('ERROR');
							px2style.closeLoading();
						}
					}
				});

				// --------------------------------------
				// クリップJSONを出力
				btns.push({
					"label": px2ce.lb.get('ui_label.clipping'),
					"click": function(){
						px2style.loading();
						try{
							broccoli.selectedInstanceToJsonString(function(jsonStr){
								if(!jsonStr){
									alert(px2ce.lb.get('ui_message.select_instance'));
									px2style.closeLoading();
									return;
								}
								var a = document.createElement('a');
								var blob = new Blob(
									[jsonStr],
									{
										"type": "application/json"
									}
								);
								a.href = window.URL.createObjectURL(blob);
								a.download = 'clip-'+dateformat(new Date(), 'yyyy-mm-dd-HH-MM-ss')+'.json';
								a.click();
								px2style.closeLoading();
							});
						}catch(e){
							console.error(e);
							alert('ERROR');
							px2style.closeLoading();
						}
					}
				});

				$canvas.html('');
				toolbar.init({
					"btns":btns,
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
					fin += '<div class="pickles2-contents-editor__broccoli">';
					fin += 	'<div class="pickles2-contents-editor__broccoli-middle-block">';
					fin += 		'<div class="pickles2-contents-editor__broccoli-canvas-frame">';
					fin += 			'<div class="pickles2-contents-editor__broccoli-canvas" data-broccoli-preview="">';
					fin += 			'</div>';
					fin += 		'</div>';
					fin += 		'<div class="pickles2-contents-editor__broccoli-palette"></div>';
					fin += 		'<div class="pickles2-contents-editor__broccoli-instance-tree-view">';
					fin += 			'<div class="pickles2-contents-editor__broccoli-instance-tree-view-inner"></div>';
					fin += 			'<button type="button" class="pickles2-contents-editor__broccoli-instance-tree-view-opener"></button>';
					fin += 		'</div>';
					fin += 	'</div>';
					fin += 	'<div class="pickles2-contents-editor__broccoli-instance-path-view"></div>';
					fin += '</div>';
					return fin;
				})());


				$elmMiddleBlock = $canvas.find('.pickles2-contents-editor__broccoli-middle-block');
				$elmCanvasFrame = $canvas.find('.pickles2-contents-editor__broccoli-canvas-frame');
				$elmCanvas = $canvas.find('.pickles2-contents-editor__broccoli-canvas');
				$elmModulePalette = $canvas.find('.pickles2-contents-editor__broccoli-palette');
				$elmInstanceTreeView = $canvas.find('.pickles2-contents-editor__broccoli-instance-tree-view-inner');
				$elmInstanceTreeViewOpener = $canvas.find('.pickles2-contents-editor__broccoli-instance-tree-view-opener');
				$elmInstancePathView = $canvas.find('.pickles2-contents-editor__broccoli-instance-path-view');

				$elmInstanceTreeViewOpener.on('click', function(){
					toggleInstanceTreeView();
				});

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
				// ローカルのCSS, JS ソースを取得する
				if( px2ce.target_mode != 'theme_layout' ){
					// テーマ編集時のみ必要。
					rlv();
					return;
				}

				px2ce.gpiBridge(
					{
						'api': 'getLocalCssJsSrc',
						'theme_id': px2ce.theme_id,
						'layout_id': px2ce.layout_id
					},
					function(CssJs){
						localCssJs = CssJs;
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
				// Attach CSS and JS.
				if( px2ce.target_mode != 'theme_layout' ){
					// テーマ編集時のみ必要。
					rlv();
					return;
				}
				var win = $elmCanvas.find('iframe').get(0).contentWindow;
				win.postMessage({
					"px2ceCommand": "loadCustomResources",
					"css": moduleCssJs.css + "/* */\n" + localCssJs.css,
					"js": moduleCssJs.js + "/* */\n" + localCssJs.js,
				});
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				$elmCanvasFrame.on('click', function(){
					broccoli.unselectInstance();
				})

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
	 * CSS, JS のエディタを開く
	 */
	function openCssJsEditor(cssOrJs){
		var $dialogBody = $('<div>');
		var $submitButton = $('<button type="submit" class="px2-btn px2-btn--primary">OK</button>');
		var loadedCodes = [];
		var $elmTextareas;

		$submitButton.attr({'disabled': 'disabled'});

		px2style.modal(
			{
				title: (cssOrJs == 'css' ? 'CSS (SCSS)' : 'JavaScript'),
				body: $dialogBody,
				buttons: [
					$submitButton
				],
				form: {
					action: 'javascript:;',
					method: 'get',
					submit: function(){
						if( editorLib == 'ace' ){
							loadedCodes[cssOrJs] = $elmTextareas.getValue();
						}else{
							loadedCodes[cssOrJs] = $elmTextareas.val();
						}

						saveContentsSrc(loadedCodes, function(){
							var $broccoliCanvas = $canvas.find('.pickles2-contents-editor__broccoli-canvas');

							new Promise(function(rlv){rlv();})
								.then(function(){ return new Promise(function(rlv, rjt){
									if( px2ce.target_mode != 'theme_layout' ){
										rlv();
										return;
									}
									px2ce.gpiBridge(
										{
											'api': 'getLocalCssJsSrc',
											'theme_id': px2ce.theme_id,
											'layout_id': px2ce.layout_id
										},
										function(CssJs){
											localCssJs = CssJs;
											rlv();
										}
									);
								}); })
								.then(function(){ return new Promise(function(rlv, rjt){
									window.location.reload();
									rlv();
								}); })
								.then(function(){ return new Promise(function(rlv, rjt){
									px2style.closeModal();
									rlv();
								}); })
							;
						});
					}
				},
				width: 700
			},
			function(){
			}
		);

		px2ce.gpiBridge(
			{
				'api': 'getContentsSrc',
				'page_path': page_path
			},
			function(codes){
				loadedCodes = codes;

				if( editorLib == 'ace' ){
					$dialogBody.css({'height': 300});
					var aceCss = {
						'position': 'relative',
						'width': '100%',
						'height': '100%'
					};
					$dialogBody.append('<div>');
					$elmTextareas = ace.edit(
						$dialogBody.find('div').text(codes[cssOrJs]).css(aceCss).get(0)
					);

					$elmTextareas.setFontSize(16);
					$elmTextareas.getSession().setUseWrapMode(true);// Ace 自然改行
					$elmTextareas.setShowInvisibles(true);// Ace 不可視文字の可視化
					$elmTextareas.$blockScrolling = Infinity;
					$elmTextareas.setTheme("ace/theme/github");
					$elmTextareas.getSession().setMode("ace/mode/html");

					if( cssOrJs == 'css' ){
						$elmTextareas.setTheme("ace/theme/tomorrow");
						$elmTextareas.getSession().setMode("ace/mode/scss");
					}else{
						$elmTextareas.setTheme("ace/theme/xcode");
						$elmTextareas.getSession().setMode("ace/mode/javascript");
					}

				}else{
					$dialogBody.append('<textarea>');
					$elmTextareas = $dialogBody.find('textarea');
					$elmTextareas .val(codes[cssOrJs]);
				}

				$submitButton.removeAttr('disabled');
			}
		);
	}

	/**
	 * 編集したコンテンツを保存する
	 */
	function saveContentsSrc(codes, callback){
		px2ce.gpiBridge(
			{
				'api': 'saveContentsSrc',
				'page_path': page_path,
				'codes': codes
			},
			function(result){
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
			if( $(e.target).closest('[contenteditable]').length ){
				return true;
			}
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.remove(function(){
			});
			return true;
		});
		_Keypress.simple_combo("delete", function(e) {
			if( $(e.target).closest('[contenteditable]').length ){
				return true;
			}
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.remove(function(){
			});
			return true;
		});
		_Keypress.simple_combo("escape", function(e) {
			if( $(e.target).closest('[contenteditable]').length ){
				return true;
			}
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.unselectInstance();
			return true;
		});
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" z", function(e) {
			if( $(e.target).closest('[contenteditable]').length ){
				return true;
			}
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.historyBack(function(){
			});
			return true;
		});
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" y", function(e) {
			if( $(e.target).closest('[contenteditable]').length ){
				return true;
			}
			switch(e.target.tagName.toLowerCase()){
				case 'input': case 'textarea':
				return true; break;
			}
			e.preventDefault();
			broccoli.historyGo(function(){
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
