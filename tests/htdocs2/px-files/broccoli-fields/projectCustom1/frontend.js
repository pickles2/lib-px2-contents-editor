console.log('project custom field 1 - frontend.js');
window.broccoliFieldProjectCustom1 = function(broccoli){


	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data, elm, callback ){
		var _this = this;
		if(typeof(data) !== typeof({})){ data = {'src':''+data,'editor':'markdown'}; }
		var rows = 12;
		if( mod.rows ){
			rows = mod.rows;
		}

		var $rtn = $('<div>'),
			$formElm
		;

		if( rows == 1 ){
			$formElm = $('<input type="text" class="form-control">')
				.attr({
					"name": mod.name
				})
				.val(data.src)
				.css({'width':'100%'})
			;
			$rtn.append( $formElm );

		}else{
			$formElm = $('<textarea class="form-control">')
				.attr({
					"name": mod.name,
					"rows": rows
				})
				.css({
					'width':'100%',
					'height':'auto'
				})
				.val(data.src)
			;
			$rtn.append( $formElm );

		}

		$rtn
			.append( $('<p>')
				.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+mod.name+'" value="" /> HTML</label></span>'))
				.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+mod.name+'" value="text" /> テキスト</label></span>'))
				.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+mod.name+'" value="markdown" /> Markdown</label></span>'))
			)
		;
		$rtn.find('input[type=radio][name=editor-'+mod.name+'][value="'+data.editor+'"]').attr({'checked':'checked'});

		$(elm).html($rtn);

		callback();
		return;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( elm, data, mod, callback ){
		var $dom = $(elm);
		// console.log($dom.html());
		if(typeof(data) !== typeof({})){
			data = {};
		}
		if( $dom.find('input[type=text]').size() ){
			data.src = $dom.find('input[type=text]').val();
		}else{
			data.src = $dom.find('textarea').val();
		}
		data.src = JSON.parse( JSON.stringify(data.src) );
		data.editor = $dom.find('input[type=radio][name=editor-'+mod.name+']:checked').val();

		callback(data);
		return;
	}

}
