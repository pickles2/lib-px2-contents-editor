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
	var options;

	this.init = function(_options, callback){
		callback = callback||function(){};
		options = _options;
		options.onSave = options.onSave || function(){}
		options.onPreview = options.onPreview || function(){}
		options.onClose = options.onClose || function(){}

		var code = ''
			+'<div class="pickles2-contents-editor--toolbar">'
				+'<div class="pickles2-contents-editor--toolbar-btns">'
					+'<div class="btn-group" role="group">'
						+'<div class="btn-group" role="group">'
							+'<button class="btn btn-primary pickles2-contents-editor--toolbar-btn-finish"><span class="glyphicon glyphicon-floppy-save"></span> 完了</button>'
						+'</div>'
					+'</div>'
				+'</div>'
			+'</div>'
		;
		$toolbar = $(code);
		$canvas.append($toolbar);

		// 完了イベント発火
		$canvas.find('.pickles2-contents-editor--toolbar-btn-finish').click(function(){
			options.onFinish();
		});

		callback();
	}

	this.getElm = function(){
		return $toolbar;
	}

}
