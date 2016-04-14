/**
 * Pickles2ContentsEditor
 */
(function(){
	var __dirname = (function(){ var rtn = (function() { if (document.currentScript) {return document.currentScript.src;} else { var scripts = document.getElementsByTagName('script'), script = scripts[scripts.length-1]; if (script.src) {return script.src;} } })(); rtn = rtn.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''); return rtn; })();

	// bootstrap をロード
	document.write('<link rel="stylesheet" href="'+__dirname+'/libs/bootstrap/dist/css/bootstrap.css" />');
	document.write('<script src="'+__dirname+'/libs/bootstrap/dist/js/bootstrap.js"></script>');

	// broccoli-html-editor をロード
	document.write('<link rel="stylesheet" href="'+__dirname+'/libs/broccoli-html-editor/client/dist/broccoli.css" />');
	document.write('<script src="'+__dirname+'/libs/broccoli-html-editor/client/dist/broccoli.js"></script>');
	document.write('<script src="'+__dirname+'/libs/broccoli-field-table/dist/broccoli-field-table.js"></script>');

})();
window.Pickles2ContentsEditor = function(){
	var $ = require('jquery');
	var $canvas;
	var _this = this;
	var __dirname = (function(){ var rtn = (function() { if (document.currentScript) {return document.currentScript.src;} else { var scripts = document.getElementsByTagName('script'), script = scripts[scripts.length-1]; if (script.src) {return script.src;} } })(); rtn = rtn.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''); return rtn; })();
	this.gpiBridge;
	this.page_path;

	var editor;

	this.init = function(options, callback){
		callback = callback || function(){};
		var _this = this;
		// console.log(options);
		this.gpiBridge = options.gpiBridge || function(){ alert('gpiBridge required.'); };
		this.page_path = options.page_path;
		this.preview = options.preview || {};

		$canvas = $(options.elmCanvas);
		$canvas.addClass('pickles2-contents-editor');

		this.gpiBridge(
			{
				'page_path':_this.page_path,
				'api':'checkEditorType'
			},
			function(editorType){
				// console.log(editorType);
				switch(editorType){
					case '.page_not_exists':
						// ページ自体が存在しない。
						$canvas.html('<p>ページが存在しません。</p>');
						callback();
						break;

					case '.not_exists':
						// コンテンツが存在しない
						$canvas.html('<p>コンテンツが存在しません。</p>');
						var notExists = require('./editor/not_exists/not_exists.js');
						notExists(_this, function(){
							_this.init(options, callback);
						});
						break;

					case 'html.gui':
						// broccoli
						$canvas.html('<p>GUIエディタを起動します。</p>');
						editor = new (require('./editor/broccoli/broccoli.js'))(_this);
						editor.init(function(){
							callback();
						});
						break;

					case 'html':
					case 'md':
					default:
						// defaultテキストエディタ
						$canvas.html('<p>テキストエディタを起動します。</p>');
						editor = new (require('./editor/default/default.js'))(_this);
						editor.init(function(){
							callback();
						});
						break;
				}
			}
		);
	}

	/**
	 * canvas要素を取得する
	 */
	this.getElmCanvas = function(){
		return $canvas;
	}

	/**
	 * 再描画
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		if(editor){
			editor.redraw(function(){
				callback();
			});
			return;
		}else{
			callback();
		}
		return;
	}

}
