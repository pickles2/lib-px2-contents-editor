(function(){
	var $ = require('jquery');
	var $iframeWindow = $(window.document);

	var e=document.querySelector('[data-broccoli-receive-message]');//broccoliの仕様に便乗する都合上、この属性名はbroccoliに従うことになる。
	e.parentNode.removeChild(e);

	var _origin;


	// クリックイベントを登録
	$iframeWindow.bind('click', function(){
	});

	// console.log(window.location);

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
			// var height = $iframeWindow.find('html').outerHeight();
			var hw = {};
			hw.h = Math.max.apply( null, [document.body.clientHeight , document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight] );
			hw.w = Math.max.apply( null, [document.body.clientWidth , document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth] );
			hw.h += 16;

			callbackMessage(data.callback, hw);
			return;

		}else{
			callbackMessage(data.callback, false);
			return;
		}
		return;
	});

	$iframeWindow.on("click", "a", function() {
		var data = {};
		var $this = $(this);
		data.url = $this.prop('href');
		data.tagName = this.tagName.toLowerCase();
		data.href = $this.attr('href');
		data.target = $this.attr('target');
		callbackMessage( 'onClickContentsLink', data );
		return false;
	});
	$iframeWindow.find('form').bind("submit", function() {
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
