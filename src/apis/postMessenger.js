/**
 * postMessenger.js
 * iframeに展開されるプレビューHTMLとの通信を仲介します。
 */
module.exports = function(px2ce, iframe){
	var $ = require('jquery');

	var __dirname = px2ce.__dirname;
	var callbackMemory = {};

	function createUUID(){
		return "uuid-"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
	}
	function getTargetOrigin(iframe){
		if(window.location.origin=='file://'){
			return '*';
		}

		var url = $(iframe).attr('src');
		var parser = document.createElement('a');
		parser.href=url;
		return parser.protocol+'//'+parser.host
	}

	/**
	 * 初期化
	 */
	this.init = function(callback){
		var targetWindowOrigin = getTargetOrigin(iframe);
		var win = $(iframe).get(0).contentWindow;

		$.ajax({
			"url": __dirname+'/pickles2-preview-contents.js',
			"data": {},
			"dataType": "html",
			"success": function(data){
				var base64 = new Buffer(data).toString('base64');
				win.postMessage({'scriptUrl':'data:text/javascript;charset=utf8;base64,'+base64}, targetWindowOrigin);
				setTimeout(function(){
					// TODO: より確実な方法が欲しい。
					// 子ウィンドウに走らせるスクリプトの準備が整うまで若干のタイムラグが生じる。
					// 一旦 50ms あけて callback するようにしたが、より確実に完了を拾える方法が必要。
					callback();
				}, 100);
			},
			"error": function(err){
				console.error('Error:', err);
			},
		});
		return;
	}

	/**
	 * メッセージを送る
	 */
	this.send = function(api, options, callback){
		callback = callback||function(){};

		var callbackId = createUUID();

		callbackMemory[callbackId] = callback; // callbackは送信先から呼ばれる。

		var message = {
			'api': api,
			'callback': callbackId,
			'options': options
		};

		var win = $(iframe).get(0).contentWindow;
		var targetWindowOrigin = getTargetOrigin(iframe);
		win.postMessage(message, targetWindowOrigin);
		return;
	}

	/**
	 * メッセージを受信する
	 */
	window.addEventListener('message',function(event){
		var data=event.data;

		if(data.api == 'onClickContentsLink'){
			var data = event.data.options;
			px2ce.onClickContentsLink(data.url, data);
			return;

		}else{
			if(!callbackMemory[data.api]){return;}
			callbackMemory[data.api](data.options);
			callbackMemory[data.api] = undefined;
			delete callbackMemory[data.api];
		}
		return;

	});

	return;
}
