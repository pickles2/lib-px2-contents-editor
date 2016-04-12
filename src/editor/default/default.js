/**
 * default/default.js
 */
module.exports = function(px2ce, callback){
	callback = callback || function(){};
	var $ = require('jquery');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	$canvas.html((function(){
		var fin = ''
			+'<div class="pickles2-contents-editor--default">'
				+'<div class="pickles2-contents-editor--default-editor">'
					+'<div class="pickles2-contents-editor--default-switch-tab">'
						+'<div class="btn-group btn-group-justified" role="group">'
							+'<div class="btn-group" role="group">'
								+'<button class="btn btn-default btn-xs" data-pickles2-contents-editor-switch="html">HTML</button>'
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
				+'<div class="pickles2-contents-editor--default-btns">'

					+'<div class="btn-group btn-group-justified" role="group">'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-default pickles2-contents-editor--default-btn-save-and-preview-in-browser">ブラウザでプレビュー</button>'
						+'</div>'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-default pickles2-contents-editor--default-btn-resources">リソース</button>'
						+'</div>'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-primary pickles2-contents-editor--default-btn-save">保存する</button>'
						+'</div>'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-default pickles2-contents-editor--default-btn-close">閉じる</button>'
						+'</div>'
					+'</div>'

				+'</div>'
			+'</div>'
		;
		return fin;
	})());

	$canvas.find('.pickles2-contents-editor--default-editor-body-css').hide();
	$canvas.find('.pickles2-contents-editor--default-editor-body-js').hide();

	var $elmCanvas = $canvas.find('.pickles2-contents-editor--default-canvas');
	var $elmEditor = $canvas.find('.pickles2-contents-editor--default-editor');
	var $elmBtns = $canvas.find('.pickles2-contents-editor--default-btns');
	var $elmTextareas = {};
	$elmTextareas['html'] = $canvas.find('.pickles2-contents-editor--default-editor-body-html textarea');
	$elmTextareas['css'] = $canvas.find('.pickles2-contents-editor--default-editor-body-css textarea');
	$elmTextareas['js'] = $canvas.find('.pickles2-contents-editor--default-editor-body-js textarea');

	var $elmTabs = $canvas.find('.pickles2-contents-editor--default-switch-tab [data-pickles2-contents-editor-switch]');
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


	/**
	 * window.resize イベントハンドラ
	 */
	function windowResized( callback ){
		callback = callback || function(){};

		$canvas.css({
			'position': 'relative'
		});
		$elmCanvas.css({
			'position': 'absolute',
			'overflow': 'hidden',
			'top': 0,
			'left': 0,
			'width': '60%',
			'height': $canvas.innerHeight()
		});
		$elmBtns.css({
			'position': 'absolute',
			'bottom': 0,
			'right': 0,
			'width': '40%',
		});
		$elmEditor.css({
			'position': 'absolute',
			'top': 0,
			'right': 0,
			'width': '40%',
			'height': $canvas.innerHeight() - $elmBtns.outerHeight()
		});

		$canvas.find('.pickles2-contents-editor--default-editor-body').css({
			'height': $elmEditor.outerHeight() - $canvas.find('.pickles2-contents-editor--default-switch-tab').outerHeight()
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

	windowResized(function(){

		px2ce.gpiBridge(
			{
				'api': 'getProjectConf'
			},
			function(px2conf){
				// console.log(px2conf);

				$elmCanvas.attr({
					"data-pickles2-contents-editor-preview-url": px2ce.preview.origin + page_path
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

						$('.pickles2-contents-editor--default-btn-save-and-preview-in-browser');
						$('.pickles2-contents-editor--default-btn-resources');
						$('.pickles2-contents-editor--default-btn-save')
							.click(function(){
								saveContentsSrc(
									{
										'html': $elmTextareas['html'].val(),
										'css':  $elmTextareas['css'].val(),
										'js':   $elmTextareas['js'].val()
									},
									function(result){
										console.log(result);
										if(!result.result){
											alert(result.message);
										}
										updatePreview();
									}
								);
							})
						;
						$('.pickles2-contents-editor--default-btn-close');

						updatePreview();

						callback();
					}
				);
			}
		);

	});

}
