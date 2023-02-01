/**
 * default/default.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var dateformat = require('dateformat');
	var it79 = require('iterate79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;
	var current_tab = 'html';
	var _imgDummy = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiZTdmZmNiZS1lMTgwLTQwZGUtOTA3My1lNjk2MDk5YmYyNDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzlGNUUyODQ5NzU4MTFFNTg0MTBGRkY3MEQzOTdDQTQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzlGNUUyODM5NzU4MTFFNTg0MTBGRkY3MEQzOTdDQTQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDphMDI5NWE5YS05YzRkLTQzNjYtYjhjOS05NWQ1MjM0ZThhNDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6YmU3ZmZjYmUtZTE4MC00MGRlLTkwNzMtZTY5NjA5OWJmMjQ5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';
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
						"label": "画像ファイルを挿入",
						"click": function(){
							openInsertImageDialog();
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

				$fileDropField
					.on('drop', function(e){
						// ファイルドロップへの対応
						e.stopPropagation();
						e.preventDefault();
						var event = e.originalEvent;
						var droppedFileInfo = event.dataTransfer.files[0];

						// mod.filename
						readSelectedLocalFile(droppedFileInfo, function(_dataUri){
							var fileInfo = {
								'name': droppedFileInfo.name,
								'ext': getExtension( droppedFileInfo.name ),
								'size': droppedFileInfo.size,
								'type': droppedFileInfo.type,
								"base64": _dataUri,
							};

							$fileDropField.css({
								"display": "none",
							});

							openInsertImageDialog( fileInfo );
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
	 * 画像挿入ダイアログを開く
	 */
	function openInsertImageDialog( presetInsertFileInfo ){

		var $body = $(`<div>
			<p>挿入する画像を選択してください。</p>
			<div class="px2-form-input-list">
				<ul class="px2-form-input-list__ul">
					<li class="px2-form-input-list__li">
						<div class="px2-form-input-list__label"><label for="insert-image-file">ファイル</label></div>
						<div class="px2-form-input-list__input">
							<div class="pickles2-contents-editor__default-image-preview">
								<img class="pickles2-contents-editor__default-image-preview-image" style="min-width: 10%; max-width: 100%; min-height: 1px; max-height: 200px; user-select: none; pointer-events: none;" />
								<div class="pickles2-contents-editor__default-image-preview-no-image" style="padding: 3m; font-weight: bold; font-size: 24px; color: #aaa;"></div>
							</div>
							<input type="file" id="insert-image-file" name="insert-image-file" value="" accept="image/png, image/jpeg, image/gif" />
						</div>
					</li>
					<li class="px2-form-input-list__li">
						<div class="px2-form-input-list__label"><label for="insert-image-file-name">ファイル名</label></div>
						<div class="px2-form-input-list__input">
							<input type="text" id="insert-image-file-name" name="insert-image-file-name" value="" class="px2-input px2-input--block" required />
						</div>
					</li>
				</ul>
			</div>
		</div>`);
		var $imgPreview = $body.find('.pickles2-contents-editor__default-image-preview-image');
		var $imgNotImage = $('.pickles2-contents-editor__default-image-preview-no-image');

		function isValidFilename(filename){
			if( !filename.match(/^[a-z0-9\-\_]+\.[a-z0-9]+$/i) ){
				return false;
			}
			return true;
		}
		function generateAutoFilename(filename){
			var ext = filename.replace(/^[\s\S]*\./, '');
			var today = new Date();
			return dateformat(today, 'yyyy-mm-dd-hhMMss') + '.' + ext;
		}

		/**
		 * 画像プレビューを更新する
		 */
		function setImagePreview(fileInfo){
			var fileSrc = fileInfo.src;
			var fileMimeType = fileInfo.mimeType;
			if( !fileInfo.src || !fileInfo.ext || !fileInfo.size){
				fileSrc = _imgDummy;
				fileMimeType = 'image/png';
			}
			$imgPreview
				.attr({
					"src": fileSrc,
				})
			;
			$imgNotImage.text( fileInfo.ext );
			if( canFilePreviewAsImage(fileMimeType, fileInfo.ext) ){
				$imgPreview.show();
				$imgNotImage.hide();
			}else{
				$imgPreview.hide();
				$imgNotImage.show();
			}
			return;
		}

		var modalObj = px2style.modal({
			"title": "画像を挿入",
			"body": $body,
			"form": {
				"submit": function(){
					var $inputFile = $body.find('input[name=insert-image-file]');
					var $inputFileName = $body.find('input[name=insert-image-file-name]');
					var fileInfoJSON = $inputFile.attr('data-upload-file');
					if( !fileInfoJSON ){
						return;
					}
					if( !$inputFileName.val() ){
						return;
					}

					if( !isValidFilename($inputFileName.val()) ){
						alert('ファイル名は、半角英数字、ハイフン、アンダースコアで構成してください。');
						return;
					}

					var fileInfo = JSON.parse(fileInfoJSON);
					fileInfo.name = (function(){
						if( !isValidFilename($inputFileName.val()) ){
							return generateAutoFilename($inputFileName.val());
						}
						return $inputFileName.val();
					})();

					insertUploadFile(fileInfo);
					modalObj.close();
				}
			},
			"buttons": [
				$(`<button type="submit" class="px2-btn px2-btn--primary">挿入する</button>`),
			],
		}, function(){
			var $inputFile = $body.find('input[name=insert-image-file]');
			var $inputFileName = $body.find('input[name=insert-image-file-name]');

			if( typeof(presetInsertFileInfo) == typeof({}) ){
				setImagePreview({
					'src': presetInsertFileInfo.base64,
					'ext': getExtension(presetInsertFileInfo.name),
					'size': presetInsertFileInfo.size,
					'mimeType': presetInsertFileInfo.type,
				});
				$inputFile.attr({
					'data-upload-file': JSON.stringify({
						'name': presetInsertFileInfo.name,
						'ext': getExtension(presetInsertFileInfo.name),
						'size': presetInsertFileInfo.size,
						'type': presetInsertFileInfo.type,
						'base64': presetInsertFileInfo.base64,
					})
				});
				$inputFileName.val((function(){
					if( !isValidFilename(presetInsertFileInfo.name) ){
						return generateAutoFilename(presetInsertFileInfo.name);
					}
					return presetInsertFileInfo.name;
				})());
			}

			$inputFile
				.on('change', function(e){
					var $this = $(this);
					var fileInfo = e.target.files[0];
					var realpathSelected = $this.val();

					if( realpathSelected ){
						readSelectedLocalFile(fileInfo, function(dataUri){
							setImagePreview({
								'src': dataUri,
								'ext': getExtension(fileInfo.name),
								'size': fileInfo.size,
								'mimeType': fileInfo.type,
							});
							$this.attr({
								'data-upload-file': JSON.stringify({
									'name': fileInfo.name,
									'ext': getExtension(fileInfo.name),
									'size': fileInfo.size,
									'type': fileInfo.type,
									'base64': dataUri,
								})
							});
							$inputFileName.val((function(){
								if( !isValidFilename(fileInfo.name) ){
									return generateAutoFilename(fileInfo.name);
								}
								return fileInfo.name;
							})());
						});
					}
				});

			var $imagePreviewArea = $body.find('.pickles2-contents-editor__default-image-preview');
			$imagePreviewArea
				.css({
					'border':'1px solid #999',
					'padding': 10,
					'margin': '10px auto',
					'background': '#fff',
					'outline': 'none',
					'border-radius': 5,
					'text-align': 'center',
				})
				.on('paste', function(e){
					var items = e.originalEvent.clipboardData.items;
					for (var i = 0 ; i < items.length ; i++) {
						var item = items[i];
						// console.log(item);
						if(item.type.indexOf("image") != -1){
							var fileInfo = item.getAsFile();
							fileInfo.name = fileInfo.name||'clipboard.'+(function(type){
								if(type.match(/png$/i)){return 'png';}
								if(type.match(/gif$/i)){return 'gif';}
								if(type.match(/(?:jpeg|jpg|jpe)$/i)){return 'jpg';}
								if(type.match(/svg/i)){return 'svg';}
								return 'txt';
							})(fileInfo.type);

							// mod.filename
							readSelectedLocalFile(fileInfo, function(dataUri){
								setImagePreview({
									'src': dataUri,
									'ext': getExtension(fileInfo.name),
									'size': fileInfo.size,
									'mimeType': fileInfo.type,
								});
								$inputFile.attr({
									'data-upload-file': JSON.stringify({
										'name': fileInfo.name,
										'ext': getExtension(fileInfo.name),
										'size': fileInfo.size,
										'type': fileInfo.type,
										'base64': dataUri,
									})
								});
								$inputFileName.val( generateAutoFilename(fileInfo.name) );
							});

						}
					}
				});

		});
	}

	/**
	 * アップロードしたファイルをコンテンツに挿入する
	 */
	function insertUploadFile(fileInfo, callback){
		var path_resource;

		it79.fnc({}, [
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
				// var uploadFileName = './'+path_resource+'/'+fileName;
				var uploadFileName = '<'; // NOTE: minifyされたあと、PHPコードとして成立してしまわないように、複数行に分解している。
				uploadFileName += '?';
				uploadFileName += '= $px->h($px->path_files("/'+fileName+'")) ?';
				uploadFileName += '>';
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

				// アップロードファイルを一時記憶
				// ファイルは、次回保存時に保存されます。
				droppedFileList.push({
					'name': fileInfo.name,
					'type': fileInfo.type,
					'size': fileInfo.size,
					'base64': fileInfo.base64,
				});

				// コンテンツに文字列を挿入する
				insertText( insertString, current_tab );

				it1.next();
			},
			function(it1){
				saveContentsSrc(function(){
					it1.next();
				});
			},
			function(){
				callback();
			}
		]);
		return;
	}

	/**
	 * アップロードファイルを読み込む
	 */
	function readSelectedLocalFile(fileInfo, callback){
		var reader = new FileReader();
		reader.onload = function(evt) {
			callback( evt.target.result );
		}
		reader.readAsDataURL(fileInfo);
	}

	/**
	 * エディタにテキストを挿入する
	 */
	function insertText( insertCode, targetTab ){
		if( !targetTab ){
			targetTab = current_tab;
		}
		var $currentTab = $elmTextareas[targetTab];

		if( editorLib == 'ace' ){
			$currentTab.insert(insertCode);
		}else{
			var curesorPosition = $currentTab.get(0).selectionStart;
			var currentString = $currentTab.val();
			$currentTab.val(currentString.slice(0, curesorPosition) + insertCode + currentString.slice(curesorPosition));
		}
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
	 * パスから拡張子を取り出して返す
	 */
	function getExtension(path){
		var ext = '';
		try {
			var ext = path.replace( new RegExp('^.*?\.([a-zA-Z0-9\_\-]+)$'), '$1' );
			ext = ext.toLowerCase();
		} catch (e) {
			ext = false;
		}
		return ext;
	}

	/**
	 * 画像としてプレビューできる種類か評価する
	 */
	function canFilePreviewAsImage(mimetype, ext){
		if( mimetype ){
			if( mimetype.match(/^image\//) ){
				return true;
			}
		}else if( ext ){
			switch( ext ){
				case 'jpg':
				case 'jpeg':
				case 'jpe':
				case 'png':
				case 'gif':
				case 'webp':
					return true;
					break;
			}
		}
		return false;
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
