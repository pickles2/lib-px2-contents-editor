<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * General Purpose Interface
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class gpi{

	/**
	 * $px2ce
	 */
	private $px2ce;

	/**
	 * Constructor
	 */
	public function __construct( $px2ce ){
		$this->px2ce = $px2ce;
	}

	/**
	 * Initialize
	 */
	public function gpi( $data ){
		$data = json_decode( json_encode($data), true );

		switch($data['api']){
			case "getConfig":
				// pickles2-contents-editor の設定を取得する
				$conf = array();
				$conf['appMode'] = $this->px2ce->get_app_mode();
				$conf['target_mode'] = $this->px2ce->get_target_mode();
				if($conf['target_mode'] == 'theme_layout'){
					$conf['theme_id'] = $this->px2ce->get_theme_id();
					$conf['layout_id'] = $this->px2ce->get_layout_id();
				}
				return $conf;
				break;

			case "getLanguageCsv":
				// 言語ファイル(CSV)を取得
				$csv = file_get_contents( __DIR__.'/../data/language.csv' );
				return $csv;
				break;

			// case "initContentFiles":
			// 	// コンテンツファイルを初期化する
			// 	// console.log(data);
			// 	$this->px2ce->initContentFiles($data.editor_mode, function(result){
			// 		callback(result);
			// 	});
			// 	break;

			case "getProjectConf":
				// プロジェクトの設定を取得する
				$conf = $this->px2ce->get_project_conf();
				return $conf;
				break;

			case "checkEditorMode":
				// ページの編集方法を取得する
				$editorMode = $this->px2ce->check_editor_mode();
				return $editorMode;
				break;

			case "getContentsSrc":
				// コンテンツのソースを取得する
				$defaultEditor = new editor_default($this->px2ce);
				$contentsCodes = $defaultEditor->getContentsSrc();
				return $contentsCodes;
				break;

			// case "saveContentsSrc":
			// 	// コンテンツのソースを保存する
			// 	var defaultEditor = new (require('./editor/default.js'))(px2ce);
			// 	defaultEditor.saveContentsSrc($data.codes, function(result){
			// 		callback(result);
			// 	});
			// 	break;

			// case "broccoliBridge":
			// 	var broccoliBridge = require('./editor/broccoli.js');
			// 	broccoliBridge(px2ce, data, function(data){
			// 		callback(data);
			// 	});
			// 	break;

			// case "getModuleCssJsSrc":
			// 	// モジュールCSS,JSソースを取得する
			// 	$this->px2ce->getModuleCssJsSrc($data.theme_id, function(results){
			// 		callback(results);
			// 	});
			// 	break;

			// case "getPagesByLayout":
			// 	// レイアウトからページの一覧を取得する
			// 	var rtn = [];
			// 	var layout_id = $data.layout_id || 'default';
			// 	$this->px2ce->px2proj.get_sitemap(function(sitemap){
			// 		for(var idx in sitemap){
			// 			try {
			// 				var page_layout_id = sitemap[idx].layout || 'default';
			// 				if( page_layout_id == layout_id ){
			// 					rtn.push(sitemap[idx]);
			// 				}
			// 			} catch (e) {
			// 			}
			// 		}
			// 		callback(rtn);
			// 	});
			// 	break;

			// case "openUrlInBrowser":
			// 	$this->px2ce->openUrlInBrowser($data.url, function(res){
			// 		callback(res);
			// 	});
			// 	break;

			// case "openResourceDir":
			// 	$this->px2ce->openResourceDir('/', function(res){
			// 		callback(res);
			// 	});
			// 	break;

			// case "loadCustomFieldsClientSideLibs":
			// 	// プロジェクトが拡張した broccoli-fields のクライアントサイドスクリプトを取得
			// 	if($this->px2ce->options.customFieldsIncludePath && $this->px2ce->options.customFieldsIncludePath.length){
			// 		var confCustomFields = $this->px2ce->options.customFieldsIncludePath;
			// 		callback(confCustomFields);
			// 		break;
			// 	}
			// 	$this->px2ce->getProjectConf(function(conf){
			// 		var codes = [];
			// 		var code = '';
			// 		try {
			// 			var confCustomFields = conf.plugins.px2dt.guieditor.custom_fields;
			// 			for(var fieldName in confCustomFields){
			// 				if( confCustomFields[fieldName].frontend.file && confCustomFields[fieldName].frontend.function ){
			// 					var pathJs = require('path').resolve($this->px2ce->entryScript, '..', confCustomFields[fieldName].frontend.file);
			// 					var binJs = file_get_contents( pathJs ).toString();
			// 					code += '/**'+"\n";
			// 					code += ' * '+fieldName+"\n";
			// 					code += ' */'+"\n";
			// 					code += binJs+"\n";
			// 					code += ''+"\n";
			// 				}
			// 			}
			// 		} catch (e) {
			// 		}
			// 		code = 'data:text/javascript;base64,'+(new Buffer(code).toString('base64'));
			// 		codes.push(code);
			// 		callback(codes);
			// 	});
			// 	break;

			default:
				return true;
				break;
		}

		return false;
	}


}
