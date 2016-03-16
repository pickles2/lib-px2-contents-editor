window.Pickles2ContentsEditor = function(){
	var $ = require('jquery');
	var gpiBridge;
	var $canvas;

	this.init = function(options, callback){
		gpiBridge = options.gpiBridge || function(){ alert('gpiBridge required.'); };
		callback = callback || function(){};

		$canvas = $(options.elmCanvas);
		$canvas.addClass('pickles2-contents-editor');

		gpiBridge(
			'checkEditorType',
			{},
			function(editorType){
				// console.log(editorType);
				switch(editorType){
					case '.page_not_exists':
						// ページ自体が存在しない。
						$canvas.html('<p>ページが存在しません。</p>');
						break;
					case '.not_exists':
						// コンテンツが存在しない
						$canvas.html('<p>コンテンツが存在しません。</p>');
						break;
					case 'html.gui':
						// broccoli
						$canvas.html('<p>GUIエディタを起動します。</p>');
						break;
					case 'html':
					case 'md':
					default:
						// defaultテキストエディタ
						$canvas.html('<p>テキストエディタを起動します。</p>');
						break;
				}
				callback();
			}
		);
	}

}
