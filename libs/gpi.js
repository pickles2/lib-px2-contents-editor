/**
 * gpi.js (General Purpose Interface)
 */
module.exports = function(px2ce, data, callback){
	delete(require.cache[require('path').resolve(__filename)]);

	var _this = this;
	callback = callback || function(){};

	switch(data.api){
		case "initContentFiles":
			// コンテンツファイルを初期化する
			console.log(data);
			px2ce.initContentFiles(data.page_path, data.editor_type, function(result){
				callback(result);
			});
			break;

		case "getProjectConf":
			// プロジェクトの設定を取得する
			px2ce.getProjectConf(function(conf){
				callback(conf);
			});
			break;

		case "checkEditorType":
			// ページの編集方法を取得する
			px2ce.checkEditorType(function(editoryType){
				callback(editoryType);
			});
			break;

		case "broccoliBridge":
			var broccoliBridge = require('./editor/broccoli.js');
			broccoliBridge(px2ce, data, function(data){
				callback(data);
			});
			break;

		default:
			callback(true);
			break;
	}

	return;
}
