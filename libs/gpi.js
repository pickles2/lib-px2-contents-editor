/**
 * gpi.js (General Purpose Interface)
 */
module.exports = function(px2ce, data, callback){
	var utils79 = require('utils79');

	var _this = this;
	callback = callback || function(){};

	switch(data.api){
		case "getBootupInfomations":
			// 初期起動時に必要なすべての情報を取得する
			$bootup = {};
			$bootup['conf'] = {};
			$bootup['conf'].appMode = px2ce.getAppMode();
			$bootup['conf'].target_mode = px2ce.target_mode;
			if($bootup['conf'].target_mode == 'theme_layout'){
				$bootup['conf'].theme_id = px2ce.theme_id;
				$bootup['conf'].layout_id = px2ce.layout_id;
			}

			$bootup['languageCsv'] = require('fs').readFileSync( __dirname+'/../data/language.csv' ).toString();

			px2ce.checkEditorMode(function(editorMode){
				$bootup['editorMode'] = editorMode;

				px2ce.getProjectConf(function(projectConf){
					$bootup['projectConf'] = projectConf;

					if(px2ce.options.customFieldsIncludePath && px2ce.options.customFieldsIncludePath.length){
						var confCustomFields = px2ce.options.customFieldsIncludePath;
						callback(confCustomFields);
						break;
					}
					px2ce.getProjectConf(function(conf){
						var codes = [];
						var code = '';
						try {
							var confCustomFields = conf.plugins.px2dt.guieditor.custom_fields;
							for(var fieldName in confCustomFields){
								var file = confCustomFields[fieldName].frontend.file;
								var dir = confCustomFields[fieldName].frontend.dir;
								var fnc = confCustomFields[fieldName].frontend.function;
								if( file && fnc ){
									if( typeof(file) == typeof('') ){
										file = [file];
									}
									for(var idx in file){
										var filePath = '.';
										if( typeof(dir) == typeof('') && utils79.is_dir(require('path').resolve(px2ce.entryScript, '..', dir)) ){
											filePath = dir;
										}
										var pathJs = require('path').resolve(px2ce.entryScript, '..', filePath, file[idx]);
										var binJs = require('fs').readFileSync( pathJs ).toString();
										code += '/**'+"\n";
										code += ' * '+fieldName+"\n";
										code += ' */'+"\n";
										code += binJs+"\n";
										code += ''+"\n";
									}
								}
							}
						} catch (e) {
						}
						code = 'data:text/javascript;base64,'+(new Buffer(code).toString('base64'));
						codes.push(code);

						$bootup['customFieldsClientSideLibs'] = codes;

						$bootup['pagesByLayout'] = [];
						var layout_id = data.layout_id || 'default';
						px2ce.px2proj.get_sitemap(function(sitemap){
							for(var idx in sitemap){
								try {
									var page_layout_id = sitemap[idx].layout || 'default';
									if( page_layout_id == layout_id ){
										$bootup['pagesByLayout'].push(sitemap[idx]);
									}
								} catch (e) {
								}
							}

							callback($bootup);
						});

					});

				});

			});

			break;

		case "getConfig":
			// pickles2-contents-editor の設定を取得する
			var conf = {};
			conf.appMode = px2ce.getAppMode();
			conf.target_mode = px2ce.target_mode;
			if(conf.target_mode == 'theme_layout'){
				conf.theme_id = px2ce.theme_id;
				conf.layout_id = px2ce.layout_id;
			}
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

		case "getModuleCssJsSrc":
			// モジュールCSS,JSソースを取得する
			px2ce.getModuleCssJsSrc(data.theme_id, function(results){
				callback(results);
			});
			break;

		case "getPagesByLayout":
			// レイアウトからページの一覧を取得する
			var rtn = [];
			var layout_id = data.layout_id || 'default';
			px2ce.px2proj.get_sitemap(function(sitemap){
				for(var idx in sitemap){
					try {
						var page_layout_id = sitemap[idx].layout || 'default';
						if( page_layout_id == layout_id ){
							rtn.push(sitemap[idx]);
						}
					} catch (e) {
					}
				}
				callback(rtn);
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
				var confCustomFields = px2ce.options.customFieldsIncludePath;
				callback(confCustomFields);
				break;
			}
			px2ce.getProjectConf(function(conf){
				var codes = [];
				var code = '';
				try {
					var confCustomFields = conf.plugins.px2dt.guieditor.custom_fields;
					for(var fieldName in confCustomFields){
						var file = confCustomFields[fieldName].frontend.file;
						var dir = confCustomFields[fieldName].frontend.dir;
						var fnc = confCustomFields[fieldName].frontend.function;
						if( file && fnc ){
							if( typeof(file) == typeof('') ){
								file = [file];
							}
							for(var idx in file){
								var filePath = '.';
								if( typeof(dir) == typeof('') && utils79.is_dir(require('path').resolve(px2ce.entryScript, '..', dir)) ){
									filePath = dir;
								}
								var pathJs = require('path').resolve(px2ce.entryScript, '..', filePath, file[idx]);
								var binJs = require('fs').readFileSync( pathJs ).toString();
								code += '/**'+"\n";
								code += ' * '+fieldName+"\n";
								code += ' */'+"\n";
								code += binJs+"\n";
								code += ''+"\n";
							}
						}
					}
				} catch (e) {
				}
				code = 'data:text/javascript;base64,'+(new Buffer(code).toString('base64'));
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
