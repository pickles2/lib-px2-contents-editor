/**
 * gpi.js (General Purpose Interface)
 */
module.exports = function(px2ce, data, callback){
	delete(require.cache[require('path').resolve(__filename)]);

	var _this = this;
	callback = callback || function(){};

	switch(data.api){
		case "getConfig":
			// pickles2-contents-editor の設定を取得する
			var conf = {};
			conf.appMode = px2ce.getAppMode();
			callback(conf);
			break;

		case "initContentFiles":
			// コンテンツファイルを初期化する
			// console.log(data);
			px2ce.initContentFiles(data.editor_type, function(result){
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

		case "getContentsSrc":
			// コンテンツのソースを取得する
			var defaultEditor = new (require('./editor/default.js'))(px2ce);
			defaultEditor.getContentsSrc(function(contentsCodes){
				callback(contentsCodes);
			});
			break;

		case "saveContentsSrc":
			// コンテンツのソースを保存する
			var defaultEditor = new (require('./editor/default.js'))(px2ce);
			defaultEditor.saveContentsSrc(data.codes, function(result){
				callback(result);
			});
			break;

		case "broccoliBridge":
			var broccoliBridge = require('./editor/broccoli.js');
			broccoliBridge(px2ce, data, function(data){
				callback(data);
			});
			break;

		case "openUrlInBrowser":
			px2ce.openUrlInBrowser(data.url, function(res){
				callback(res);
			});
			break;

		case "openResourceDir":
			px2ce.openResourceDir('/', function(res){
				callback(res);
			});
			break;

		default:
			callback(true);
			break;
	}

	return;
}
