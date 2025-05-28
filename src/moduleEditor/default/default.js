/**
 * default/default.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var it79 = require('iterate79');
	var $canvas = $(px2ce.getElmCanvas());
	var module_id = px2ce.module_id;
	var droppedFileList = [];
	var editorMode = null,
		px2conf = {},
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

	var timer_autoSave;
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
		editorMode = editorOption.editorMode || 'html';

		it79.fnc({}, [
			function(it1, arg){
				px2ce.gpiBridge(
					{
						'api': 'getProjectConf',
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
							+'<div class="pickles2-contents-editor__module-editor-default">'
								+'<div class="pickles2-contents-editor__module-editor-default-editor">'
									+'<div class="pickles2-contents-editor__module-editor-default-switch-tab">'
										+'<div class="px2-input-group px2-input-group--fluid" role="group">'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="info">info</button>'
											+'<button class="px2-btn px2-btn--sm px2-btn--toggle-on" data-pickles2-contents-editor-switch="html">HTML</button>'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="css">CSS</button>'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="js">JavaScript</button>'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="finalize">finalize</button>'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="clip">clip</button>'
										+'</div>'
									+'</div>'
									+'<div class="pickles2-contents-editor__module-editor-default-editor-body">'
										+'<div class="pickles2-contents-editor__module-editor-default-editor-body-info"></div>'
										+'<div class="pickles2-contents-editor__module-editor-default-editor-body-html"></div>'
										+'<div class="pickles2-contents-editor__module-editor-default-editor-body-css"></div>'
										+'<div class="pickles2-contents-editor__module-editor-default-editor-body-js"></div>'
										+'<div class="pickles2-contents-editor__module-editor-default-editor-body-finalize"></div>'
										+'<div class="pickles2-contents-editor__module-editor-default-editor-body-clip"></div>'
									+'</div>'
								+'</div>'
							+'</div>'
					;
					return fin;
				})());

				$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-info').hide();
				$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-css').hide();
				$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-js').hide();
				$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-finalize').hide();
				$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-clip').hide();

				$elmEditor = $canvas.find('.pickles2-contents-editor__module-editor-default-editor');
				$elmBtns = $canvas.find('.pickles2-contents-editor__module-editor-default-btns');

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

				$elmTabs = $canvas.find('.pickles2-contents-editor__module-editor-default-switch-tab [data-pickles2-contents-editor-switch]');
				$elmTabs
					.on('click', function(){
						var $this = $(this);
						$elmTabs.removeClass('px2-btn--toggle-on');
						$this.addClass('px2-btn--toggle-on');
						var tabFor = $this.attr('data-pickles2-contents-editor-switch');
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-info').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-html').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-css').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-js').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-finalize').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-clip').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-'+tabFor).show();
					})
				;

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
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-info').append('<div>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-html').append('<div>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-css').append('<div>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-js').append('<div>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-finalize').append('<div>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-clip').append('<div>');

							var aceCss = {
								'position': 'relative',
								'width': '100%',
								'height': '100%'
							};
							$elmTextareas = {};
							$elmTextareas['info'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-info div').text(codes['info.json']).css(aceCss).get(0)
							);
							$elmTextareas['html'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-html div').text(
									editorOption.editorMode == 'twig'
										? codes['template.html.twig']
										: codes['template.html']
								).css(aceCss).get(0)
							);
							$elmTextareas['css'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-css div').text(codes['module.css.scss']).css(aceCss).get(0)
							);
							$elmTextareas['js'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-js div').text(codes['module.js']).css(aceCss).get(0)
							);
							$elmTextareas['finalize'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-finalize div').text(codes['finalize.php']).css(aceCss).get(0)
							);
							$elmTextareas['clip'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-clip div').text(codes['clip.json']).css(aceCss).get(0)
							);
							for(var i in $elmTextareas){
								$elmTextareas[i].setFontSize(16);
								$elmTextareas[i].getSession().setUseWrapMode(useWrapMode);// Ace 自然改行
								$elmTextareas[i].setShowInvisibles(true);// Ace 不可視文字の可視化
								$elmTextareas[i].$blockScrolling = Infinity;
								$elmTextareas[i].setTheme("ace/theme/github");
								$elmTextareas[i].getSession().setMode("ace/mode/html");
							}
							$elmTextareas['info'].setTheme("ace/theme/xcode");
							$elmTextareas['info'].getSession().setMode("ace/mode/json");
							$elmTextareas['html'].setTheme("ace/theme/monokai");
							$elmTextareas['html'].getSession().setMode("ace/mode/php");
							$elmTextareas['css'].setTheme("ace/theme/tomorrow");
							$elmTextareas['css'].getSession().setMode("ace/mode/scss");
							$elmTextareas['js'].setTheme("ace/theme/xcode");
							$elmTextareas['js'].getSession().setMode("ace/mode/javascript");
							$elmTextareas['finalize'].setTheme("ace/theme/monokai");
							$elmTextareas['finalize'].getSession().setMode("ace/mode/php");
							$elmTextareas['clip'].setTheme("ace/theme/xcode");
							$elmTextareas['clip'].getSession().setMode("ace/mode/json");
							switch(editorOption.editorMode){
								case 'twig':
									$elmTextareas['html'].setTheme("ace/theme/monokai");
									$elmTextareas['html'].getSession().setMode("ace/mode/twig");
									$canvas.find('.pickles2-contents-editor__module-editor-default-switch-tab [data-pickles2-contents-editor-switch=html]').text('Twig');
									break;
								case 'html':
								default:
									$elmTextareas['html'].setTheme("ace/theme/monokai");
									$elmTextareas['html'].getSession().setMode("ace/mode/php");
									break;
							}

						}else{
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-info').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-html').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-css').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-js').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-finalize').append('<textarea>');
							$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-clip').append('<textarea>');

							$elmTextareas = {};
							$elmTextareas['info'] = $canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-info textarea');
							$elmTextareas['html'] = $canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-html textarea');
							$elmTextareas['css'] = $canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-css textarea');
							$elmTextareas['js'] = $canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-js textarea');
							$elmTextareas['finalize'] = $canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-finalize textarea');
							$elmTextareas['clip'] = $canvas.find('.pickles2-contents-editor__module-editor-default-editor-body-clip textarea');

							$elmTextareas['info'].val(codes['info.json']);
							$elmTextareas['html'].val(
								editorOption.editorMode == 'twig'
									? codes['template.html.twig']
									: codes['template.html']
							);
							$elmTextareas['css'].val(codes['module.css.scss']);
							$elmTextareas['js'].val(codes['module.js']);
							$elmTextareas['finalize'].val(codes['finalize.php']);
							$elmTextareas['clip'].val(codes['clip.json']);

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

		$canvas.find('.pickles2-contents-editor__module-editor-default-editor-body').css({
			'height': $elmEditor.outerHeight() - $canvas.find('.pickles2-contents-editor__module-editor-default-switch-tab').outerHeight() - 2
		});

		callback();
		return;
	}

	/**
	 * 編集したコンテンツを保存する
	 */
	function saveModuleSrc(callback){
		var codes = {};
		var templateFilename = 'template.html';
		if( editorMode == 'twig' ){
			templateFilename = 'template.html.twig';
		}

		if( editorLib == 'ace' ){
			codes[templateFilename] = $elmTextareas['html'].getValue();
			codes = {
				...codes,
				'module.css.scss': $elmTextareas['css'].getValue(),
				'module.js': $elmTextareas['js'].getValue(),
			};
		}else{
			codes[templateFilename] = $elmTextareas['html'].val();
			codes = {
				...codes,
				'module.css.scss': $elmTextareas['css'].val(),
				'module.js': $elmTextareas['js'].val(),
			};
		}

		px2ce.gpiBridge(
			{
				'api': 'saveModuleSrc',
				'module_id': module_id,
				'codes': codes,
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
