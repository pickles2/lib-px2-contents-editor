window.Pickles2ContentsEditor = function(){
	var $ = require('jquery');
	var gpiBridge;

	this.init = function(options, callback){
		gpiBridge = options.gpiBridge || function(){ alert('gpiBridge required.'); };
		callback = callback || function(){};
		gpiBridge(
			'getProjectConf',
			{},
			function(pjInfo){
				console.log(pjInfo);
				callback();
			}
		);
	}

}
