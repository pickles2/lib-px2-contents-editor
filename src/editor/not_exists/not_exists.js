/**
 * not_exists.js
 */
module.exports = function(px2ce){
	var $ = require('jquery');
	var it79 = require('iterate79');
	var utils79 = require('utils79');
	var $canvas = $(px2ce.getElmCanvas());
	var page_path = px2ce.page_path;

	this.init = function( editorOption, callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it){
				var current_page_info = px2ce.getBootupInfomations().current_page_info;
				var contentsTemplates = px2ce.getBootupInfomations().contentsTemplates;

				var hasThumb = contentsTemplates.list.some(row => !!row.thumb);

				$canvas.html((function(){

					var fin = ''
						+ '<div class="container">'
							+ '<div class="pickles2-contents-editor__notExists'+(hasThumb ? ' pickles2-contents-editor__notExists--has-thumb' : '')+'">'
								+ '<form action="javascript:;" method="get">'
									+ $('<p class="pickles2-contents-editor__notExists__title">').text(current_page_info ? current_page_info.title : page_path).prop("outerHTML")
									+ (current_page_info ? `<p>${px2ce.lb.get('page.not_exists.the_content_file_has_not_been_created')}</p>` : `<p>${px2ce.lb.get('page.not_exists.this_path_does_not_define_a_page_but_it_allows_you_to_start_creating_content_ahead_of_time')}</p>`)
									+ `<p>${px2ce.lb.get('page.not_exists.please_select_one_of_the_following_content_types_and_create_it')}</p>`
									+ '<div class="pickles2-contents-editor__notExists__list">'
										+ '<ul>'
											+ ((function(){
												var rtn = '';
												contentsTemplates.list.forEach(function(row, index){
													rtn += '<li>';
													rtn += '<label>';
													rtn += '<input type="radio" name="editor-mode" value="'+($('<p>').text(row.id).html())+'" '+(contentsTemplates.default == row.id ? 'checked="checked"' : '')+' /> ';
													if( hasThumb ){
														rtn += '<div class="pickles2-contents-editor__notExists__cassette">';
														if( row.thumb ){
															rtn += '<div class="pickles2-contents-editor__notExists__thumb">';
															rtn += '<div class="pickles2-contents-editor__notExists__thumb-inner"><img src="'+row.thumb+'" alt="" /></div>';
															rtn += '</div>';
														}else{
															rtn += '<div class="pickles2-contents-editor__notExists__thumb pickles2-contents-editor__notExists__thumb--no-image">';
															rtn += (function(){
																switch(row.type){
																	case "html.gui": return 'Block Editor';
																	case "html": return 'HTML';
																	case "md": return 'Markdown';
																}
																return row.type;
															})();
															rtn += '</div>';
														}
														rtn += '<div class="pickles2-contents-editor__notExists__name">' + ($('<p>').text(row.name).html()) + '</div>';
														rtn += '</div>';
													}else{
														rtn += ($('<p>').text(row.name).html());
													}
													rtn += '</label>';
													rtn += '</li>';
												});
												return rtn;
											})())
										+ '</ul>'
									+ '</div>'
									+ '<div class="px2-text-align-center">'
										+ '<div><p><button class="px2-btn px2-btn--primary px2-btn--block px2-btn--lg" type="submit">'+px2ce.lb.get('ui_label.create_new_contents')+'</button></p></div>'
									+ '</div>'
								+ '</form>'
								+ '<div class="px2-text-align-center">'
									+ '<div><p><button class="pickles2-contents-editor__btn-cancel px2-btn px2-btn--default px2-btn--sm" type="button">'+px2ce.lb.get('ui_label.cancel')+'</button></p></div>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
					;

					return fin;
				})());

				$canvas.find('form').submit(function(){
					var editor_mode = $(this).find('input[name=editor-mode]:checked').val();
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

				it.next();
			},
			function(){
				callback();
			},
		]);

	}

	/**
	 * 画面を再描画する
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		callback();
		return;
	}

	/**
	 * 位置合わせ
	 */
	this.adjust = this.redraw;

}
