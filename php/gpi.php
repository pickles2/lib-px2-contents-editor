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
	 * Current page information
	 */
	private $current_page_info;

	/**
	 * Constructor
	 */
	public function __construct( $px2ce, $current_page_info ){
		$this->px2ce = $px2ce;
		$this->current_page_info = $current_page_info;
	}

	/**
	 * Initialize
	 */
	public function gpi( $data ){
		$data = json_decode( json_encode($data), true );

		switch($data['api']){
			case "getBootupInfomations":
				// 初期起動時に必要なすべての情報を取得する
				$bootup = array();
				$bootup['conf'] = array();
				$bootup['conf']['appMode'] = $this->px2ce->get_app_mode();
				$bootup['conf']['target_mode'] = $this->px2ce->get_target_mode();
				if($bootup['conf']['target_mode'] == 'theme_layout'){
					$bootup['conf']['theme_id'] = $this->px2ce->get_theme_id();
					$bootup['conf']['layout_id'] = $this->px2ce->get_layout_id();
				}elseif($bootup['conf']['target_mode'] == 'module'){
					$bootup['conf']['module_id'] = $this->px2ce->get_module_id();
				}

				$bootup['languageCsv'] = file_get_contents( __DIR__.'/../data/language.csv' );
				$bootup['editorMode'] = $this->px2ce->check_editor_mode();
				$bootup['projectConf'] = $this->px2ce->get_project_conf();

				// プロジェクトが拡張した broccoli-fields のクライアントサイドスクリプトを取得
				// ※ get_client_resources() により事前ロードしてもらう方針に変更。この機能は廃止する予定。
				$bootup['customFieldsClientSideLibs'] = array();
				$code = '';
				$code = 'data:text/javascript;base64,'.base64_encode($code);
				array_push($bootup['customFieldsClientSideLibs'], $code);

				$bootup['pagesByLayout'] = array();
				$layout_id = (strlen($data['layout_id'] ?? '') ? $data['layout_id'] : 'default');
				$sitemap = $this->px2ce->px2query('/?PX=api.get.sitemap', array("output"=>"json"));

				foreach($sitemap as $idx=>$page_info){
					$page_layout_id = $sitemap->{$idx}->layout ?? 'default';
					if( $page_layout_id == $layout_id ){
						array_push( $bootup['pagesByLayout'], $sitemap->{$idx} );
					}
				}

				$bootup['current_page_info'] = $this->current_page_info;

				// navigationInfo
				$px = $this->px2ce->px();
				if( is_object($px) ){
					$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $px );
					$bootup['navigationInfo'] = $px2dthelper->get_navigation_info( $this->current_page_info->path ?? '/', array('filter' => false,) );
				}else{
					$bootup['navigationInfo'] = $this->px2query(
						($this->current_page_info->path ?? '/').'?PX=px2dthelper.get.navigation_info&filter=false',
						array(
							"output" => "json"
						)
					);
				}

				// コンテンツテンプレート
				if( is_object($px) ){
					$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $px );
					$cTpl = new \tomk79\pickles2\px2dthelper\fncs\contentsTemplate\contentsTemplate( $px2dthelper, $px );
					$bootup['contentsTemplates'] = $cTpl->get_list();
				}else{
					$bootup['contentsTemplates'] = $this->px2ce->px2query(
						'/?PX=px2dthelper.contents_template.get_list',
						array("output"=>"json")
					);
				}

				// 編集権限をチェック
				$bootup['permission'] = true;
				$src_check_target = array();
				switch( $bootup['editorMode'] ){
					case '.page_not_exists':
					case '.not_exists':
						break;
					case 'kflow':
						$realpath_data_kflow = $this->px2ce->fs()->get_realpath($this->px2ce->get_realpath_files().'guieditor.ignore/data.kflow');
						if( is_file($realpath_data_kflow) ){
							$src_check_target['html'] = file_get_contents($realpath_data_kflow);
						}
						break;
					case 'html.gui':
						$realpath_data_json = $this->px2ce->fs()->get_realpath($this->px2ce->get_realpath_files().'guieditor.ignore/data.json');
						if( is_file($realpath_data_json) ){
							$src_check_target['html'] = file_get_contents($realpath_data_json);
						}
						break;
					default:
						$defaultEditor = new \pickles2\libs\contentsEditor\editor_default($this->px2ce);
						$src_check_target = $defaultEditor->getContentsSrc();
						break;
				}

				$is_authorized_server_side_scripting = (
					is_object($this->px2ce->px()->authorizer)
						? $this->px2ce->px()->authorizer->is_authorized('server_side_scripting')
						: true
				);
				if(!$is_authorized_server_side_scripting){
					$sanitizer = new sanitizer($this->px2ce);
					foreach($src_check_target as $src){
						if( $sanitizer->is_sanitize_desired($src) ){
							$bootup['permission'] = false;
							break;
						}
					}
				}

				$bootup['noimagePlaceholder'] = $this->px2ce->getNoimagePlaceholder();

				return $bootup;

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

			case "initContentFiles":
				// コンテンツファイルを初期化する
				$result = $this->px2ce->init_content_files($data['editor_mode']);
				return $result;
				break;

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

			case "saveContentsSrc":
				// コンテンツのソースを保存する
				$defaultEditor = new editor_default($this->px2ce);
				$result = $defaultEditor->saveContentsSrc($data['codes']);
				return $result;
				break;

			case "broccoliBridge":
				// Broccoliへの中継
				$broccoliBridge = new editor_broccoli($this->px2ce);
				$result = $broccoliBridge->bridge($data);
				return $result;
				break;

			case "kflowGetContentsSrc":
				// コンテンツのソースを取得する
				$kflowEditor = new editor_kflow($this->px2ce);
				$contentsCodes = $kflowEditor->getContentsSrc();
				return $contentsCodes;
				break;

			case "kflowSaveContentsSrc":
				// コンテンツのソースを保存する
				$kflowEditor = new editor_kflow($this->px2ce);
				$result = $kflowEditor->saveContentsSrc($data['codes']);
				return $result;
				break;

			case "getPathResources":
				// リソースディレクトリのパスを得る
				// これは、コンテンツにリソースへのリンクを埋め込むために使用する。
				$path_resource = $this->px2ce->px2query($data['page_path'].'?PX=api.get.path_files&path_resource=', array("output"=>"json"));
				return $path_resource;
				break;

			case 'savePageResources':
				// コンテンツのリソースファイルを保存する
				$realpath_resource = $this->px2ce->px2query($data['page_path'].'?PX=api.get.realpath_files&path_resource='.urlencode($data['filename']), array("output"=>"json"));
				$bin = $data['base64'];
				$bin = preg_replace('/^data\:.*?base64\,/', '', $bin);
				$bin = base64_decode($bin);

				$result = $this->px2ce->fs()->save_file($realpath_resource, $bin);
				return $result;
				break;

			case "getModuleCssJsSrc":
				// モジュールCSS,JSソースを取得する
				$results = $this->px2ce->getModuleCssJsSrc($data['theme_id']);
				return $results;
				break;

			case "getLocalCssJsSrc":
				// ローカルCSS,JSソースを取得する
				$results = $this->px2ce->getLocalCssJsSrc($data['theme_id'], $data['layout_id']);
				return $results;
				break;

			case "getPagesByLayout":
				// レイアウトからページの一覧を取得する
				$rtn = array();
				$layout_id = (strlen($data['layout_id'] ?? '') ? $data['layout_id'] : 'default');
				$sitemap = $this->px2ce->px2query('/?PX=api.get.sitemap', array("output"=>"json"));

				foreach($sitemap as $idx=>$page_info){
					$page_layout_id = (strlen($sitemap->{$idx}->layout ?? '') ? $sitemap->{$idx}->layout : 'default');
					if( $page_layout_id == $layout_id ){
						array_push( $rtn, $sitemap->{$idx} );
					}
				}
				return $rtn;
				break;

			case "openUrlInBrowser":
				$res = $this->px2ce->openUrlInBrowser($data['url']);
				return $res;
				break;

			case "openResourceDir":
				$res = $this->px2ce->openResourceDir('/');
				return $res;
				break;

			case "loadCustomFieldsClientSideLibs":
				// プロジェクトが拡張した broccoli-fields のクライアントサイドスクリプトを取得
				// ※ get_client_resources() により事前ロードしてもらう方針に変更。この機能は廃止する予定。
				$codes = array();
				$code = '';
				$code = 'data:text/javascript;base64,'.base64_encode($code);
				array_push($codes, $code);
				return $codes;
				break;

			case "getModuleSrc":
				// モジュールのソースを取得する
				$defaultEditor = new moduleEditor_default($this->px2ce);
				$contentsCodes = $defaultEditor->getModuleSrc();
				return $contentsCodes;
				break;

			case "saveModuleSrc":
				// モジュールのソースを保存する
				$defaultEditor = new moduleEditor_default($this->px2ce);
				$result = $defaultEditor->saveModuleSrc($data['codes']);
				return $result;
				break;

			case "buildKflowModule":
				// Kflowモジュールをビルドする
				$defaultEditor = new moduleEditor_kflow($this->px2ce);
				$result = $defaultEditor->build();
				return $result;
				break;

			default:
				return true;
				break;
		}

		return false;
	}


}
