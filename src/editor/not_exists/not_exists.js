/**
 * not_exists.js
 */
module.exports = function(px2ce, callback){
	callback = callback || function(){};
	var $ = require('jquery');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	var ejs = require('ejs');

	$canvas.html((function(){

		var fin = ''
			+ '<div class="container">'
				+ '<div class="pickles2-contents-editor--notExists">'
					+ '<form action="javascript:;" method="get">'
						+ '<p>コンテンツファイルが存在しません。</p>'
						+ '<p>次の中からコンテンツの種類を選択し、作成してください。</p>'
						+ '<ul>'
							+ '<li><label><input type="radio" name="editor-type" value="html.gui" checked="checked" /> HTML + GUI Editor (<%= basename %> + data files)</label></li>'
							+ '<li><label><input type="radio" name="editor-type" value="html" /> HTML (<%= basename %>)</label></li>'
							+ '<li><label><input type="radio" name="editor-type" value="md" /> Markdown (<%= basename %>.md)</label></li>'
						+ '</ul>'
						+ '<div class="row">'
							+ '<div class="col-sm-8 col-sm-offset-2"><button class="btn btn-primary btn-block">コンテンツファイルを作成する</button></div>'
						+ '</div>'
					+ '</form>'
				+ '</div>'
			+ '</div>'
		;

		// Just one template
		fin = ejs.render(fin, {'basename': utils79.basename(page_path)}, {delimiter: '%'});

		return fin;
	})());

	$canvas.find('form').submit(function(){
		var editor_type = $(this).find('input[name=editor-type]:checked').val();
		// console.log( editor_type );
		if( !editor_type ){
			alert('ERROR: editor-type is not selected.');
			return false;
		}

		px2ce.gpiBridge(
			{
				'api': 'initContentFiles',
				'page_path': page_path,
				'editor_type': editor_type
			},
			function(result){
				console.log(result);
				callback(result);
			}
		);

		return false;
	});

}
