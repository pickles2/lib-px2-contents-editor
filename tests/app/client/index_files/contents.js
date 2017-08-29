(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
	"origin": "http://127.0.0.1:8080",
	"px2server":{
		"origin": "http://127.0.0.1:8081"
	}
}

},{}],2:[function(require,module,exports){
$(window).load(function(){
	var conf = require('../../../../config/default.json');
	// console.log(conf);
	var params = parseUriParam(window.location.href);
	// console.log(params);
	var $canvas = $('#canvas');

	/**
	* window.resized イベントハンドラ
	*/
	var windowResized = function(callback){
		callback = callback || function(){};
		$canvas.height( $(window).height() - 200 );
		callback();
		return;
	}

	var pickles2ContentsEditor = new Pickles2ContentsEditor();
	windowResized(function(){
		pickles2ContentsEditor.init(
			{
				'page_path': params.page_path ,
				'elmCanvas': $canvas.get(0),
				'preview':{
					'origin': conf.px2server.origin
				},
				'customFields':{
					'custom1': function(broccoli){
						// カスタムフィールドを実装
					}
				},
				'lang': 'ja',
				'gpiBridge': function(input, callback){
					// GPI(General Purpose Interface) Bridge
					// broccoliは、バックグラウンドで様々なデータ通信を行います。
					// GPIは、これらのデータ通信を行うための汎用的なAPIです。
					$.ajax({
						"url": "/apis/px2ce",
						"type": 'post',
						'data': {'page_path':params.page_path, 'target_mode':params.target_mode, 'data':JSON.stringify(input)},
						"success": function(data){
							// console.log(data);
							callback(data);
						}
					});
					return;
				},
				'complete': function(){
					alert('完了しました。');
				},
				'onClickContentsLink': function( uri, data ){
					alert('編集: ' +  uri);
				},
				'onMessage': function( message ){
					console.info('message: '+message);
				}
			},
			function(){

				$(window).resize(function(){
					// このメソッドは、canvasの再描画を行います。
					// ウィンドウサイズが変更された際に、UIを再描画するよう命令しています。
					windowResized(function(){
						pickles2ContentsEditor.redraw();
					});
				});

				console.info('standby!!');
			}
		);

	});


});

/**
 * GETパラメータをパースする
 */
var parseUriParam = function(url){
	var paramsArray = [];
	parameters = url.split("?");
	if( parameters.length > 1 ) {
		var params = parameters[1].split("&");
		for ( var i = 0; i < params.length; i++ ) {
			var paramItem = params[i].split("=");
			for( var i2 in paramItem ){
				paramItem[i2] = decodeURIComponent( paramItem[i2] );
			}
			paramsArray.push( paramItem[0] );
			paramsArray[paramItem[0]] = paramItem[1];
		}
	}
	return paramsArray;
}

},{"../../../../config/default.json":1}]},{},[2])