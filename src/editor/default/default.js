/**
 * default/default.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var toolbar = new (require('../../toolbar.js'))(px2ce);

	var $elmCanvas,
		$elmEditor,
		// $elmBtns,
		$elmTextareas,
		$elmTabs;

	/**
	 * 初期化
	 */
	this.init = function(callback){
		callback = callback || function(){};

		toolbar.init({
			"btns":[
				{
					"label": "preview",
					"click": function(){
						px2ce.openUrlInBrowser( px2ce.options.preview.origin + page_path );
					}
				},
				{
					"label": "resource",
					"click": function(){
						px2ce.openResourceDir( px2ce.options.preview.origin + page_path );
					}
				},
				{
					"label": "save",
					"click": function(){
						saveContentsSrc(
							function(result){
								console.log(result);
								if(!result.result){
									alert(result.message);
								}
								updatePreview();
							}
						);
					}
				}
			],
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
									+'<div class="pickles2-contents-editor--default-editor-body-html"><textarea></textarea></div>'
									+'<div class="pickles2-contents-editor--default-editor-body-css"><textarea></textarea></div>'
									+'<div class="pickles2-contents-editor--default-editor-body-js"><textarea></textarea></div>'
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
			$elmTextareas = {};
			$elmTextareas['html'] = $canvas.find('.pickles2-contents-editor--default-editor-body-html textarea');
			$elmTextareas['css'] = $canvas.find('.pickles2-contents-editor--default-editor-body-css textarea');
			$elmTextareas['js'] = $canvas.find('.pickles2-contents-editor--default-editor-body-js textarea');

			$elmTabs = $canvas.find('.pickles2-contents-editor--default-switch-tab [data-pickles2-contents-editor-switch]');
			$elmTabs
				.click(function(){
					var $this = $(this);
					$elmTabs.removeAttr('disabled');
					$this.attr({'disabled': 'disabled'});
					var tabFor = $this.attr('data-pickles2-contents-editor-switch');
					// console.log(tabFor);
					$canvas.find('.pickles2-contents-editor--default-editor-body-html').hide();
					$canvas.find('.pickles2-contents-editor--default-editor-body-css').hide();
					$canvas.find('.pickles2-contents-editor--default-editor-body-js').hide();
					$canvas.find('.pickles2-contents-editor--default-editor-body-'+tabFor).show();
				})
			;

			windowResized(function(){

				px2ce.gpiBridge(
					{
						'api': 'getProjectConf'
					},
					function(px2conf){
						// console.log(px2conf);

						$elmCanvas.attr({
							"data-pickles2-contents-editor-preview-url": px2ce.options.preview.origin + page_path
						});

						px2ce.gpiBridge(
							{
								'api': 'getContentsSrc',
								'page_path': page_path
							},
							function(codes){
								// console.log(codes);
								$elmTextareas['html'].val(codes['html']);
								$elmTextareas['css'] .val(codes['css']);
								$elmTextareas['js']  .val(codes['js']);

								px2ce.redraw = function(callback){
									callback = callback || function(){};
									windowResized(function(){
										// broccoli.redraw();
									});
									return;
								}
								windowResized(function(){
									// broccoli.redraw();
								});

								updatePreview();

								callback();
							}
						);
					}
				);

			});

		});


	};




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
			'overflow': 'hidden',
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
		var $iframe = $('<iframe>');
		$elmCanvas.html('').append($iframe);
		$iframe
			.attr({
				'src': previewUrl
			})
		;
	}

	/**
	 * 編集したコンテンツを保存する
	 */
	function saveContentsSrc(callback){
		var codes = {
			'html': $elmTextareas['html'].val(),
			'css':  $elmTextareas['css'].val(),
			'js':   $elmTextareas['js'].val()
		};
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


}
