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

		case "getLanguageCsv":
			// 言語ファイル(CSV)を取得
			var csv = require('fs').readFileSync( __dirname+'/../data/language.csv' ).toString();
			callback(csv);
			break;

		case "initContentFiles":
			// コンテンツファイルを初期化する
			// console.log(data);
			px2ce.initContentFiles(data.editor_mode, function(result){
				callback(result);
			});
			break;

		case "getProjectConf":
			// プロジェクトの設定を取得する
			px2ce.getProjectConf(function(conf){
				callback(conf);
			});
			break;

		case "checkEditorMode":
			// ページの編集方法を取得する
			px2ce.checkEditorMode(function(editorMode){
				callback(editorMode);
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

		case "loadCustomFieldsClientSideLibs":
			// プロジェクトが拡張した broccoli-fields のクライアントサイドスクリプトを取得
			if(px2ce.options.customFieldsIncludePath && px2ce.options.customFieldsIncludePath.length){
				var codes = [];
				var confCustomFields = px2ce.options.customFieldsIncludePath;
				for(var idx in confCustomFields){
					var binJs = '<script src="'+confCustomFields[idx]+'"></script>';
					codes.push(binJs);
				}
				callback(codes);
				break;
			}
			px2ce.getProjectConf(function(conf){
				var codes = [];
				var code = '';
				try {
					var confCustomFields = conf.plugins.px2dt.guieditor.custom_fields;
					for(var fieldName in confCustomFields){
						if( confCustomFields[fieldName].frontend.file && confCustomFields[fieldName].frontend.function ){
							var pathJs = require('path').resolve(px2ce.entryScript, '..', confCustomFields[fieldName].frontend.file);
							var binJs = require('fs').readFileSync( pathJs ).toString();
							code += binJs;
						}
					}
				} catch (e) {
				}
				code = '<script>'+code+'</script>';
				codes.push(code);
				callback(codes);
			});
			break;

		default:
			callback(true);
			break;
	}

	return;
}
