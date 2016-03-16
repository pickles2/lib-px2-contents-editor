window.Pickles2ContentsEditor = function(){
	var $ = require('jquery');
	var $canvas;
	var _this = this;
	this.gpiBridge;
	this.page_path;

	this.init = function(options, callback){
		// console.log(options);
		this.gpiBridge = options.gpiBridge || function(){ alert('gpiBridge required.'); };
		callback = callback || function(){};
		this.page_path = options.page_path;

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
						callback();
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
}
