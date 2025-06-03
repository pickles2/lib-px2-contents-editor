/**
 * clip/clip.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	const Twig = require('twig');
	var jsonEditor = new (require('../includes/JsonEditor/JsonEditor.js'))(px2ce);
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

	let codeInfoJson = '';

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
					toolbar.addButton({
						"label": "info.json",
						"click": async function(){
							codeInfoJson = await jsonEditor.edit(codeInfoJson, {
								title: 'info.json',
							});
						}
					});
					it1.next(arg);
				});
			},
			function(it1, arg){
				// --------------------------------------
				// 画面のフレームを構成する
				$canvas.append((function(){
					var fin = ''
							+'<div class="pickles2-contents-editor__module-editor-clip">'
								+'<div class="pickles2-contents-editor__module-editor-clip-editor">'
									+'<div class="pickles2-contents-editor__module-editor-clip-switch-tab">'
										+'<div class="px2-input-group px2-input-group--fluid" role="group">'
											+'<button class="px2-btn px2-btn--sm" data-pickles2-contents-editor-switch="clip">clip</button>'
										+'</div>'
									+'</div>'
									+'<div class="pickles2-contents-editor__module-editor-clip-editor-body">'
										+'<div class="pickles2-contents-editor__module-editor-clip-editor-body-clip"></div>'
									+'</div>'
								+'</div>'
							+'</div>'
					;
					return fin;
				})());

				$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-clip').hide();

				$elmEditor = $canvas.find('.pickles2-contents-editor__module-editor-clip-editor');
				$elmBtns = $canvas.find('.pickles2-contents-editor__module-editor-clip-btns');

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

				$elmTabs = $canvas.find('.pickles2-contents-editor__module-editor-clip-switch-tab [data-pickles2-contents-editor-switch]');
				$elmTabs
					.on('click', function(){
						var $this = $(this);
						$elmTabs.removeClass('px2-btn--toggle-on');
						$this.addClass('px2-btn--toggle-on');
						var tabFor = $this.attr('data-pickles2-contents-editor-switch');
						$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-clip').hide();
						$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-'+tabFor).show();
					})
				;

				// デフォルトのタブを選択
				$canvas.find('.pickles2-contents-editor__module-editor-clip-switch-tab [data-pickles2-contents-editor-switch="clip"]').trigger('click');

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
						codeInfoJson = codes['info.json'] || '{}';

						if( editorLib == 'ace' ){
							$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-clip').append('<div>');

							var aceCss = {
								'position': 'relative',
								'width': '100%',
								'height': '100%'
							};
							$elmTextareas = {};
							$elmTextareas['clip'] = ace.edit(
								$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-clip div').text(codes['clip.json']).css(aceCss).get(0)
							);
							for(var i in $elmTextareas){
								$elmTextareas[i].setFontSize(16);
								$elmTextareas[i].getSession().setUseWrapMode(useWrapMode);// Ace 自然改行
								$elmTextareas[i].setShowInvisibles(true);// Ace 不可視文字の可視化
								$elmTextareas[i].$blockScrolling = Infinity;
								$elmTextareas[i].setTheme("ace/theme/github");
								$elmTextareas[i].getSession().setMode("ace/mode/html");
							}
							$elmTextareas['clip'].setTheme("ace/theme/xcode");
							$elmTextareas['clip'].getSession().setMode("ace/mode/json");

						}else{
							$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-clip').append('<textarea>');

							$elmTextareas = {};
							$elmTextareas['clip'] = $canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body-clip textarea');

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

		$canvas.find('.pickles2-contents-editor__module-editor-clip-editor-body').css({
			'height': $elmEditor.outerHeight() - $canvas.find('.pickles2-contents-editor__module-editor-clip-switch-tab').outerHeight() - 2
		});

		callback();
		return;
	}

	/**
	 * 編集したコンテンツを保存する
	 */
	function saveModuleSrc(callback){
		var codes = {};

		codes['info.json'] = codeInfoJson;
		if( editorLib == 'ace' ){
			codes['clip.json'] = $elmTextareas['clip'].getValue();
		}else{
			codes['clip.json'] = $elmTextareas['clip'].val();
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
