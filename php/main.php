<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Pickles 2 contents editor core class
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class main{

	/**
	 * 編集対象のモード
	 * コンテンツ以外にも対応範囲を拡大
	 * - `page_content` = ページコンテンツ(デフォルト)
	 * - `theme_layout` = テーマレイアウトテンプレート(px2-multithemeの仕様に準拠)
	 */
	private $target_mode;

	/**
	 * ページのパス
	 * `target_mode` が `theme_layout` の場合、
	 * `page_path` は `{$theme_id}/{$layout_id}.html` の形式を取る
	 */
	private $page_path;

	/** Entry Script path */
	private $entryScript;

	/**
	 * テーマID
	 * `target_mode` が `theme_layout` の場合に値を持つ。
	 * `this.page_path` をパースして生成。
	 */
	private $theme_id;
	/**
	 * レイアウトID
	 * `target_mode` が `theme_layout` の場合に値を持つ。
	 * `this.page_path` をパースして生成。
	 */
	private $layout_id;

	/** PHPコマンド設定 */
	private $php_command;

	/** Pickles 2 プロジェクト環境情報 */
	private $pjInfo;
	private $px2conf,
		$pageInfo,
		$documentRoot,
		$contRoot,
		$realpathDataDir,
		$pathResourceDir,
		$realpathFiles;

	/** オプション */
	private $options;

	/**
	 * Initialize
	 */
	public function init( $options ){
		// var_dump(options);
		if(!is_array($options)){
			$options = array();
		}
		if( !@strlen( $options['appMode'] ) ){
			$options['appMode'] = 'web'; // web | desktop
		}
		if( !@is_array( $options['customFields'] ) ){
			$options['customFields'] = array(); // custom fields
		}
		if( !@is_array( $options['customFieldsIncludePath'] ) ){
			$options['customFieldsIncludePath'] = array(); // custom fields include path (for cliend libs)
		}
		if( !@is_callable( $options['log'] ) ){
			$options['log'] = function($msg){
				// var_dump($msg);
			};
		}
		$this->php_command = array(
			'php'=>'php',
			'php_ini'=>null,
			'php_extension_dir'=>null,
		);
		if( strlen(@$options['php']) ){
			$this->php_command['php'] = $options['php'];
		}
		if( strlen(@$options['php_ini']) ){
			$this->php_command['php_ini'] = $options['php_ini'];
		}
		if( strlen(@$options['php_extension_dir']) ){
			$this->php_command['php_extension_dir'] = $options['php_extension_dir'];
		}

		$this->entryScript = $options['entryScript'];
		$this->target_mode = (@strlen($options['target_mode']) ? $options['target_mode'] : 'page_content');
		$this->page_path = @$options['page_path'];
		if(!is_string($this->page_path)){
			// 編集対象ページが指定されていない場合
			return;
		}

		$this->options = $options;

		$this->page_path = preg_replace( '/^(alias[0-9]*\:)?\/+/s', '/', $this->page_path );
		$this->page_path = preg_replace( '/\{(?:\*|\$)[\s\S]*\}/s', '', $this->page_path );

		$pjInfo = $this->getProjectInfo();
		// var_dump($pjInfo);

		$this->pjInfo = $pjInfo;
		$this->px2conf = $pjInfo['conf'];
		$this->pageInfo = $pjInfo['pageInfo'];
		$this->documentRoot = $pjInfo['documentRoot'];
		$this->contRoot = $pjInfo['contRoot'];
		$this->realpathDataDir = $pjInfo['realpathDataDir'];
		$this->pathResourceDir = $pjInfo['pathResourceDir'];
		$this->realpathFiles = $pjInfo['realpathFiles'];

		if( $this->target_mode == 'theme_layout' ){
			if( preg_match('/^\/([\s\S]+?)\/([\s\S]+)\.html$/', $this->page_path, $matched) ){
				$this->theme_id = $matched[1];
				$this->layout_id = $matched[2];
			}
			$this->documentRoot = $pjInfo['realpathThemeCollectionDir'];
			$this->contRoot = '/';
			$this->realpathFiles = $pjInfo['realpathThemeCollectionDir'].$this->theme_id.'/theme_files/layouts/'.$this->layout_id.'/';
			$this->pathResourceDir = '/'.$this->theme_id.'/theme_files/layouts/'.$this->layout_id.'/resources/';
			$this->realpathDataDir = $pjInfo['realpathThemeCollectionDir'].$this->theme_id.'/guieditor.ignore/'.$this->layout_id.'/data/';
		}

		return;
	}

	// /**
	//  * プロジェクトの設定情報を取得する
	//  */
	// this.getProjectConf = function(callback){
	// 	callback = callback || function(){};
	// 	this.px2proj.get_config(function(val){
	// 		callback(val);
	// 	});
	// 	return;
	// }

	// /**
	//  * アプリケーションの実行モード設定を取得する (同期)
	//  * @return string 'web'|'desktop'
	//  */
	// this.getAppMode = function(){
	// 	var rtn = this.options.appMode;
	// 	switch(rtn){
	// 		case 'web':
	// 		case 'desktop':
	// 			break;
	// 		default:
	// 			rtn = 'web';
	// 			break;
	// 	}
	// 	return rtn;
	// }

	// /**
	//  * ブラウザでURLを開く
	//  */
	// this.openUrlInBrowser = function( url, callback ){
	// 	var_dump('open URL: ' + url);
	// 	// var_dump(px2ce.getAppMode());
	// 	if( this.getAppMode() != 'desktop' ){
	// 		callback(false);
	// 		return;
	// 	}
	// 	var desktopUtils = require('desktop-utils');
	// 	desktopUtils.open( url );
	// 	callback(true);
	// 	return;
	// }

	// /**
	//  * リソースフォルダを開く
	//  */
	// this.openResourceDir = function( path, callback ){
	// 	var_dump('open resource dir: ' + path + ' of ' + $this->page_path + ' ('+_this.target_mode+')');
	// 	// var_dump(px2ce.getAppMode());
	// 	if( _this.getAppMode() != 'desktop' ){
	// 		callback(false);
	// 		return;
	// 	}
	// 	var desktopUtils = require('desktop-utils');
	// 	if( !utils79.is_dir(_this.realpathFiles) ){
	// 		fsx.mkdirSync(_this.realpathFiles);
	// 	}
	// 	var realpath_target = require('path').resolve(_this.realpathFiles, './'+path);
	// 	if( !utils79.is_dir(utils79.dirname(realpath_target)) ){
	// 		fsx.mkdirSync(utils79.dirname(realpath_target));
	// 	}
	// 	desktopUtils.open( realpath_target );
	// 	callback(true);
	// 	return;
	// }

	/**
	 * プロジェクト情報をまとめて取得する
	 */
	private function getProjectInfo(){
		$pjInfo = array();

		$allData = $this->px2query(
			$this->page_path.'?PX=px2dthelper.get.all',
			array(
				"output" => "json"
			)
		);

		$pjInfo['conf'] = $allData->config;
		$pjInfo['pageInfo'] = $allData->page_info;
		$pjInfo['contRoot'] = $allData->path_controot;
		$pjInfo['documentRoot'] = $allData->realpath_docroot;
		$pjInfo['realpathFiles'] = $allData->realpath_files;
		$pjInfo['pathFiles'] = $allData->path_files;
		$pjInfo['realpathThemeCollectionDir'] = $allData->realpath_theme_collection_dir;
		$pjInfo['realpathDataDir'] = $allData->realpath_data_dir;
		$pjInfo['pathResourceDir'] = $allData->path_resource_dir;
		$pjInfo['realpath_homedir'] = $allData->realpath_homedir;

		// var_dump($pjInfo);
		return $pjInfo;
	} // getProjectInfo()

	// /**
	//  * モジュールCSS,JSソースを取得する
	//  */
	// this.getModuleCssJsSrc = function(theme_id, callback){
	// 	callback = callback || function(){};
	// 	theme_id = theme_id || '';
	// 	var rtn = {
	// 		'css': '',
	// 		'js': ''
	// 	};
	// 	$this->px2query('/?PX=px2dthelper.document_modules.build_css&theme_id='+encodeURIComponent(theme_id), {
	// 		"output": "json",
	// 		"complete": function(data, code){
	// 			// var_dump(data, code);
	// 			rtn.css += data;

	// 			$this->px2query('/?PX=px2dthelper.document_modules.build_js&theme_id='+encodeURIComponent(theme_id), {
	// 				"output": "json",
	// 				"complete": function(data, code){
	// 					// var_dump(data, code);
	// 					rtn.js += data;

	// 					callback(rtn);
	// 				}
	// 			});
	// 		}
	// 	});
	// } // getModuleCssJsSrc

	// /**
	//  * コンテンツファイルを初期化する
	//  */
	// this.initContentFiles = function(editorMode, callback){
	// 	$this->px2query(
	// 		$this->page_path+'?PX=px2dthelper.init_content&editor_mode='+editorMode, {
	// 			"output": "json",
	// 			"complete": function(data, code){
	// 				// var_dump(data, code);
	// 				var rtn = JSON.parse(data);
	// 				callback(rtn);
	// 				return;
	// 			}
	// 		}
	// 	);
	// 	return;
	// }

	// /**
	//  * ページの編集方法を取得する
	//  */
	// this.checkEditorMode = function(callback){
	// 	if( this.target_mode == 'theme_layout' ){
	// 		// ドキュメントルートの設定上書きがある場合
	// 		// テーマレイアウトの編集等に利用するモード
	// 		// var_dump([_this.documentRoot,
	// 		// 	_this.contRoot,
	// 		// 	_this.realpathFiles,
	// 		// 	_this.pathResourceDir,
	// 		// 	_this.realpathDataDir]);

	// 		if( !utils79.is_file( _this.documentRoot + $this->page_path ) ){
	// 			callback('.not_exists');
	// 			return;
	// 		}
	// 		if( utils79.is_file( _this.realpathDataDir + 'data.json' ) ){
	// 			callback('html.gui');
	// 			return;
	// 		}
	// 		callback('html');
	// 		return;
	// 	}
	// 	$this->px2query(
	// 		$this->page_path+'?PX=px2dthelper.check_editor_mode', {
	// 			"output": "json",
	// 			"complete": function(data, code){
	// 				// var_dump(data, code);
	// 				var rtn = JSON.parse(data);
	// 				callback(rtn);
	// 				return;
	// 			}
	// 		}
	// 	);
	// 	return;
	// }

	// /**
	//  * create initialize options for broccoli-html-editor
	//  */
	// this.createBroccoliInitOptions = function(callback){
	// 	callback = callback||function(){};
	// 	var broccoliInitializeOptions = {};
	// 	var px2ce = this;

	// 	var px2proj = px2ce.px2proj,
	// 		page_path = px2ce.page_path,
	// 		px2conf = px2ce.px2conf,
	// 		pageInfo = px2ce.pageInfo,
	// 		contRoot = px2ce.contRoot,
	// 		documentRoot = px2ce.documentRoot,
	// 		realpathDataDir = px2ce.realpathDataDir,
	// 		pathResourceDir = px2ce.pathResourceDir,
	// 		pathsModuleTemplate = [],
	// 		bindTemplate = function(){}
	// 	;
	// 	var customFields = {};
	// 	var page_content = $this->page_path;
	// 	try {
	// 		page_content = pageInfo.content;
	// 	} catch (e) {
	// 	}

	// 	new Promise(function(rlv){rlv();})
	// 		.then(function(){ return new Promise(function(rlv, rjt){
	// 			// フィールドを拡張

	// 			// px2ce が拡張するフィールド
	// 			customFields.table = require('broccoli-field-table').get({'php': nodePhpBinOptions});

	// 			// 呼び出し元アプリが拡張するフィールド
	// 			for( var idx in px2ce.options.customFields ){
	// 				customFields[idx] = px2ce.options.customFields[idx];
	// 			}

	// 			// プロジェクトが拡張するフィールド
	// 			var confCustomFields = {};
	// 			try {
	// 				confCustomFields = px2conf.plugins.px2dt.guieditor.custom_fields;
	// 				for( var fieldName in confCustomFields ){
	// 					try {
	// 						if( confCustomFields[fieldName].backend.require ){
	// 							var path_backend_field = require('path').resolve(px2ce.entryScript, '..', confCustomFields[fieldName].backend.require);
	// 							customFields[fieldName] = require( path_backend_field );
	// 						}else{
	// 							console.error( 'FAILED to load custom field: ' + fieldName + ' (backend);' );
	// 							console.error( 'unknown type' );
	// 						}
	// 					} catch (e) {
	// 						console.error( 'FAILED to load custom field: ' + fieldName + ' (backend);' );
	// 						console.error(e);
	// 					}
	// 				}
	// 			} catch (e) {
	// 			}

	// 			// var_dump(customFields);

	// 			rlv();
	// 		}); })
	// 		.then(function(){ return new Promise(function(rlv, rjt){
	// 			// モジュールテンプレートを収集
	// 			// (指定モジュールをロード)
	// 			if( _this.target_mode == 'theme_layout' ){
	// 				// テーマ編集ではスキップ
	// 				rlv();
	// 				return;
	// 			}
	// 			for( var idx in px2conf.plugins.px2dt.paths_module_template ){
	// 				pathsModuleTemplate[idx] = require('path').resolve( px2ce.entryScript, '..', px2conf.plugins.px2dt.paths_module_template[idx] )+'/';
	// 			}
	// 			rlv();
	// 		}); })
	// 		.then(function(){ return new Promise(function(rlv, rjt){
	// 			// モジュールテンプレートを収集
	// 			// (モジュールフォルダからロード)
	// 			var pathModuleDir = px2conf.plugins.px2dt.path_module_templates_dir;
	// 			if( _this.target_mode == 'theme_layout' ){
	// 				// テーマ編集では `broccoli_module_packages` をロードする。
	// 				pathModuleDir = _this.documentRoot+_this.theme_id+'/broccoli_module_packages/';
	// 			}
	// 			if( typeof(pathModuleDir) != typeof('') ){
	// 				// モジュールフォルダの指定がない場合
	// 				rlv();
	// 				return;
	// 			}
	// 			pathModuleDir = require('path').resolve( px2ce.entryScript, '..', pathModuleDir )+'/';
	// 			if( !utils79.is_dir(pathModuleDir) ){
	// 				// 指定されたモジュールフォルダが存在しない場合
	// 				rlv();
	// 				return;
	// 			}

	// 			// info.json を読み込み
	// 			var infoJson = {};
	// 			if( utils79.is_file(pathModuleDir+'/info.json') ){
	// 				try {
	// 					var srcInfoJson = require('fs').readFileSync(pathModuleDir+'/info.json');
	// 					infoJson = JSON.parse(srcInfoJson);
	// 				} catch (e) {
	// 					console.error('Failed to info.json; '+pathModuleDir+'/info.json');
	// 				}
	// 			}
	// 			if( typeof(infoJson.sort) == typeof([]) ){
	// 				// 並び順の指定がある場合
	// 				for( var idx in infoJson.sort ){
	// 					if( pathsModuleTemplate[infoJson.sort[idx]] ){
	// 						// 既に登録済みのパッケージIDは上書きしない
	// 						// (= paths_module_template の設定を優先)
	// 						continue;
	// 					}
	// 					if( utils79.is_dir(pathModuleDir+infoJson.sort[idx]) ){
	// 						pathsModuleTemplate[infoJson.sort[idx]] = pathModuleDir+infoJson.sort[idx];
	// 					}
	// 				}
	// 			}

	// 			// モジュールディレクトリ中のパッケージをスキャンして一覧に追加
	// 			var fileList = require('fs').readdirSync(pathModuleDir);
	// 			fileList.sort(); // sort
	// 			for( var idx in fileList ){
	// 				if( pathsModuleTemplate[fileList[idx]] ){
	// 					// 既に登録済みのパッケージIDは上書きしない
	// 					// (= paths_module_template の設定を優先)
	// 					continue;
	// 				}
	// 				if( utils79.is_dir(pathModuleDir+fileList[idx]) ){
	// 					pathsModuleTemplate[fileList[idx]] = pathModuleDir+fileList[idx];
	// 				}
	// 			}

	// 			rlv();
	// 		}); })
	// 		.then(function(){ return new Promise(function(rlv, rjt){
	// 			if( _this.target_mode == 'theme_layout' ){
	// 				bindTemplate = function(htmls, callback){
	// 					var fin = '';
	// 					for( var bowlId in htmls ){
	// 						if( bowlId == 'main' ){
	// 							fin += htmls['main'];
	// 						}else{
	// 							fin += "\n";
	// 							fin += "\n";
	// 							fin += '<'.'?php ob_start(); ?'.'>'+"\n";
	// 							fin += (utils79.toStr(htmls[bowlId]).length ? htmls[bowlId]+"\n" : '');
	// 							fin += '<'.'?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?'.'>'+"\n";
	// 							fin += "\n";
	// 						}
	// 					}
	// 					var template = '<%- body %>';
	// 					var pathThemeLayout = _this.documentRoot+_this.theme_id+'/broccoli_module_packages/_layout.html';
	// 					if(utils79.is_file(pathThemeLayout)){
	// 						template = fs.readFileSync( pathThemeLayout ).toString();
	// 					}else{
	// 						template = fs.readFileSync( __dirname+'/tpls/broccoli_theme_layout.html' ).toString();
	// 					}
	// 					fin = ejs.render(template, {'body': fin}, {delimiter: '%'});

	// 					var baseDir = _this.documentRoot+_this.theme_id+'/theme_files/';
	// 					fsx.ensureDirSync( baseDir );
	// 					_this.getModuleCssJsSrc(_this.theme_id, function(CssJs){
	// 						fs.writeFileSync(baseDir+'modules.css', CssJs.css);
	// 						fs.writeFileSync(baseDir+'modules.js', CssJs.js);
	// 						callback(fin);
	// 					});

	// 					return;
	// 				}
	// 			}else{
	// 				bindTemplate = function(htmls, callback){
	// 					var fin = '';
	// 					for( var bowlId in htmls ){
	// 						if( bowlId == 'main' ){
	// 							fin += htmls['main'];
	// 						}else{
	// 							fin += "\n";
	// 							fin += "\n";
	// 							fin += '<'.'?php ob_start(); ?'.'>'+"\n";
	// 							fin += (utils79.toStr(htmls[bowlId]).length ? htmls[bowlId]+"\n" : '');
	// 							fin += '<'.'?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?'.'>'+"\n";
	// 							fin += "\n";
	// 						}
	// 					}
	// 					callback(fin);
	// 					return;
	// 				}
	// 			}
	// 			rlv();
	// 		}); })
	// 		.then(function(){ return new Promise(function(rlv, rjt){

	// 			broccoliInitializeOptions = {
	// 				'appMode': px2ce.getAppMode() ,
	// 				'paths_module_template': pathsModuleTemplate ,
	// 				'documentRoot': documentRoot,// realpath
	// 				'pathHtml': require('path').resolve(_this.contRoot, './'+page_content),
	// 				'pathResourceDir': _this.pathResourceDir,
	// 				'realpathDataDir':  _this.realpathDataDir,
	// 				'contents_bowl_name_by': px2conf.plugins.px2dt.contents_bowl_name_by,
	// 				'customFields': customFields ,
	// 				'bindTemplate': bindTemplate,
	// 				'log': function(msg){
	// 					// エラー発生時にコールされます。
	// 					px2ce.log(msg);
	// 				}
	// 			}
	// 			rlv();
	// 			return;
	// 		}); })
	// 		.then(function(){
	// 			callback( broccoliInitializeOptions );
	// 			return;
	// 		})
	// 	;

	// 	return;
	// }

	// /**
	//  * create broccoli-html-editor object
	//  */
	// this.createBroccoli = function(callback){
	// 	callback = callback||function(){};
	// 	var broccoliInitializeOptions = {};
	// 	var Broccoli = require('broccoli-html-editor');
	// 	var broccoli = new Broccoli();

	// 	new Promise(function(rlv){rlv();})
	// 		.then(function(){ return new Promise(function(rlv, rjt){
	// 			_this.createBroccoliInitOptions(function(opts){
	// 				broccoliInitializeOptions = opts;
	// 				rlv();
	// 			});
	// 			return;
	// 		}); })
	// 		.then(function(){ return new Promise(function(rlv, rjt){

	// 			broccoli.init(
	// 				broccoliInitializeOptions,
	// 				function(){
	// 					rlv();
	// 				}
	// 			);
	// 			return;
	// 		}); })
	// 		.then(function(){
	// 			callback(broccoli);
	// 		})
	// 	;
	// 	return;
	// }

	/**
	 * 汎用API
	 */
	public function gpi($data){
		$gpi = new gpi($this);
		return $gpi->gpi($data);
	}

	// /**
	//  * ログファイルにメッセージを出力する
	//  */
	// this.log = function(msg){
	// 	this.options.log(msg);
	// 	return;
	// }

	/**
	 * Pickles 2 にリクエストを発行し、結果を受け取る
	 *
	 * @param string $request_path リクエストを発行する対象のパス
	 * @param array $options Pickles 2 へのコマンド発行時のオプション
	 * - output = 期待する出力形式。`json` を指定すると、リクエストに `-o json` オプションが加えられ、JSON形式で解析済みのオブジェクトが返されます。
	 * - user_agent = `HTTP_USER_AGENT` 文字列。 `user_agent` が空白の場合、または文字列 `PicklesCrawler` を含む場合には、パブリッシュツールからのアクセスであるとみなされます。
	 * @param int &$return_var コマンドの終了コードで上書きされます
	 * @return mixed リクエストの実行結果。
	 * 通常は 得られた標準出力をそのまま文字列として返します。
	 * `output` オプションに `json` が指定された場合、 `json_decode()` された値が返却されます。
	 *
	 * リクエストから標準エラー出力を検出した場合、 `$px->error( $stderr )` に転送します。
	 */
	private function px2query($request_path, $options = null, &$return_var = null){
		if(!is_string($request_path)){
			// $this->error('Invalid argument supplied for 1st option $request_path in $px->internal_sub_request(). It required String value.');
			return false;
		}
		if(!strlen($request_path)){ $request_path = '/'; }
		if(is_null($options)){ $options = array(); }
		$php_command = array();
		array_push( $php_command, addslashes($this->php_command['php']) );
			// ↑ Windows でこれを `escapeshellarg()` でエスケープすると、なぜかエラーに。

		if( strlen(@$this->php_command['php_ini']) ){
			$php_command = array_merge(
				$php_command,
				array(
					'-c', escapeshellarg(@$this->php_command['php_ini']),// ← php.ini のパス
				)
			);
		}
		if( strlen(@$this->php_command['php_extension_dir']) ){
			$php_command = array_merge(
				$php_command,
				array(
					'-d', escapeshellarg(@$this->php_command['php_extension_dir']),// ← php.ini definition
				)
			);
		}
		array_push($php_command, escapeshellarg( realpath($this->entryScript) ));
		if( @$options['output'] == 'json' ){
			array_push($php_command, '-o');
			array_push($php_command, 'json');
		}
		if( @strlen($options['user_agent']) ){
			array_push($php_command, '-u');
			array_push($php_command, escapeshellarg($options['user_agent']));
		}
		array_push($php_command, escapeshellarg($request_path));


		$cmd = implode( ' ', $php_command );

		// コマンドを実行
		ob_start();
		$proc = proc_open($cmd, array(
			0 => array('pipe','r'),
			1 => array('pipe','w'),
			2 => array('pipe','w'),
		), $pipes);
		$io = array();
		foreach($pipes as $idx=>$pipe){
			$io[$idx] = stream_get_contents($pipe);
			fclose($pipe);
		}
		$return_var = proc_close($proc);
		ob_get_clean();

		$bin = $io[1]; // stdout
		if( strlen( $io[2] ) ){
			$this->error($io[2]); // stderr
		}

		if( @$options['output'] == 'json' ){
			$bin = json_decode($bin);
		}

		return $bin;
	}

}
