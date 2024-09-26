/**
 * not_permitted.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var it79 = require('iterate79');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;
	const KeenSlider = require('keen-slider').default;

	this.init = function( editorOption, callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it){
				$canvas.html((function(){

					var fin = ''
						+ '<div class="container">'
							+ '<div class="pickles2-contents-editor__notPermitted">'
								+ '<div class="px2-p">'
									+ '<p>Not Permitted.</p>'
								+ '</div>'
								+ '<div class="px2-text-align-center">'
									+ '<div><p><button class="pickles2-contents-editor__btn-cancel px2-btn px2-btn--default px2-btn--sm" type="button">'+px2ce.lb.get('ui_label.cancel')+'</button></p></div>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
					;

					return fin;
				})());

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
