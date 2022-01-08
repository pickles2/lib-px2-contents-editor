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
class main {

	/** Pickles 2 オブジェクト */
	private $px;

	/** Filesystem Utility */
	private $fs;

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
	 * Constructor
	 *
	 * @param object $px Pickles 2 オブジェクト
	 */
	public function __construct( $px = null ){
		$this->px = $px;
		$this->fs = new \tomk79\filesystem();
	}

	/**
	 * Initialize
	 */
	public function init( $options ){
		// var_dump(options);
		if( !is_array($options) ){
			$options = array();
		}
		if( !array_key_exists('appMode', $options) || !strlen( ''.$options['appMode'] ) ){
			$options['appMode'] = 'web'; // web | desktop
		}
		if( !array_key_exists('customFields', $options) || !is_array( $options['customFields'] ) ){
			$options['customFields'] = array(); // custom fields
		}
		if( !array_key_exists('userStorage', $options) || !is_callable( $options['userStorage'] ) ){
			$options['userStorage'] = null; // User Storage I/O
		}
		if( !array_key_exists('log', $options) || !is_callable( $options['log'] ) ){
			$options['log'] = function($msg){
				// var_dump($msg);
			};
		}
		$this->php_command = array(
			'php'=>'php',
			'php_ini'=>null,
			'php_extension_dir'=>null,
		);
		if( array_key_exists('php', $options) && strlen(''.$options['php']) ){
			$this->php_command['php'] = $options['php'];
		}
		if( array_key_exists('php_ini', $options) && strlen(''.$options['php_ini']) ){
			$this->php_command['php_ini'] = $options['php_ini'];
		}
		if( array_key_exists('php_extension_dir', $options) && strlen(''.$options['php_extension_dir']) ){
			$this->php_command['php_extension_dir'] = $options['php_extension_dir'];
		}

		$this->entryScript = $options['entryScript'];
		$this->target_mode = (@strlen(''.$options['target_mode']) ? $options['target_mode'] : 'page_content');
		$this->page_path = @$options['page_path'];
		if( !is_string($this->page_path) ){
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

		$this->find_autoload_custom_fields();

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

	/**
	 * $fs
	 */
	public function fs(){
		return $this->fs;
	}

	/**
	 * $target_mode を取得
	 */
	public function get_target_mode(){
		return $this->target_mode;
	}

	/**
	 * $theme_id を取得
	 */
	public function get_theme_id(){
		return $this->theme_id;
	}

	/**
	 * $layout_id を取得
	 */
	public function get_layout_id(){
		return $this->layout_id;
	}

	/**
	 * クライアントリソースの一覧を取得する
	 * 
	 * @param string $realpath_dist リソースファイルの出力先。
	 * 省略時は、各ファイルのサーバー内部パスを返す。
	 * @return object css および js ファイルの一覧
	 */
	public function get_client_resources($realpath_dist = null){
		$path_vendor = $this->get_realpath_vendor();

		$rtn = json_decode('{"css": [], "js": []}');


		// broccoli-html-editor
		if(is_string($realpath_dist) && is_dir($realpath_dist)){
			$this->fs->copy_r($path_vendor.'/broccoli-html-editor/broccoli-html-editor/client/dist/', $realpath_dist.'/broccoli/');
			array_push($rtn->js, 'broccoli/broccoli.js');
			array_push($rtn->css, 'broccoli/broccoli.css');
		}else{
			array_push($rtn->js, realpath($path_vendor.'/broccoli-html-editor/broccoli-html-editor/client/dist/broccoli.js'));
			array_push($rtn->css, realpath($path_vendor.'/broccoli-html-editor/broccoli-html-editor/client/dist/broccoli.css'));
		}

		// px2ce
		if(is_string($realpath_dist) && is_dir($realpath_dist)){
			$this->fs->copy_r(__DIR__.'/../dist/', $realpath_dist.'/px2ce/');
			array_push($rtn->js, 'px2ce/pickles2-contents-editor.min.js');
			array_push($rtn->css, 'px2ce/pickles2-contents-editor.min.css');
		}else{
			array_push($rtn->js, realpath(__DIR__.'/../dist/pickles2-contents-editor.min.js'));
			array_push($rtn->css, realpath(__DIR__.'/../dist/pickles2-contents-editor.min.css'));
		}

		// broccoli-field-table
		if(is_string($realpath_dist) && is_dir($realpath_dist)){
			$this->fs->copy_r($path_vendor.'/broccoli-html-editor/broccoli-field-table/dist/', $realpath_dist.'/broccoli-field-table/');
			array_push($rtn->js, 'broccoli-field-table/broccoli-field-table.js');
			array_push($rtn->css, 'broccoli-field-table/broccoli-field-table.css');
		}else{
			array_push($rtn->js, realpath($path_vendor.'/broccoli-html-editor/broccoli-field-table/dist/broccoli-field-table.js'));
			array_push($rtn->css, realpath($path_vendor.'/broccoli-html-editor/broccoli-field-table/dist/broccoli-field-table.css'));
		}

		// プロジェクト定義のカスタムフィールドを追加
		$confCustomFields = @$this->px2conf->plugins->px2dt->guieditor->custom_fields;
		$realpath_contRoot = dirname( $this->entryScript );
		if( is_dir($realpath_dist) && !is_dir($realpath_dist.'/custom_fields/') ){
			$this->fs->mkdir($realpath_dist.'/custom_fields/');
		}
		if(is_object($confCustomFields)){
			foreach( $confCustomFields as $fieldName=>$field ){
				$path_client_lib_dir = @$confCustomFields->{$fieldName}->frontend->dir;
				$path_client_lib_dir = $this->fs->get_realpath($path_client_lib_dir, $realpath_contRoot);
				if(is_string($realpath_dist) && is_dir($realpath_dist) && @$confCustomFields->{$fieldName}->frontend->dir){
					$this->fs->copy_r($path_client_lib_dir, $realpath_dist.'/custom_fields/'.urlencode($fieldName).'/');
				}

				$paths_client_lib = @$confCustomFields->{$fieldName}->frontend->file;
				if(is_string($paths_client_lib)){
					$paths_client_lib = array( $paths_client_lib );
				}
				if( is_array($paths_client_lib) && count($paths_client_lib) ){
					foreach($paths_client_lib as $path_client_lib){
						if(!$path_client_lib){ continue; }
						preg_match( '/\.([a-zA-Z0-9]*)$/', $path_client_lib, $matched );
						$ext = @strtolower($matched[1]);

						if(is_string($realpath_dist) && is_dir($realpath_dist) ){
							if(@$confCustomFields->{$fieldName}->frontend->dir){
								if( $ext == 'css' ){
									array_push($rtn->css, 'custom_fields/'.urlencode($fieldName).'/'.$path_client_lib);
								}elseif( $ext == 'js' ){
									array_push($rtn->js, 'custom_fields/'.urlencode($fieldName).'/'.$path_client_lib);
								}
							}else{
								$path_client_lib = $this->fs->get_realpath($path_client_lib, realpath($path_client_lib_dir));
								$tmp_res_local_path = 'custom_fields/'.urlencode($fieldName).'/'.urlencode(basename($path_client_lib));
								$this->fs->copy_r($path_client_lib, $realpath_dist.'/'.$tmp_res_local_path);
								if( $ext == 'css' ){
									array_push($rtn->css, $tmp_res_local_path);
								}elseif( $ext == 'js' ){
									array_push($rtn->js, $tmp_res_local_path);
								}
							}
						}else{
							$path_client_lib = $this->fs->get_realpath($path_client_lib, realpath($path_client_lib_dir));
							if( $ext == 'css' ){
								array_push($rtn->css, $path_client_lib);
							}elseif( $ext == 'js' ){
								array_push($rtn->js, $path_client_lib);
							}
						}
					}
				}
			}
		}

		// dropped_file_operator 定義のJSを追加
		$droppedFileOperator = @$this->px2conf->plugins->px2dt->guieditor->dropped_file_operator;
		$realpath_contRoot = dirname( $this->entryScript );
		if( is_dir($realpath_dist) && !is_dir($realpath_dist.'/dropped_file_operator/') ){
			$this->fs->mkdir($realpath_dist.'/dropped_file_operator/');
		}
		if(is_object($droppedFileOperator)){
			foreach( $droppedFileOperator as $extOrMimetypeName=>$frontend ){
				$path_client_lib_dir = @$droppedFileOperator->{$extOrMimetypeName}->dir;
				$path_client_lib_dir = $this->fs->get_realpath($path_client_lib_dir, $realpath_contRoot);
				if(is_string($realpath_dist) && is_dir($realpath_dist) && @$droppedFileOperator->{$extOrMimetypeName}->dir){
					$this->fs->copy_r($path_client_lib_dir, $realpath_dist.'/dropped_file_operator/'.urlencode($extOrMimetypeName).'/');
				}

				$paths_client_lib = @$droppedFileOperator->{$extOrMimetypeName}->file;
				if(is_string($paths_client_lib)){
					$paths_client_lib = array( $paths_client_lib );
				}
				if( is_array($paths_client_lib) && count($paths_client_lib) ){
					foreach($paths_client_lib as $path_client_lib){
						if(!$path_client_lib){ continue; }
						preg_match( '/\.([a-zA-Z0-9]*)$/', $path_client_lib, $matched );
						$ext = @strtolower($matched[1]);

						$extOrMimetypeName = preg_replace('/[^a-zA-Z0-9\-\_]/', '__', $extOrMimetypeName);

						if(is_string($realpath_dist) && is_dir($realpath_dist) ){
							if(@$droppedFileOperator->{$extOrMimetypeName}->dir){
								if( $ext == 'css' ){
									array_push($rtn->css, 'dropped_file_operator/'.urlencode($extOrMimetypeName).'/'.$path_client_lib);
								}elseif( $ext == 'js' ){
									array_push($rtn->js, 'dropped_file_operator/'.urlencode($extOrMimetypeName).'/'.$path_client_lib);
								}
							}else{
								$path_client_lib = $this->fs->get_realpath($path_client_lib, realpath($path_client_lib_dir));
								$tmp_res_local_path = 'dropped_file_operator/'.urlencode($extOrMimetypeName).'/'.urlencode(basename($path_client_lib));
								$this->fs->copy_r($path_client_lib, $realpath_dist.'/'.$tmp_res_local_path);
								if( $ext == 'css' ){
									array_push($rtn->css, $tmp_res_local_path);
								}elseif( $ext == 'js' ){
									array_push($rtn->js, $tmp_res_local_path);
								}
							}
						}else{
							$path_client_lib = $this->fs->get_realpath($path_client_lib, realpath($path_client_lib_dir));
							if( $ext == 'css' ){
								array_push($rtn->css, $path_client_lib);
							}elseif( $ext == 'js' ){
								array_push($rtn->js, $path_client_lib);
							}
						}
					}
				}
			}
		}

		return $rtn;
	}

	/**
	 * vendorフォルダのパスを取得
	 */
	public function get_realpath_vendor(){
		static $path_vendor = null;
		if(!is_null($path_vendor)){
			return $path_vendor;
		}

		$path_vendor = __DIR__;
		while(1){
			if( realpath($path_vendor) === realpath(dirname($path_vendor)) ){
				break;
			}
			if( is_file($path_vendor.'/vendor/autoload.php') ){
				$path_vendor = $this->fs->get_realpath($path_vendor.'/vendor/');
				break;
			}
			$path_vendor = dirname($path_vendor);
		}
		return $path_vendor;
	}

	/**
	 * プロジェクトの設定情報を取得する
	 */
	public function get_project_conf(){
		return $this->px2conf;
	}

	/**
	 * アプリケーションの実行モード設定を取得する
	 * @return string 'web'|'desktop'
	 */
	public function get_app_mode(){
		$rtn = $this->options['appMode'];
		switch($rtn){
			case 'web':
			case 'desktop':
				break;
			default:
				$rtn = 'web';
				break;
		}
		return $rtn;
	}

	/**
	 * $realpathFiles
	 */
	public function get_realpath_files(){
		return $this->realpathFiles;
	}

	/**
	 * $documentRoot
	 */
	public function get_document_root(){
		return $this->documentRoot;
	}

	/**
	 * $page_path
	 */
	public function get_page_path(){
		return $this->page_path;
	}

	/**
	 * $contRoot
	 */
	public function get_cont_root(){
		return $this->contRoot;
	}

	/**
	 * $options
	 */
	public function options(){
		return $this->options;
	}

	/**
	 * ブラウザでURLを開く
	 */
	public function openUrlInBrowser( $url ){
		if( $this->get_app_mode() != 'desktop' ){
			return false;
		}
		if( realpath('/') == '/' ){
			// Linux or macOS
			exec('open '.escapeshellarg($url));
		}else{
			// Windows
			exec(escapeshellcmd('explorer '.escapeshellarg($url)));
		}
		return true;
	}

	/**
	 * リソースフォルダを開く
	 */
	public function openResourceDir( $path ){
		if( $this->get_app_mode() != 'desktop' ){
			return false;
		}
		if( !is_dir($this->realpathFiles) ){
			$this->fs()->mkdir($this->realpathFiles);
		}
		$realpath_target = $this->fs()->get_realpath($this->realpathFiles.'/'.$path);
		if( !is_dir(dirname($realpath_target)) ){
			$this->fs()->mkdir(dirname($realpath_target));
		}

		if( realpath('/') == '/' ){
			// Linux or macOS
			exec('open '.escapeshellarg($realpath_target));
		}else{
			// Windows
			exec(escapeshellcmd('explorer '.escapeshellarg($realpath_target)));
		}
		return true;
	}

	/**
	 * プロジェクト情報をまとめて取得する
	 */
	private function getProjectInfo(){
		$pjInfo = array();

		if( is_object($this->px) ){
			$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );
			$pjInfo['conf'] = $this->px->conf();
			$pjInfo['pageInfo'] = $this->px->site()->get_page_info( $this->page_path );
			$pjInfo['contRoot'] = $this->px->get_path_controot();
			$pjInfo['documentRoot'] = $this->px->get_realpath_docroot();
			$pjInfo['realpathFiles'] = $px2dthelper->realpath_files( $this->page_path );
			$pjInfo['realpathDataDir'] = $px2dthelper->get_realpath_data_dir( $this->page_path );
			$pjInfo['pathResourceDir'] = $px2dthelper->get_path_resource_dir( $this->page_path );
			// $pjInfo['pathFiles'] = $px2dthelper->path_files( $this->page_path );
			// $pjInfo['realpath_homedir'] = $this->px->get_realpath_homedir();
			$pjInfo['realpathThemeCollectionDir'] = $px2dthelper->get_realpath_theme_collection_dir();

			$pjInfo = (array) json_decode( json_encode( $pjInfo ), false );

		}else{
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
			$pjInfo['realpathDataDir'] = $allData->realpath_data_dir;
			$pjInfo['pathResourceDir'] = $allData->path_resource_dir;
			// $pjInfo['pathFiles'] = $allData->path_files;
			// $pjInfo['realpath_homedir'] = $allData->realpath_homedir;
			$pjInfo['realpathThemeCollectionDir'] = $allData->realpath_theme_collection_dir;
		}

		// var_dump($pjInfo);
		return $pjInfo;
	} // getProjectInfo()

	/**
	 * 自動ロードのカスタムフィールドを検索する
	 */
	private function find_autoload_custom_fields(){
		if( !@is_object($this->px2conf->plugins->px2dt->guieditor->custom_fields) ){
			@$this->px2conf->plugins->px2dt->guieditor->custom_fields = json_decode('{}');
		}
		$realpath_vendor = $this->get_realpath_vendor();
		foreach($this->fs->ls( $realpath_vendor ) as $vendor){
			if( !is_dir($realpath_vendor.$vendor.'/') ){
				continue;
			}
			foreach($this->fs->ls( $realpath_vendor.$vendor.'/' ) as $package){
				if( is_file($realpath_vendor.$vendor.'/'.$package.'/broccoli.json') ){
					$realpath_json = $realpath_vendor.$vendor.'/'.$package.'/broccoli.json';
					try{
						$json = json_decode( file_get_contents($realpath_json) );
						$ary = array();
						if( !is_array($json) ){
							array_push($ary, $json);
						}else{
							$ary = $json;
						}
						foreach( $ary as $item ){
							if( $item->type != 'field' ){
								// fieldではない
								continue;
							}
							if( !property_exists($item, 'id') || !strlen(''.$item->id) ){
								// IDが未設定
								continue;
							}
							if( property_exists($this->px2conf->plugins->px2dt->guieditor->custom_fields, $item->id) ){
								// すでに登録済みのID
								continue;
							}
							$this->px2conf->plugins->px2dt->guieditor->custom_fields->{$item->id} = json_decode('{}');
							$this->px2conf->plugins->px2dt->guieditor->custom_fields->{$item->id}->name = $item->name;
							$this->px2conf->plugins->px2dt->guieditor->custom_fields->{$item->id}->backend = $item->backend;
							$this->px2conf->plugins->px2dt->guieditor->custom_fields->{$item->id}->frontend = $item->frontend;
							$realpath = $this->fs->get_realpath( $item->frontend->dir, dirname($realpath_json).'/' );
							$this->px2conf->plugins->px2dt->guieditor->custom_fields->{$item->id}->frontend->dir = $realpath;
							if( property_exists( $item->backend, 'require' ) ){
								$realpath = $this->fs->get_realpath( $item->backend->require, dirname($realpath_json).'/' );
								$this->px2conf->plugins->px2dt->guieditor->custom_fields->{$item->id}->backend->require = $realpath;
							}
						}
					}catch(\Exception $e){
					}
				}
			}
		}
		return true;
	}

	/**
	 * モジュールCSS,JSソースを取得する
	 */
	public function getModuleCssJsSrc($theme_id = null){
		if(!strlen(''.$theme_id)){
			$theme_id = '';
		}
		$rtn = array(
			'css' => '',
			'js' => ''
		);
		$data = $this->px2query(
			'/?PX=px2dthelper.document_modules.build_css&theme_id='.urlencode($theme_id)
		);

		// var_dump($data);
		$rtn['css'] .= $data;

		$data = $this->px2query(
			'/?PX=px2dthelper.document_modules.build_js&theme_id='.urlencode($theme_id)
		);

		// var_dump($data);
		$rtn['js'] .= $data;

		return $rtn;
	} // getModuleCssJsSrc

	/**
	 * ローカルCSS,JSソースを取得する
	 */
	public function getLocalCssJsSrc($theme_id = null, $layout_id = null){
		if(!strlen(''.$theme_id)){
			$theme_id = '';
		}
		$rtn = array(
			'css' => '',
			'js' => ''
		);
		$this->px2query('/?THEME='.urlencode($theme_id).'&LAYOUT='.urlencode($layout_id)); // キャッシュ生成のため

		$public_cache_dir = $this->px2conf->public_cache_dir;
		$public_cache_dir = preg_replace('/^\/*/', '/', $public_cache_dir);
		$public_cache_dir = preg_replace('/\/*$/', '/', $public_cache_dir);

		$data = $this->px2query(
			$public_cache_dir.'p/theme/'.urlencode($theme_id).'/layouts/'.urlencode($layout_id).'/style.css',
			array('output'=>'json')
		);
		if( $data->status == 200 ){
			$rtn['css'] .= base64_decode($data->body_base64);
		}

		$data = $this->px2query(
			$public_cache_dir.'p/theme/'.urlencode($theme_id).'/layouts/'.urlencode($layout_id).'/script.js',
			array('output'=>'json')
		);
		if( $data->status == 200 ){
			$rtn['js'] .= base64_decode($data->body_base64);
		}

		return $rtn;
	} // getLocalCssJsSrc

	/**
	 * コンテンツファイルを初期化する
	 */
	public function init_content_files($editorMode){
		$data = $this->px2query(
			$this->page_path.'?PX=px2dthelper.init_content&editor_mode='.urlencode($editorMode),
			array(
				"output" => "json"
			)
		);
		return $data;
	}

	/**
	 * ページの編集方法を取得する
	 */
	public function check_editor_mode(){
		if( $this->target_mode == 'theme_layout' ){
			// ドキュメントルートの設定上書きがある場合
			// テーマレイアウトの編集等に利用するモード
			// var_dump([$this->documentRoot,
			// 	$this->contRoot,
			// 	$this->realpathFiles,
			// 	$this->pathResourceDir,
			// 	$this->realpathDataDir]);

			if( !is_file( $this->documentRoot . $this->page_path ) ){
				return '.not_exists';
			}
			if( is_file( $this->realpathDataDir . 'data.json' ) ){
				return 'html.gui';
			}
			return 'html';
		}
		$data = $this->px2query(
			$this->page_path.'?PX=px2dthelper.check_editor_mode',
			array(
				"output" => "json"
			)
		);
		// var_dump($data);
		return $data;
	}

	/**
	 * create initialize options for broccoli-html-editor
	 */
	public function createBroccoliInitOptions(){
		$broccoliInitializeOptions = array();
		$px2ce = $this;

		$page_path = $this->page_path;
		$px2conf = $this->px2conf;
		$pageInfo = $this->pageInfo;
		$contRoot = $this->contRoot;
		$documentRoot = $this->documentRoot;
		$realpathDataDir = $this->realpathDataDir;
		$pathResourceDir = $this->pathResourceDir;
		$pathsModuleTemplate = array();
		$bindTemplate = function(){};

		$customFields = array();
		$page_content = $this->page_path;
		if( strlen(''.@$pageInfo->content) ){
			$page_content = $pageInfo->content;
		}

		// フィールドを拡張

		// px2ce が拡張するフィールド
		$customFields['table'] = 'broccoliHtmlEditor\\broccoliFieldTable\\main';

		// 呼び出し元アプリが拡張するフィールド
		foreach( $this->options['customFields'] as $idx=>$customField ){
			$customFields[$idx] = $this->options['customFields'][$idx];
		}

		// プロジェクトが拡張するフィールド
		$confCustomFields = @$px2conf->plugins->px2dt->guieditor->custom_fields;
		if(is_object($confCustomFields)){
			foreach( $confCustomFields as $fieldName=>$field ){
				if( @$confCustomFields->{$fieldName}->backend->class ){
					$customFields[$fieldName] = $confCustomFields->{$fieldName}->backend->class;
				}
			}
		}

		// var_dump($customFields);

		// モジュールテンプレートを収集
		// (指定モジュールをロード)
		if( $this->target_mode == 'theme_layout' ){
			// テーマ編集ではスキップ
		}else{
			$tmp_paths_module_template = @$px2conf->plugins->px2dt->paths_module_template;
			if( is_array($tmp_paths_module_template) || is_object($tmp_paths_module_template) ){
				foreach( $tmp_paths_module_template as $idx=>$path_module_template ){
					$pathsModuleTemplate[$idx] = $this->fs()->get_realpath( $path_module_template.'/', dirname($this->entryScript) );
				}
			}
		}

		// モジュールテンプレートを収集
		// (モジュールフォルダからロード)
		$pathModuleDir = @$px2conf->plugins->px2dt->path_module_templates_dir;
		if( $this->target_mode == 'theme_layout' ){
			// テーマ編集では `broccoli_module_packages` をロードする。
			$pathModuleDir = $this->documentRoot.$this->theme_id.'/broccoli_module_packages/';
		}
		if( !is_string($pathModuleDir) ){
			// モジュールフォルダの指定がない場合
		}else{
			$pathModuleDir = $this->fs()->get_realpath( $pathModuleDir.'/', dirname($this->entryScript) );
			if( !is_dir($pathModuleDir) ){
				// 指定されたモジュールフォルダが存在しない場合
			}else{
				// info.json を読み込み
				$infoJson = array();
				if( is_file($pathModuleDir.'/info.json') ){
					$srcInfoJson = file_get_contents($pathModuleDir.'/info.json');
					$infoJson = json_decode($srcInfoJson);
				}
				if( is_array(@$infoJson->sort) ){
					// 並び順の指定がある場合
					foreach( $infoJson->sort as $idx=>$row ){
						if( @$pathsModuleTemplate[$infoJson->sort[$idx]] ){
							// 既に登録済みのパッケージIDは上書きしない
							// (= paths_module_template の設定を優先)
							continue;
						}
						if( is_dir($pathModuleDir.$infoJson->sort[$idx]) ){
							$pathsModuleTemplate[$infoJson->sort[$idx]] = $pathModuleDir.$infoJson->sort[$idx];
						}
					}
				}

				// モジュールディレクトリ中のパッケージをスキャンして一覧に追加
				$fileList = $this->fs()->ls($pathModuleDir);
				sort($fileList); // sort
				foreach( $fileList as $idx=>$row){
					if( @$pathsModuleTemplate[$fileList[$idx]] ){
						// 既に登録済みのパッケージIDは上書きしない
						// (= paths_module_template の設定を優先)
						continue;
					}
					if( is_dir($pathModuleDir.$fileList[$idx]) ){
						$pathsModuleTemplate[$fileList[$idx]] = $pathModuleDir.$fileList[$idx];
					}
				}
			}
		}

		if( $this->target_mode == 'theme_layout' ){
			$bindTemplate = function($htmls){
				$fin = '';
				foreach( $htmls as $bowlId=>$html ){
					if( $bowlId == 'main' ){
						$fin .= $htmls['main'];
					}else{
						$fin .= "\n";
						$fin .= "\n";
						$fin .= '<'.'?php ob_start(); ?'.'>'."\n";
						$fin .= (strlen(''.$htmls[$bowlId]) ? $htmls[$bowlId]."\n" : '');
						$fin .= '<'.'?php $px->bowl()->send( ob_get_clean(), '.json_encode($bowlId).' ); ?'.'>'."\n";
						$fin .= "\n";
					}
				}
				$template = '<'.'%- body %'.'>';
				$pathThemeLayout = $this->documentRoot.$this->theme_id.'/broccoli_module_packages/_layout.html';
				if(is_file($pathThemeLayout)){
					$template = file_get_contents( $pathThemeLayout );
				}else{
					$template = file_get_contents( __DIR__.'/tpls/broccoli_theme_layout.html' );
				}
				// PHP では ejs は使えないので、単純置換することにした。
				// $fin = $ejs.render($template, {'body': $fin}, {'delimiter': '%'});
				$fin = str_replace('<'.'%- body %'.'>', $fin, $template);

				$baseDir = $this->documentRoot.$this->theme_id.'/theme_files/';
				$this->fs()->mkdir_r( $baseDir );
				$CssJs = $this->getModuleCssJsSrc($this->theme_id);

				$this->fs()->save_file($baseDir.'modules.css', $CssJs['css']);
				$this->fs()->save_file($baseDir.'modules.js', $CssJs['js']);
				return $fin;
			};
		}else{
			$bindTemplate = function($htmls){
				$fin = '';
				$realpathFiles = $this->fs()->get_realpath($this->get_realpath_files());
				if( is_file($realpathFiles.'style.css') || is_file($realpathFiles.'style.css.scss') ){
					$fin .= '<'.'?php ob_start(); ?'.'><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?'.'>" /><'.'?php $px->bowl()->put( ob_get_clean(), \'head\' );?'.'>'."\n";
				}
				if( is_file($realpathFiles.'script.js') ){
					$fin .= '<'.'?php ob_start(); ?'.'><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?'.'>"></script><'.'?php $px->bowl()->put( ob_get_clean(), \'foot\' );?'.'>'."\n";
				}

				foreach( $htmls as $bowlId=>$html ){
					if( $bowlId == 'main' ){
						$fin .= $htmls['main'];
					}else{
						$fin .= "\n";
						$fin .= "\n";
						$fin .= '<'.'?php ob_start(); ?'.'>'."\n";
						$fin .= (strlen(''.$htmls[$bowlId]) ? $htmls[$bowlId]."\n" : '');
						$fin .= '<'.'?php $px->bowl()->send( ob_get_clean(), '.json_encode($bowlId).' ); ?'.'>'."\n";
						$fin .= "\n";
					}
				}

				return $fin;
			};
		}

		$broccoliInitializeOptions = array(
			'appMode' => $this->get_app_mode() ,
			'paths_module_template' => $pathsModuleTemplate ,
			'documentRoot' => $documentRoot,// realpath
			'pathHtml' => $this->fs()->get_realpath($this->contRoot.'/'.$page_content),
			'pathResourceDir' => $this->pathResourceDir,
			'realpathDataDir' =>  $this->realpathDataDir,
			'contents_bowl_name_by' => @$px2conf->plugins->px2dt->contents_bowl_name_by,
			'customFields' => $customFields ,
			'userStorage' => $this->options['userStorage'],
			'fieldConfig' => @(array) $px2conf->plugins->px2dt->guieditor->field_config,
			'bindTemplate' => $bindTemplate,
			'log' => function($msg){
				// エラー発生時にコールされます。
				// px2ce.log(msg);
			}
		);

		return $broccoliInitializeOptions;
	}

	/**
	 * create broccoli-html-editor object
	 */
	public function createBroccoli(){
		$broccoliInitializeOptions = $this->createBroccoliInitOptions();
		$broccoli = new \broccoliHtmlEditor\broccoliHtmlEditor();
		$broccoli->init($broccoliInitializeOptions);
		return $broccoli;
	}

	/**
	 * 汎用API
	 */
	public function gpi($data){
		$gpi = new gpi($this);
		return $gpi->gpi($data);
	}

	/**
	 * ログファイルにメッセージを出力する
	 */
	public function log($msg){
		$this->options['log']($msg);
		return;
	}

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
	public function px2query($request_path, $options = null, &$return_var = null){
		if( !is_string($request_path) ){
			// $this->error('Invalid argument supplied for 1st option $request_path in $px->internal_sub_request(). It required String value.');
			return false;
		}
		if( !strlen(''.$request_path) ){ $request_path = '/'; }
		if( is_null($options) ){ $options = array(); }
		$php_command = array();
		array_push( $php_command, addslashes($this->php_command['php']) );
			// ↑ Windows でこれを `escapeshellarg()` でエスケープすると、なぜかエラーに。

		if( isset( $this->php_command['php_ini'] ) && strlen( ''.$this->php_command['php_ini'] ) ){
			$php_command = array_merge(
				$php_command,
				array(
					'-c', escapeshellarg($this->php_command['php_ini']),// ← php.ini のパス
				)
			);
		}
		if( isset( $this->php_command['php_extension_dir'] ) && strlen( ''.$this->php_command['php_extension_dir'] ) ){
			$php_command = array_merge(
				$php_command,
				array(
					'-d', escapeshellarg($this->php_command['php_extension_dir']),// ← php.ini definition
				)
			);
		}
		array_push($php_command, escapeshellarg( realpath($this->entryScript) ));
		if( isset( $options['output'] ) && $options['output'] == 'json' ){
			array_push($php_command, '-o');
			array_push($php_command, 'json');
		}
		if( isset( $options['user_agent'] ) && strlen( ''.$options['user_agent'] ) ){
			array_push($php_command, '-u');
			array_push($php_command, escapeshellarg($options['user_agent']));
		}
		if( realpath('/') == '/' ){
			// Linux
			array_push($php_command, escapeshellarg($request_path));
		}else{
			// Windows
			array_push($php_command, escapeshellcmd($request_path));
		}


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
			$io[$idx] = null;
			if( $idx >= 1 ){
				$io[$idx] = stream_get_contents($pipe);
			}
			fclose($pipe);
		}
		$return_var = proc_close($proc);
		ob_get_clean();

		$bin = $io[1]; // stdout
		if( strlen( ''.$io[2] ) ){
			// $this->error($io[2]); // stderr
		}

		if( is_array($options) && array_key_exists('output', $options) && $options['output'] == 'json' ){
			$bin = json_decode($bin);
		}

		return $bin;
	}

}
