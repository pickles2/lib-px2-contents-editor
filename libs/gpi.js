/**
 * gpi.js (General Purpose Interface)
 */
module.exports = function(px2ce, api, options, callback){
	delete(require.cache[require('path').resolve(__filename)]);

	var _this = this;
	callback = callback || function(){};

	var path = require('path');
	var fs = require('fs');

	switch(api){
		case "getProjectConf":
			// Pickles2の設定情報を取得する
			px2ce.getProjectConf(function(conf){
				callback(conf);
			});
			break;

		default:
			callback(true);
			break;
	}

	return;
}
