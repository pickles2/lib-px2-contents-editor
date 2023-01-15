/**
 * default/default.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var it79 = require('iterate79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;
	var current_tab = 'html';
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

	var $iframe,
		$elmCanvas,
		$elmEditor,
		// $elmBtns,
		$elmTextareas,
		$elmTabs;

	var timer_onPreviewLoad,
		timer_autoSave;
	var isSaving = false,
		isAutoSaveReserved = false;

	function getCanvasPageUrl(){
		var rtn = getPreviewUrl();
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
		rtn += (query.length ? '?'+query+'&' : '?') + 'PICKLES2_CONTENTS_EDITOR=default';
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
	function toggleWordWrapMode(elmBtn){
		useWrapMode = !useWrapMode;
		if( useWrapMode ){
			$(elmBtn).addClass('px2-btn--toggle-on');
		}else{
			$(elmBtn).removeClass('px2-btn--toggle-on');
		}
		setWordWrapMode(useWrapMode);
		return;
	}
	function setWordWrapMode(wrapTo){
		useWrapMode = !!wrapTo;
		console.info(useWrapMode);
		if( editorLib == 'ace' ){
			for(var i in $elmTextareas){
				$elmTextareas[i].getSession().setUseWrapMode(useWrapMode);
			}
		}else{
			for(var i in $elmTextareas){
				$elmTextareas[i].css({
					'white-space': (useWrapMode ? 'pre-wrap' : 'pre')
				});
			}
		}
		return;
	}
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
			saveContentsSrc(
				function(result){
					if(!result.result){
						console.error('Error:', result);
						alert(result.message);
					}

					isSaving = false;

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
				pagesByLayout = [];
				if( px2ce.target_mode != 'theme_layout' ){
					it1.next(arg);
					return;
				}
				px2ce.gpiBridge(
					{
						'api': 'getPagesByLayout',
						'layout_id': px2ce.layout_id
					},
					function(pages){
						pagesByLayout = pages;
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
					toolbar.addButton({
						"label": "ブラウザでプレビュー",
						"click": function(){
							px2ce.openUrlInBrowser( getPreviewUrl() );
						}
					});
					toolbar.addButton({
						"label": "リソース",
						"click": function(){
							px2ce.openResourceDir();
						}
					});
					toolbar.addButton({
						"label": "折返し",
						"click": function(){
							toggleWordWrapMode(this);
						},
						"cssClass": [
							"px2-btn--toggle-on"
						]
					});
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

				$elmEditor.on('drop', onFileDropped); // ファイルドロップへの対応

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


				$iframe = $('<iframe>');
				$elmCanvas.html('').append($iframe);
				$iframe
					.on('load', function(){
						console.info('pickles2-contents-editor: preview loaded');
						onPreviewLoad( callback );
					})
				;
				// $iframe.attr({"src":"about:blank"});
				_this.postMessenger = new (require('../../apis/postMessenger.js'))(px2ce, $iframe.get(0));

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
				$elmCanvas.attr({
					"data-pickles2-contents-editor-preview-url": getCanvasPageUrl()
				});

				px2ce.gpiBridge(
					{
						'api': 'getContentsSrc',
						'page_path': page_path,
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
								$canvas.find('.pickles2-contents-editor__default-editor-body-html div').text(codes['html']).css(aceCss).get(0)
							);
							$elmTextareas['css'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__default-editor-body-css div').text(codes['css']).css(aceCss).get(0)
							);
							$elmTextareas['js'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__default-editor-body-js div').text(codes['js']).css(aceCss).get(0)
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

							$elmTextareas['html'].val(codes['html']);
							$elmTextareas['css'] .val(codes['css']);
							$elmTextareas['js']  .val(codes['js']);

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
						$elmTextareas[i].getSession().on('change', function(){ autoSave(1000); });
					}
				}else{
					for(var i in $elmTextareas){
						$elmTextareas[i].on('change, keydown, keyup', function(){ autoSave(1000); });
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
				var previewUrl = $elmCanvas.attr('data-pickles2-contents-editor-preview-url');
				$iframe
					.attr({
						'src': previewUrl,
					})
				;
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
	 * ファイルドロップイベントハンドラ
	 */
	function onFileDropped(e){
		e.stopPropagation();
		e.preventDefault();
		var event = e.originalEvent;
		var fileInfo = event.dataTransfer.files[0];
		var dataUri;
		var path_resource;

		function readSelectedLocalFile(fileInfo, callback){
			var reader = new FileReader();
			reader.onload = function(evt) {
				callback( evt.target.result );
			}
			reader.readAsDataURL(fileInfo);
		}

		it79.fnc({}, [
			function(it1){
				// mod.filename
				readSelectedLocalFile(fileInfo, function(_dataUri){
					dataUri = _dataUri;
					it1.next();
				});
			},
			function(it1){
				px2ce.gpiBridge(
					{
						'api': 'getPathResources',
						'page_path': page_path
					},
					function(result){
						var path = require('path');
						var tmpPathControot = px2conf.path_controot;
						tmpPathControot = tmpPathControot.replace(/\/+$/, '')+page_path;
						tmpPathControot = tmpPathControot.replace(/[^\/]*$/, '');
						var relative_path = path.relative(tmpPathControot, result);
						path_resource = relative_path;
						it1.next();
					}
				);
			},
			function(it1){
				var fileName = fileInfo.name;
				var uploadFileName = './'+path_resource+'/'+fileName;
				var insertString = '';

				// 開いているタブの種類に応じて、
				// 挿入する文字列を出し分ける。
				switch(current_tab){
					case 'css':
						insertString = 'url("'+uploadFileName+'")';
						break;
					case 'js':
						insertString = '"'+uploadFileName+'"';
						break;
					case 'html':
					default:
						if( fileInfo.type.match(/^image\//) ){
							insertString = '<img src="'+uploadFileName+'" alt="" />'+"\n";
						}else{
							insertString = '<a href="'+uploadFileName+'" download="'+fileName+'">'+fileName+'</a>'+"\n";
						}
						break;
				}

				// 文字列を挿入する
				if( editorLib == 'ace' ){
					// AceEditorの処理
					$elmTextareas[current_tab].insert(insertString);
				}else{
					console.error('AceEditor以外のファイル挿入機能は未開発です。'); // TODO: 実装する
				}

				// アップロードファイルを一時記憶
				// ファイルは、次回保存時に保存されます。
				droppedFileList.push({
					'name': fileName,
					'type': fileInfo.type,
					'size': fileInfo.size,
					'base64': dataUri,
				});
				it1.next();
			}
		]);
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
	function saveContentsSrc(callback){
		var codes;
		if( editorLib == 'ace' ){
			codes = {
				'html': $elmTextareas['html'].getValue(),
				'css':  $elmTextareas['css'].getValue(),
				'js':   $elmTextareas['js'].getValue()
			};
		}else{
			codes = {
				'html': $elmTextareas['html'].val(),
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
				it79.ary(
					droppedFileList,
					function(itAry1, row, idx){
						px2ce.gpiBridge(
							{
								'api': 'savePageResources',
								'page_path': page_path,
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
