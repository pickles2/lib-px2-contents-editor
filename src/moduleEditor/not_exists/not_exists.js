/**
 * not_exists.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var it79 = require('iterate79');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	this.init = function( editorOption, callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it){
				$canvas.html((function(){

					var fin = ''
						+ '<div class="container">'
							+ '<div class="pickles2-contents-editor__module-editor-notExists">'
								+ '<div class="px2-text-align-center">'
									+ '<div><p>Module is not exists.</p></div>'
								+ '</div>'
								+ '<div class="px2-text-align-center">'
									+ '<div><p><button class="pickles2-contents-editor__btn-cancel px2-btn px2-btn--default px2-btn--sm" type="button">'+px2ce.lb.get('ui_label.cancel')+'</button></p></div>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
					;

					return fin;
				})());

				$canvas.find('form').submit(function(){
					var editor_mode = $(this).find('input[name=editor-mode]:checked').val();
					if( !editor_mode ){
						alert('ERROR: editor-mode is not selected.');
						return false;
					}

					px2ce.gpiBridge(
						{
							'api': 'initContentFiles',
							'page_path': page_path,
							'editor_mode': editor_mode
						},
						function(result){
							window.location.reload();
						}
					);

					return false;
				});

				// キャンセルボタン
				$canvas.find('.pickles2-contents-editor__btn-cancel')
					.on('click', function(){
						px2ce.finish();
					})
				;

				it.next();
			},
			function(){
				callback();
			},
		]);

	}

	/**
	 * 画面を再描画する
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		callback();
		return;
	}

	/**
	 * 位置合わせ
	 */
	this.adjust = this.redraw;

}
