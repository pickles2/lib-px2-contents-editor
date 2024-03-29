/**
 * toolbar.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var $toolbar;
	var $btns;
	var options;

	this.init = function(_options, callback){
		callback = callback||function(){};
		options = _options;
		options.onFinish = options.onFinish || function(){};
		options.btns = options.btns || [];

		var code = ''
			+'<div class="pickles2-contents-editor--toolbar">'
				+'<div class="pickles2-contents-editor--toolbar-btns">'
				+'</div>'
				+'<div class="pickles2-contents-editor--toolbar-finish">'
					+'<button class="px2-btn px2-btn--primary px2-btn--sm pickles2-contents-editor--toolbar-btn-finish">'+px2ce.lb.get('ui_label.done')+'</button>'
				+'</div>'
			+'</div>'
		;
		$toolbar = $(code);
		$canvas.append($toolbar);

		$btns = $('.pickles2-contents-editor--toolbar-btns');
		for( var idx in options.btns ){
			this.addButton(options.btns[idx]);
		}

		// 完了イベント発火
		$canvas.find('.pickles2-contents-editor--toolbar-btn-finish').on('click', function(){
			options.onFinish();
		});

		callback();
	}

	/**
	 * ボタンを追加する
	 */
	this.addButton = function(btn){
		btn = btn || {};
		if( btn.type == 'element' ){
			$btns.append( $(btn.elm) );
		}else{
			var $btn = $('<button class="px2-btn px2-btn--sm">');
			$btns.append( $btn
				.text( btn.label )
				.on('click', btn.click )
			);
			if( typeof(btn.cssClass) == typeof('') ){
				$btn.addClass(btn.cssClass);
			}else if( btn.cssClass ){
				for( var idx in btn.cssClass ){
					$btn.addClass(btn.cssClass[idx]);
				}
			}
		}
		return;
	}

	/**
	 * ボタンを初期化する
	 */
	this.clearButtons = function(btn){
		$btns.html('');
		return;
	}

	/**
	 * ツールバー要素を取得する
	 */
	this.getElm = function(){
		return $toolbar;
	}

}
