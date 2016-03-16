$(window).load(function(){
	var params = parseUriParam(window.location.href);
	// console.log(params);

	var pickles2ContentsEditor = new Pickles2ContentsEditor();
	pickles2ContentsEditor.init(
		{
			'page_path': params.page_path ,
			'elmCanvas': document.getElementById('canvas'),
			'gpiBridge': function(api, options, callback){
				// GPI(General Purpose Interface) Bridge
				// broccoliは、バックグラウンドで様々なデータ通信を行います。
				// GPIは、これらのデータ通信を行うための汎用的なAPIです。
				$.ajax({
					"url": "/apis/px2ce",
					"type": 'post',
					'data': {
						'page_path': params.page_path,
						'api': JSON.stringify(api) ,
						'options': JSON.stringify(options)
					},
					"success": function(data){
						// console.log(data);
						callback(data);
					}
				});
				return;
			}
		},
		function(){
			console.info('standby!!');
		}
	);

});
/**
* GETパラメータをパースする
*/
parseUriParam = function(url){
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
