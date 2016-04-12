/**
 * default/default.js
 */
module.exports = function(px2ce, callback){
	callback = callback || function(){};
	var $ = require('jquery');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var $textareas = {};

	$canvas.html((function(){
		var fin = ''
			+'<div class="pickles2-contents-editor--default">'
				+'<div class="pickles2-contents-editor--default-editor">'
					+'<div class="switch_tab">'
						+'<ul>'
							+'<li><button data-pickles2-contents-editor-switch="html">HTML</button></li>'
							+'<li><button data-pickles2-contents-editor-switch="css">CSS (SCSS)</button></li>'
							+'<li><button data-pickles2-contents-editor-switch="js">JavaScript</button></li>'
						+'</ul>'
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
					+'<ul>'
						+'<li><button class="btn btn-default pickles2-contents-editor--default-btn-save-and-preview-in-browser">ブラウザでプレビュー</button></li>'
						+'<li><button class="btn btn-default pickles2-contents-editor--default-btn-resources">リソース</button></li>'
						+'<li><button class="btn btn-primary pickles2-contents-editor--default-btn-save">保存する<small>(Cmd-S)</small></button></li>'
						+'<li><button class="btn btn-default pickles2-contents-editor--default-btn-close">閉じる</button></li>'
					+'</ul>'
				+'</div>'
			+'</div>'
		;
		return fin;
	})());

	var $elmCanvas = $canvas.find('.pickles2-contents-editor--default-canvas');
	var $elmEditor = $canvas.find('.pickles2-contents-editor--default-editor');

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
			'top': 0,
			'left': '20%',
			'width': '60%',
			'height': $canvas.height()
		});
		$elmEditor.css({
			'position': 'absolute',
			'top': 0,
			'right': 0,
			'width': '20%',
			'height': $canvas.height()
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
			.css({
				'border': 'none'
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

		$textareas['html'] = $canvas.find('.pickles2-contents-editor--default-editor-body-html textarea');
		$textareas['css'] = $canvas.find('.pickles2-contents-editor--default-editor-body-css textarea');
		$textareas['js'] = $canvas.find('.pickles2-contents-editor--default-editor-body-js textarea');

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
						$textareas['html'].val(codes['html']);
						$textareas['css'] .val(codes['css']);
						$textareas['js']  .val(codes['js']);

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
										'html': $textareas['html'].val(),
										'css':  $textareas['css'].val(),
										'js':   $textareas['js'].val()
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
