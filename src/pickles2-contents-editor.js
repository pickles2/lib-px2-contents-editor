/**
 * Pickles2ContentsEditor
 */
(function(){
	// broccoli-html-editor をロード
	var __dirname = (function(){ var rtn = (function() { if (document.currentScript) {return document.currentScript.src;} else { var scripts = document.getElementsByTagName('script'), script = scripts[scripts.length-1]; if (script.src) {return script.src;} } })(); rtn = rtn.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''); return rtn; })();
	document.write('<link rel="stylesheet" href="'+__dirname+'/libs/broccoli-html-editor/client/dist/broccoli.css" />');
	document.write('<script src="'+__dirname+'/libs/broccoli-html-editor/client/dist/broccoli.js"></script>');
})();
window.Pickles2ContentsEditor = function(){
	var $ = require('jquery');
	var $canvas;
	var _this = this;
	var __dirname = (function(){ var rtn = (function() { if (document.currentScript) {return document.currentScript.src;} else { var scripts = document.getElementsByTagName('script'), script = scripts[scripts.length-1]; if (script.src) {return script.src;} } })(); rtn = rtn.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''); return rtn; })();
	this.gpiBridge;
	this.page_path;


	this.init = function(options, callback){
		callback = callback || function(){};
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
						var notExists = require('./not_exists.js');
						notExists(_this, function(){
							callback();
						});
						break;

					case 'html.gui':
						// broccoli
						$canvas.html('<p>GUIエディタを起動します。</p>');
						var editorBroccoli = require('./editor/broccoli/broccoli.js');
						editorBroccoli(_this, function(){
							callback();
						});
						break;

					case 'html':
					case 'md':
					default:
						// defaultテキストエディタ
						$canvas.html('<p>テキストエディタを起動します。</p>');
						callback();
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
		callback();
		return;
	}

}
