/**
 * not_exists.js
 */
module.exports = function(px2ce, callback){
	callback = callback || function(){};
	var $ = require('jquery');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	$canvas.html((function(){
		var fin = ''
				+ '<div class="container">'
				+ '<div class="pickles2-contents-editor--notExists">'
				+ 	'<form action="javascript:;" method="get">'
				+ 	'<p>コンテンツファイルが存在しません。</p>'
				+ 	'<p>次の中からコンテンツの種類を選択し、作成してください。</p>'
				+ 	'<ul>'
				+ 	'<li><label><input type="radio" name="proc_type" value="html.gui" checked="checked" /> HTML + GUI Editor (<%= basename %> + data files)</label></li>'
				+ 	'<li><label><input type="radio" name="proc_type" value="html" /> HTML (<%= basename %>)</label></li>'
				+ 	'<li><label><input type="radio" name="proc_type" value="md" /> Markdown (<%= basename %>.md)</label></li>'
				+ 	'</ul>'
				+ 	'<div class="row">'
				+ 	'<div class="col-sm-8 col-sm-offset-2"><button class="btn btn-primary btn-block">コンテンツファイルを作成する</button></div>'
				+ 	'</div>'
				+ 	'</form>'
				+ '</div>'
				+ '</div>';
		return fin;
	})());

	$canvas.find('form').submit(function(){
		var procType = $(this).find('input[name=proc_type]:checked').val();
		console.log( procType );
		return false;
	});

}
