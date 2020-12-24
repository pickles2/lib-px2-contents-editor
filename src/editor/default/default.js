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

	var timer_onPreviewLoad;

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
				toolbar.init({
					"onFinish": function(){
						// 完了イベント
						saveContentsSrc(
							function(result){
								console.log(result);
								if(!result.result){
									alert(result.message);
								}
								px2ce.finish();
							}
						);
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
					toolbar.addButton({
						"label": "保存する",
						"click": function(){
							saveContentsSrc(
								function(result){
									if(!result.result){
										console.error(result);
										alert(result.message);
									}
									updatePreview();
								}
							);
						}
					});
					it1.next(arg);
				});
			},
			function(it1, arg){
				$canvas.append((function(){
					var fin = ''
							+'<div class="pickles2-contents-editor--default">'
								+'<div class="pickles2-contents-editor--default-editor">'
									+'<div class="pickles2-contents-editor--default-switch-tab">'
										+'<div class="btn-group btn-group-justified" role="group">'
											+'<div class="btn-group" role="group">'
												+'<button class="btn btn-default btn-xs" data-pickles2-contents-editor-switch="html" disabled>HTML</button>'
											+'</div>'
											+'<div class="btn-group" role="group">'
												+'<button class="btn btn-default btn-xs" data-pickles2-contents-editor-switch="css">CSS (SCSS)</button>'
											+'</div>'
											+'<div class="btn-group" role="group">'
												+'<button class="btn btn-default btn-xs" data-pickles2-contents-editor-switch="js">JavaScript</button>'
											+'</div>'
										+'</div>'
									+'</div>'
									+'<div class="pickles2-contents-editor--default-editor-body">'
										+'<div class="pickles2-contents-editor--default-editor-body-html"></div>'
										+'<div class="pickles2-contents-editor--default-editor-body-css"></div>'
										+'<div class="pickles2-contents-editor--default-editor-body-js"></div>'
									+'</div>'
								+'</div>'
								+'<div class="pickles2-contents-editor--default-canvas" data-pickles2-contents-editor-preview-url="">'
								+'</div>'
							+'</div>'
					;
					return fin;
				})());

				$canvas.find('.pickles2-contents-editor--default-editor-body-css').hide();
				$canvas.find('.pickles2-contents-editor--default-editor-body-js').hide();

				$elmCanvas = $canvas.find('.pickles2-contents-editor--default-canvas');
				$elmEditor = $canvas.find('.pickles2-contents-editor--default-editor');
				$elmBtns = $canvas.find('.pickles2-contents-editor--default-btns');

				$elmEditor.on('drop', onFileDropped); // ファイルドロップへの対応

				$elmTabs = $canvas.find('.pickles2-contents-editor--default-switch-tab [data-pickles2-contents-editor-switch]');
				$elmTabs
					.on('click', function(){
						var $this = $(this);
						$elmTabs.removeAttr('disabled');
						$this.attr({'disabled': 'disabled'});
						var tabFor = $this.attr('data-pickles2-contents-editor-switch');
						// console.log(tabFor);
						current_tab = tabFor;
						$canvas.find('.pickles2-contents-editor--default-editor-body-html').hide();
						$canvas.find('.pickles2-contents-editor--default-editor-body-css').hide();
						$canvas.find('.pickles2-contents-editor--default-editor-body-js').hide();
						$canvas.find('.pickles2-contents-editor--default-editor-body-'+tabFor).show();
					})
				;


				$iframe = $('<iframe>');
				$elmCanvas.html('').append($iframe);
				$iframe
					.on('load', function(){
						console.log('pickles2-contents-editor: preview loaded');
						// alert('pickles2-contents-editor: preview loaded');
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
				$elmCanvas.attr({
					"data-pickles2-contents-editor-preview-url": getCanvasPageUrl()
				});

				px2ce.gpiBridge(
					{
						'api': 'getContentsSrc',
						'page_path': page_path
					},
					function(codes){
						// console.log(codes);

						if( editorLib == 'ace' ){
							$canvas.find('.pickles2-contents-editor--default-editor-body-html').append('<div>');
							$canvas.find('.pickles2-contents-editor--default-editor-body-css').append('<div>');
							$canvas.find('.pickles2-contents-editor--default-editor-body-js').append('<div>');

							var aceCss = {
								'position': 'relative',
								'width': '100%',
								'height': '100%'
							};
							$elmTextareas = {};
							$elmTextareas['html'] = ace.edit(
								$canvas.find('.pickles2-contents-editor--default-editor-body-html div').text(codes['html']).css(aceCss).get(0)
							);
							$elmTextareas['css'] = ace.edit(
								$canvas.find('.pickles2-contents-editor--default-editor-body-css div').text(codes['css']).css(aceCss).get(0)
							);
							$elmTextareas['js'] = ace.edit(
								$canvas.find('.pickles2-contents-editor--default-editor-body-js div').text(codes['js']).css(aceCss).get(0)
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
									$canvas.find('.pickles2-contents-editor--default-switch-tab [data-pickles2-contents-editor-switch=html]').text('Markdown');
									break;
								case 'txt':
									$elmTextareas['html'].setTheme("ace/theme/katzenmilch");
									$elmTextareas['html'].getSession().setMode("ace/mode/plain_text");
									$canvas.find('.pickles2-contents-editor--default-switch-tab [data-pickles2-contents-editor-switch=html]').text('Text');
									break;
								case 'html':
								default:
									$elmTextareas['html'].setTheme("ace/theme/monokai");
									$elmTextareas['html'].getSession().setMode("ace/mode/php");
									break;
							}

						}else{
							$canvas.find('.pickles2-contents-editor--default-editor-body-html').append('<textarea>');
							$canvas.find('.pickles2-contents-editor--default-editor-body-css').append('<textarea>');
							$canvas.find('.pickles2-contents-editor--default-editor-body-js').append('<textarea>');

							$elmTextareas = {};
							$elmTextareas['html'] = $canvas.find('.pickles2-contents-editor--default-editor-body-html textarea');
							$elmTextareas['css'] = $canvas.find('.pickles2-contents-editor--default-editor-body-css textarea');
							$elmTextareas['js'] = $canvas.find('.pickles2-contents-editor--default-editor-body-js textarea');

							$elmTextareas['html'].val(codes['html']);
							$elmTextareas['css'] .val(codes['css']);
							$elmTextareas['js']  .val(codes['js']);

						}

						it1.next(arg);
					}
				);
			},
			function(it1, arg){
				setKeyboardEvent(function(){
					windowResized(function(){
					});
					updatePreview();
				});
				it1.next(arg);
			}
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
			saveContentsSrc(
				function(result){
					console.log(result);
					if(!result.result){
						alert(result.message);
					}
					updatePreview();
				}
			);
		});

		callback(true);
		return;
	}

	/**
	 * ファイルドロップイベントハンドラ
	 */
	function onFileDropped(e){
		// console.log(e);
		// console.log(current_tab, px2conf);
		e.stopPropagation();
		e.preventDefault();
		var event = e.originalEvent;
		var fileInfo = event.dataTransfer.files[0];
		// console.log(fileInfo);
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
					// console.log(dataUri);
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
						// console.log(result);
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
						insertString = '<img src="'+uploadFileName+'" alt="" />'+"\n";
							// TODO: ファイルの種類に応じてタグの出し分けをしたい。
							// 例: 画像なら img要素、 mp4 なら video要素、 それ以外は ダウンロードボタン
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

		var $toolbar = toolbar.getElm();
		var tbHeight = $toolbar.outerHeight();

		$canvas.css({
			'position': 'relative'
		});
		$elmCanvas.css({
			'position': 'absolute',
			'overflow': 'auto',
			'top': tbHeight,
			'left': 0,
			'width': '60%',
			'height': $canvas.innerHeight() - tbHeight
		});
		$elmEditor.css({
			'position': 'absolute',
			'top': tbHeight,
			'right': 0,
			'width': '40%',
			'height': $canvas.innerHeight() - tbHeight
		});

		$canvas.find('.pickles2-contents-editor--default-editor-body').css({
			'height': $elmEditor.outerHeight() - $canvas.find('.pickles2-contents-editor--default-switch-tab').outerHeight() - 2
		});

		callback();
		return;
	}

	/**
	 * プレビューを更新
	 */
	function updatePreview(){
		var previewUrl = $elmCanvas.attr('data-pickles2-contents-editor-preview-url');
		$iframe
			.attr({
				'src': previewUrl
			})
		;
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
				console.log('---- postMessenger.init()');
				_this.postMessenger.init(function(){
					it1.next(data);
				});
			} ,
			function(it1, arg){
				// iframeのサイズ合わせ
				// TODO: 子ウィンドウは、最初の通信で Origin を記憶するので、特に必要ないけどリクエストを投げている。よりよい方法が欲しい。
				_this.postMessenger.send(
					'getHtmlContentHeightWidth',
					{},
					function(hw){
						// $canvas.find('iframe').height( hw.h + 0 ).width( hw.w + 0 );
						// it1.next(data);
						it1.next(arg);
					}
				);
			},
			function(it1, data){
				callback();
				it1.next(data);
			}
		]);
		return this;
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
				// console.log(result);
				// console.log(droppedFileList);

				it79.ary(
					droppedFileList,
					function(itAry1, row, idx){
						// console.log(itAry1, row, idx);
						px2ce.gpiBridge(
							{
								'api': 'savePageResources',
								'page_path': page_path,
								'filename': row.name,
								'base64': row.base64
							},
							function(result){
								// console.log(result);
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
