/**
 * default/default.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var dateformat = require('dateformat');
	var it79 = require('iterate79');
	var $canvas = $(px2ce.getElmCanvas());
	var module_id = px2ce.module_id;
	var current_tab = 'html';
	var _imgDummy = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTYyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjOTk5OTk5IiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMjExMF80NDYzKSI+CjxwYXRoIGQ9Ik03NzIuMjg4IDQ5Mi44MTJDNzcyLjI4OCA1MDAuMzIxIDc2OS4zMDUgNTA3LjUyMyA3NjMuOTk1IDUxMi44MzJDNzU4LjY4NiA1MTguMTQyIDc1MS40ODQgNTIxLjEyNSA3NDMuOTc1IDUyMS4xMjVDNzM2LjQ2NiA1MjEuMTI1IDcyOS4yNjUgNTE4LjE0MiA3MjMuOTU1IDUxMi44MzJDNzE4LjY0NiA1MDcuNTIzIDcxNS42NjMgNTAwLjMyMSA3MTUuNjYzIDQ5Mi44MTJDNzE1LjY2MyA0ODUuMzA0IDcxOC42NDYgNDc4LjEwMiA3MjMuOTU1IDQ3Mi43OTNDNzI5LjI2NSA0NjcuNDgzIDczNi40NjYgNDY0LjUgNzQzLjk3NSA0NjQuNUM3NTEuNDg0IDQ2NC41IDc1OC42ODYgNDY3LjQ4MyA3NjMuOTk1IDQ3Mi43OTNDNzY5LjMwNSA0NzguMTAyIDc3Mi4yODggNDg1LjMwNCA3NzIuMjg4IDQ5Mi44MTJaIiBmaWxsPSIjQUFBQUFBIiBmaWxsLW9wYWNpdHk9IjAuNyIvPgo8cGF0aCBkPSJNNjk2Ljc4OCA0MDcuODc1QzY4Ni43NzYgNDA3Ljg3NSA2NzcuMTc0IDQxMS44NTIgNjcwLjA5NCA0MTguOTMyQzY2My4wMTUgNDI2LjAxMSA2NTkuMDM4IDQzNS42MTMgNjU5LjAzOCA0NDUuNjI1VjYzNC4zNzVDNjU5LjAzOCA2NDQuMzg3IDY2My4wMTUgNjUzLjk4OSA2NzAuMDk0IDY2MS4wNjhDNjc3LjE3NCA2NjguMTQ4IDY4Ni43NzYgNjcyLjEyNSA2OTYuNzg4IDY3Mi4xMjVIOTIzLjI4OEM5MzMuMyA2NzIuMTI1IDk0Mi45MDIgNjY4LjE0OCA5NDkuOTgxIDY2MS4wNjhDOTU3LjA2MSA2NTMuOTg5IDk2MS4wMzggNjQ0LjM4NyA5NjEuMDM4IDYzNC4zNzVWNDQ1LjYyNUM5NjEuMDM4IDQzNS42MTMgOTU3LjA2MSA0MjYuMDExIDk0OS45ODEgNDE4LjkzMkM5NDIuOTAyIDQxMS44NTIgOTMzLjMgNDA3Ljg3NSA5MjMuMjg4IDQwNy44NzVINjk2Ljc4OFpNOTIzLjI4OCA0MjYuNzVDOTI4LjI5NCA0MjYuNzUgOTMzLjA5NSA0MjguNzM5IDkzNi42MzQgNDMyLjI3OEM5NDAuMTc0IDQzNS44MTggOTQyLjE2MyA0NDAuNjE5IDk0Mi4xNjMgNDQ1LjYyNVY1NjguMzEyTDg3MC44NzIgNTMxLjU2M0M4NjkuMTAyIDUzMC42NzYgODY3LjA5OCA1MzAuMzY5IDg2NS4xNDMgNTMwLjY4NEM4NjMuMTg5IDUzMC45OTkgODYxLjM4MyA1MzEuOTIgODU5Ljk4MSA1MzMuMzE4TDc4OS45NTUgNjAzLjM0NEw3MzkuNzQ3IDU2OS44OThDNzM3LjkzNCA1NjguNjkxIDczNS43NiA1NjguMTQ4IDczMy41OTMgNTY4LjM2MkM3MzEuNDI2IDU2OC41NzUgNzI5LjM5OSA1NjkuNTMxIDcyNy44NTYgNTcxLjA2OEw2NzcuOTEzIDYxNS41VjQ0NS42MjVDNjc3LjkxMyA0NDAuNjE5IDY3OS45MDEgNDM1LjgxOCA2ODMuNDQxIDQzMi4yNzhDNjg2Ljk4MSA0MjguNzM5IDY5MS43ODIgNDI2Ljc1IDY5Ni43ODggNDI2Ljc1SDkyMy4yODhaIiBmaWxsPSIjQUFBQUFBIiBmaWxsLW9wYWNpdHk9IjAuNyIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzIxMTBfNDQ2MyI+CjxyZWN0IHdpZHRoPSIzMDIiIGhlaWdodD0iMzAyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjU5IDM4OSkiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K';
	var droppedFileList = [];
	var previewScrollPosition = {
		top: 0,
		left: 0,
	};
	var px2conf = {},
		pagesByLayout = [];
		useWrapMode = true;
	var editorLib = null;
	if(window.ace){
		editorLib = 'ace';
	}

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var $elmEditor,
		$elmTextareas,
		$elmTabs;

	var timer_onPreviewLoad,
		timer_autoSave,
		timer_updatePreview;
	var isSaving = false,
		isAutoSaveReserved = false;

	function autoSave(interval, finish){
		if( isSaving ){
			isAutoSaveReserved = {
				interval: interval,
				finish: finish,
			};
			return;
		}

		clearTimeout(timer_autoSave);
		timer_autoSave = setTimeout(function(){
			isSaving = true;
			saveModuleSrc(
				function(result){
					isSaving = false;

					if(!result || !result.result){
						console.error('Error:', result);
						alert(`Error: ${result.message}`);
						return;
					}

					if( isAutoSaveReserved ){
						isAutoSaveReserved = false;
						autoSave(0, isAutoSaveReserved.finish);
						return;
					}

					if( finish ){
						px2ce.finish();
					}else{
						updatePreview();
					}
				}
			);
		}, interval);
	}

	/**
	 * 初期化
	 */
	this.init = function(editorOption, callback){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it1, arg){
				px2ce.gpiBridge(
					{
						'api': 'getProjectConf'
					},
					function(_px2conf){
						px2conf = _px2conf;
						it1.next(arg);
					}
				);
			},
			function(it1, arg){
				$canvas.html('');
				toolbar.init({
					"onFinish": function(){
						// 完了イベント
						autoSave(0, true);
					}
				},function(){
					it1.next(arg);
				});
			},
			function(it1, arg){
				// --------------------------------------
				// 画面のフレームを構成する
				$canvas.append((function(){
					var fin = ''
							+'<div class="pickles2-contents-editor__default">'
								+'<div class="pickles2-contents-editor__default-editor">'
									+'<div class="pickles2-contents-editor__default-switch-tab">'
										+'<div class="px2-input-group px2-input-group--fluid" role="group">'
											+'<button class="px2-btn px2-btn--sm  px2-btn--toggle-on" data-pickles2-contents-editor-switch="html">HTML</button>'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="css">CSS (SCSS)</button>'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="js">JavaScript</button>'
										+'</div>'
									+'</div>'
									+'<div class="pickles2-contents-editor__default-editor-body">'
										+'<div class="pickles2-contents-editor__default-editor-body-html"></div>'
										+'<div class="pickles2-contents-editor__default-editor-body-css"></div>'
										+'<div class="pickles2-contents-editor__default-editor-body-js"></div>'
									+'</div>'
								+'</div>'
								+'<div class="pickles2-contents-editor__default-canvas" data-pickles2-contents-editor-preview-url="">'
								+'</div>'
							+'</div>'
					;
					return fin;
				})());

				$canvas.find('.pickles2-contents-editor__default-editor-body-css').hide();
				$canvas.find('.pickles2-contents-editor__default-editor-body-js').hide();

				$elmCanvas = $canvas.find('.pickles2-contents-editor__default-canvas');
				$elmEditor = $canvas.find('.pickles2-contents-editor__default-editor');
				$elmBtns = $canvas.find('.pickles2-contents-editor__default-btns');

				var $fileDropField = $(`<div class="pickles2-contents-editor__file-dropper">
					<div class="pickles2-contents-editor__file-dropper__droparea">
						<div class="pickles2-contents-editor__file-dropper__droparea-frame">ここにドロップしてください。</div>
					</div>
				</div>`)

				$canvas.append($fileDropField);

				$canvas
					.on('dragover', function(){
						$fileDropField.css({
							"display": "block",
						});
					})
					.on('dragleave', function(){
						$fileDropField.css({
							"display": "none",
						});
					});

				$elmTabs = $canvas.find('.pickles2-contents-editor__default-switch-tab [data-pickles2-contents-editor-switch]');
				$elmTabs
					.on('click', function(){
						var $this = $(this);
						$elmTabs.removeClass('px2-btn--toggle-on');
						$this.addClass('px2-btn--toggle-on');
						var tabFor = $this.attr('data-pickles2-contents-editor-switch');
						current_tab = tabFor;
						$canvas.find('.pickles2-contents-editor__default-editor-body-html').hide();
						$canvas.find('.pickles2-contents-editor__default-editor-body-css').hide();
						$canvas.find('.pickles2-contents-editor__default-editor-body-js').hide();
						$canvas.find('.pickles2-contents-editor__default-editor-body-'+tabFor).show();
					})
				;

				clearTimeout(timer_onPreviewLoad);
				var timeout = 30;
				timer_onPreviewLoad = setTimeout(function(){
					// 何らかの理由で、 iframeの読み込み完了イベントが発生しなかった場合、
					// 強制的にトリガーする。
					console.error('Loading preview timeout ('+(timeout)+'sec): Force trigger onPreviewLoad();');
					onPreviewLoad();
				}, timeout*1000);

				it1.next(arg);
			},
			function(it1, arg){
				windowResized(function(){
					it1.next(arg);
				});
			},
			function(it1, arg){
				// --------------------------------------
				// テキストエディタを初期化する
				px2ce.gpiBridge(
					{
						'api': 'getModuleSrc',
						'module_id': module_id,
					},
					function(codes){

						if( editorLib == 'ace' ){
							$canvas.find('.pickles2-contents-editor__default-editor-body-html').append('<div>');
							$canvas.find('.pickles2-contents-editor__default-editor-body-css').append('<div>');
							$canvas.find('.pickles2-contents-editor__default-editor-body-js').append('<div>');

							var aceCss = {
								'position': 'relative',
								'width': '100%',
								'height': '100%'
							};
							$elmTextareas = {};
							$elmTextareas['html'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__default-editor-body-html div').text(codes['template.html']).css(aceCss).get(0)
							);
							$elmTextareas['css'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__default-editor-body-css div').text(codes['module.css.scss']).css(aceCss).get(0)
							);
							$elmTextareas['js'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__default-editor-body-js div').text(codes['module.js']).css(aceCss).get(0)
							);
							for(var i in $elmTextareas){
								$elmTextareas[i].setFontSize(16);
								$elmTextareas[i].getSession().setUseWrapMode(useWrapMode);// Ace 自然改行
								$elmTextareas[i].setShowInvisibles(true);// Ace 不可視文字の可視化
								$elmTextareas[i].$blockScrolling = Infinity;
								$elmTextareas[i].setTheme("ace/theme/github");
								$elmTextareas[i].getSession().setMode("ace/mode/html");
							}
							$elmTextareas['html'].setTheme("ace/theme/monokai");
							$elmTextareas['html'].getSession().setMode("ace/mode/php");
							$elmTextareas['css'].setTheme("ace/theme/tomorrow");
							$elmTextareas['css'].getSession().setMode("ace/mode/scss");
							$elmTextareas['js'].setTheme("ace/theme/xcode");
							$elmTextareas['js'].getSession().setMode("ace/mode/javascript");
							switch(editorOption.editorMode){
								case 'md':
									$elmTextareas['html'].setTheme("ace/theme/github");
									$elmTextareas['html'].getSession().setMode("ace/mode/markdown");
									$canvas.find('.pickles2-contents-editor__default-switch-tab [data-pickles2-contents-editor-switch=html]').text('Markdown');
									break;
								case 'txt':
									$elmTextareas['html'].setTheme("ace/theme/katzenmilch");
									$elmTextareas['html'].getSession().setMode("ace/mode/plain_text");
									$canvas.find('.pickles2-contents-editor__default-switch-tab [data-pickles2-contents-editor-switch=html]').text('Text');
									break;
								case 'html':
								default:
									$elmTextareas['html'].setTheme("ace/theme/monokai");
									$elmTextareas['html'].getSession().setMode("ace/mode/php");
									break;
							}

						}else{
							$canvas.find('.pickles2-contents-editor__default-editor-body-html').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__default-editor-body-css').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__default-editor-body-js').append('<textarea>');

							$elmTextareas = {};
							$elmTextareas['html'] = $canvas.find('.pickles2-contents-editor__default-editor-body-html textarea');
							$elmTextareas['css'] = $canvas.find('.pickles2-contents-editor__default-editor-body-css textarea');
							$elmTextareas['js'] = $canvas.find('.pickles2-contents-editor__default-editor-body-js textarea');

							$elmTextareas['html'].val(codes['template.html']);
							$elmTextareas['css'] .val(codes['module.css.scss']);
							$elmTextareas['js']  .val(codes['module.js']);

						}

						it1.next(arg);
					}
				);
			},
			function(it1, arg){
				// --------------------------------------
				// 自動保存イベントをセット
				if( editorLib == 'ace' ){
					for(var i in $elmTextareas){
						$elmTextareas[i].getSession().on('change', function(){ autoSave(5000); });
					}
				}else{
					for(var i in $elmTextareas){
						$elmTextareas[i].on('change, keydown, keyup', function(){ autoSave(5000); });
					}
				}
				it1.next(arg);
			},
			function(it1, arg){
				setKeyboardEvent(function(){
					it1.next(arg);
				});
			},
			function(it1, arg){
				windowResized(function(){
					it1.next(arg);
				});
			},
			function(it1, arg){
				it1.next(arg);
			},
		]);

	};


	/**
	 * 画面を再描画する
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		windowResized(function(){
			callback();
		});
		return;
	}

	/**
	 * 位置合わせ
	 */
	this.adjust = this.redraw;

	/**
	 * キーボードイベントハンドラ
	 */
	function setKeyboardEvent(callback){
		callback = callback || function(){};
		if( !window.keypress ){ callback(true); return; }

		// キーボードイベントセット
		_Keypress = new window.keypress.Listener();
		_this.Keypress = _Keypress;
		_Keypress.simple_combo(px2ce.getCmdKeyName()+" s", function(e) {
			autoSave(0, e.shiftKey);
		});

		callback(true);
		return;
	}

	/**
	 * window.resize イベントハンドラ
	 */
	function windowResized( callback ){
		callback = callback || function(){};

		$canvas.find('.pickles2-contents-editor__default-editor-body').css({
			'height': $elmEditor.outerHeight() - $canvas.find('.pickles2-contents-editor__default-switch-tab').outerHeight() - 2
		});

		callback();
		return;
	}

	/**
	 * プレビューを更新
	 */
	function updatePreview(){
		clearTimeout(timer_updatePreview);
		timer_updatePreview = setTimeout(function(){
			console.error('Reloading preview is too slow.');
		}, 1000);

		it79.fnc({}, [
			function(it){
				if( _this.postMessenger===undefined ){
					it.next();
					return;
				}
				_this.postMessenger.send(
					'getScrollPosition',
					{},
					function(position){
						previewScrollPosition = position;
						it.next();
					}
				);
			},
			function(it){
				_this.postMessenger.send(
					'reload',
					{},
					function(result){
						if( !result ){
							console.error('Failed to reload preview.');
						}
						it.next();
					}
				);
			},
			function(it){
				clearTimeout(timer_updatePreview);
			},
		]);
	}

	/**
	 * プレビューがロードされたら実行
	 */
	function onPreviewLoad( callback ){
		callback = callback || function(){};
		if(_this.postMessenger===undefined){return;}
		clearTimeout(timer_onPreviewLoad);

		it79.fnc({}, [
			function( it1, data ){
				// postMessageの送受信を行う準備
				_this.postMessenger.init(function(){
					it1.next(data);
				});
			} ,
			function(it1, data){
				// スクロール位置を復元
				// NOTE: 子ウィンドウは、最初の通信で Origin を記憶する。
				_this.postMessenger.send(
					'setScrollPosition',
					previewScrollPosition,
					function(){
						it1.next(data);
					}
				);
			},
			function(it1, data){
				callback();
				it1.next(data);
			},
		]);
		return;
	}

	/**
	 * 編集したコンテンツを保存する
	 */
	function saveModuleSrc(callback){
		var codes;
		if( editorLib == 'ace' ){
			codes = {
				'template.html': $elmTextareas['html'].getValue(),
				'module.css.scss': $elmTextareas['css'].getValue(),
				'module.js': $elmTextareas['js'].getValue()
			};
		}else{
			codes = {
				'template.html': $elmTextareas['html'].val(),
				'module.css.scss': $elmTextareas['css'].val(),
				'module.js': $elmTextareas['js'].val()
			};
		}
		px2ce.gpiBridge(
			{
				'api': 'saveModuleSrc',
				'module_id': module_id,
				'codes': codes
			},
			function(result){
				it79.ary(
					droppedFileList,
					function(itAry1, row, idx){
						px2ce.gpiBridge(
							{
								'api': 'savePageResources',
								'module_id': module_id,
								'filename': row.name,
								'base64': row.base64
							},
							function(result){
								itAry1.next();
							}
						);
					},
					function(){
						droppedFileList = []; // アップロードしたら忘れて良い。
						callback(result);
					}
				);

			}
		);
	}

}
