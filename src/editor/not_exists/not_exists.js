/**
 * not_exists.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var ejs = require('ejs');

	this.init = function( editorOption, callback ){
		callback = callback || function(){};

		$canvas.html((function(){

			var fin = ''
				+ '<div class="container">'
					+ '<div class="pickles2-contents-editor--notExists">'
						+ '<form action="javascript:;" method="get">'
							+ '<p>コンテンツファイルが存在しません。</p>'
							+ '<p>次の中からコンテンツの種類を選択し、作成してください。</p>'
							+ '<ul>'
								+ '<li><label><input type="radio" name="editor-mode" value="html.gui" checked="checked" /> HTML + GUI Editor (<%= basename %> + data files)</label></li>'
								+ '<li><label><input type="radio" name="editor-mode" value="html" /> HTML (<%= basename %>)</label></li>'
								+ '<li><label><input type="radio" name="editor-mode" value="md" /> Markdown (<%= basename %>.md)</label></li>'
							+ '</ul>'
							+ '<div class="row">'
								+ '<div class="col-sm-8 col-sm-offset-2"><p><button class="px2-btn px2-btn--primary px2-btn--block px2-btn--lg" type="submit">コンテンツファイルを作成する</button></p></div>'
							+ '</div>'
						+ '</form>'
						+ '<div class="row">'
							+ '<div class="col-sm-6 col-sm-offset-3"><p><button class="pickles2-contents-editor__btn-cancel px2-btn px2-btn--default px2-btn--block" type="button">キャンセル</button></p></div>'
						+ '</div>'
					+ '</div>'
				+ '</div>'
			;

			// Just one template
			fin = ejs.render(fin, {'basename': utils79.basename(page_path)}, {delimiter: '%'});

			return fin;
		})());

		$canvas.find('form').submit(function(){
			var editor_mode = $(this).find('input[name=editor-mode]:checked').val();
			// console.log( editor_mode );
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
					console.log(result);
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

		callback();
	}

	/**
	 * 画面を再描画する
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		callback();
		return;
	}

}
