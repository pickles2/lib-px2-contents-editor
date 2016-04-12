/**
 * toolbar.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var ejs = require('ejs');

	var $toolbar;

	this.init = function(callback){
		callback = callback||function(){};

		var code = ''
			+'<div class="pickles2-contents-editor--toolbar">'
				+'<div class="pickles2-contents-editor--toolbar-btns">'
					+'<div class="btn-group btn-group-justified" role="group">'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-default pickles2-contents-editor--toolbar-btn-save-and-preview-in-browser">ブラウザでプレビュー</button>'
						+'</div>'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-primary pickles2-contents-editor--toolbar-btn-save"><span class="glyphicon glyphicon-floppy-save"></span> 保存する</button>'
						+'</div>'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-default pickles2-contents-editor--toolbar-btn-close">閉じる</button>'
						+'</div>'
					+'</div>'
				+'</div>'
			+'</div>'
		;
		$toolbar = $(code);
		$canvas.append($toolbar);

		callback();
	}

	this.getElm = function(){
		return $toolbar;
	}

}
