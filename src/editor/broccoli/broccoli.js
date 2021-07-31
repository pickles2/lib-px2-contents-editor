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
	var $elmCanvasFrame,
		$elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView;

	var show_instanceTreeView = false;

	function getCanvasPageUrl(){
		var rtn = getPreviewUrl();
		if( px2ce.target_mode == 'theme_layout' ){
			rtn = px2ce.__dirname + '/editor/broccoli/canvas.html'
			rtn += '?css='+utils79.base64_encode(moduleCssJs.css + "/* */\n" + localCssJs.css);
			rtn += '&js='+utils79.base64_encode(moduleCssJs.js + "/* */\n" + localCssJs.js);
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
		// console.log(rtn);
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
		// console.log(rtn);
		return rtn;
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
				];

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

				btns.push({
					"type": 'element',
					"elm": $('<select>')
						.addClass('px2-input')
						.append( $('<option value="auto">ビューポート: ウィンドウサイズにフィット</option>') )
						.append( $('<option value="1400">ビューポート: PCサイズ (1400px)</option>') )
						.append( $('<option value="900">ビューポート: タブレットサイズ (900px)</option>') )
						.append( $('<option value="460">ビューポート: スマートフォンサイズ (460px)</option>') )
						.on('change', function(e){
							var val = $(this).find('option:selected').val();
							canvasWidth = val;
							$elmCanvas.css({"width": (canvasWidth=='auto' ? '100%' : canvasWidth)});
							_this.redraw();
						})
				});

				btns.push({
					"label": 'クリップJSONを出力',
					"click": function(){
						px2style.loading();
						try{
							broccoli.selectedInstanceToJsonString(function(jsonStr){
								if(!jsonStr){
									alert('インスタンスを選択してください。');
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
					fin += '<div class="pickles2-contents-editor--broccoli">';
					fin += 	'<div class="pickles2-contents-editor--broccoli-canvas-frame">';
					fin += 		'<div class="pickles2-contents-editor--broccoli-canvas" data-broccoli-preview="">';
					fin += 		'</div>';
					fin += 	'</div>';
					fin += 	'<div class="pickles2-contents-editor--broccoli-palette"></div>';
					fin += 	'<div class="pickles2-contents-editor--broccoli-instance-tree-view"></div>';
					fin += 	'<div class="pickles2-contents-editor--broccoli-instance-path-view"></div>';
					fin += '</div>';
					return fin;
				})());


				$elmCanvasFrame = $canvas.find('.pickles2-contents-editor--broccoli-canvas-frame');
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
							var $broccoliCanvas = $canvas.find('.pickles2-contents-editor--broccoli-canvas');

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
									$elmCanvas.attr({
										"data-broccoli-preview": getCanvasPageUrl()
									});
									rlv();
								}); })
								.then(function(){ return new Promise(function(rlv, rjt){
									$broccoliCanvas.find('iframe')
										.attr({
											'src': $broccoliCanvas.attr('data-broccoli-preview')
										})
									;

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
				console.log('done.');
			}
		);

		px2ce.gpiBridge(
			{
				'api': 'getContentsSrc',
				'page_path': page_path
			},
			function(codes){
				loadedCodes = codes;
				// console.log(codes);

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

		var instansTreeViewWidth = ($canvas.width() > 1020 ? '340px' : '30%');
		var modulePaletteWidth = ($canvas.width() > 680 ? '240px' : '25%');

		$elmCanvasFrame.css({
			'position': 'absolute',
			'top': tbHeight,
			'left': 0,
			'width': 'calc(100% - '+modulePaletteWidth+')',
			'height': $canvas.height() - pathViewHeight - tbHeight
		});

		$elmModulePalette.css({
			'position': 'absolute',
			'top': tbHeight,
			'right': 0,
			'width': modulePaletteWidth,
			'height': $canvas.height() - pathViewHeight - tbHeight
		});

		if( !show_instanceTreeView ){
			$elmInstanceTreeView.hide();
		}else{
			$elmInstanceTreeView.show();
			$elmInstanceTreeView.css({
				'position': 'absolute',
				'top': tbHeight,
				'left': 0,
				'width': instansTreeViewWidth,
				'height': $canvas.height() - pathViewHeight - tbHeight
			});
			$elmCanvasFrame.css({
				'left': instansTreeViewWidth,
				'width': 'calc(100% - '+modulePaletteWidth+' - '+instansTreeViewWidth+')',
			});
		}


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
