(function(){
	var $ = require('jquery');
	var $iframeWindow = $(window.document);

	var scriptElement = document.querySelector('[data-broccoli-receive-message]');//broccoliの仕様に便乗する都合上、この属性名はbroccoliに従うことになる。
	if(scriptElement){
		scriptElement.parentNode.removeChild(scriptElement);
	}
	var _origin;


	// クリックイベントを登録
	$iframeWindow.bind('click', function(){
	});
	// dropイベントをキャンセル
	$iframeWindow.on('dragover', function(e){
		e.stopPropagation();
		e.preventDefault();
		return;
	}).on('drop', function(e){
		e.stopPropagation();
		e.preventDefault();
		return;
	});

	function callbackMessage(callbackId, data){
		if(!_origin){return;}
		if(typeof(callbackId)!==typeof('')){return;}
		window.parent.postMessage(
			{
				'api':callbackId ,
				'options': data
			},
			_origin
		);
	}

	window.addEventListener('message',function(event){
		var data=event.data;
		_origin = event.origin;

		if(data.api == 'getHtmlContentHeightWidth'){
			var hw = {};
			hw.h = Math.max.apply( null, [document.body.clientHeight , document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight] );
			hw.w = Math.max.apply( null, [document.body.clientWidth , document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth] );
			hw.h += 16;

			callbackMessage(data.callback, hw);
			return;

		}else if(data.api == 'getScrollPosition'){
			var position = {};
			position.top = window.scrollY;
			position.left = window.scrollX;

			callbackMessage(data.callback, position);
			return;

		}else if(data.api == 'setScrollPosition'){
			window.scrollTo(data.options);

			callbackMessage(data.callback, true);
			return;

		}else{
			callbackMessage(data.callback, false);
			return;
		}
		return;
	});

	$iframeWindow.on("click", "a", function(e) {
		e.stopPropagation();
		e.preventDefault();
		var data = {};
		var $this = $(this);
		data.url = $this.prop('href');
		data.tagName = this.tagName.toLowerCase();
		data.href = $this.attr('href');
		data.target = $this.attr('target');
		callbackMessage( 'onClickContentsLink', data );
		return false;
	});
	$iframeWindow.find('form').on("submit", function(e) {
		e.stopPropagation();
		e.preventDefault();
		var data = {};
		var $this = $(this);
		data.url = $this.prop('action');
		data.tagName = this.tagName.toLowerCase();
		data.action = $this.attr('action');
		data.target = $this.attr('target');
		callbackMessage( 'onClickContentsLink', data );
		return false;
	});

})();
