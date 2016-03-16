/**
 * gpi.js (General Purpose Interface)
 */
module.exports = function(px2ce, api, options, callback){
	delete(require.cache[require('path').resolve(__filename)]);

	var _this = this;
	callback = callback || function(){};

	switch(api){
		case "checkEditorType":
			// ページの編集方法を取得する
			px2ce.checkEditorType(function(editoryType){
				callback(editoryType);
			});
			break;

		default:
			callback(true);
			break;
	}

	return;
}
