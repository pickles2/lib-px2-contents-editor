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

			case "initContentFiles":
				// コンテンツファイルを初期化する
				// var_dump($data);
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
				$broccoliBridge = new editor_broccoli($this->px2ce);
				$result = $broccoliBridge->bridge($data);
				return $result;
				break;

			case "getModuleCssJsSrc":
				// モジュールCSS,JSソースを取得する
				$results = $this->px2ce->getModuleCssJsSrc($data['theme_id']);
				return $results;
				break;

			case "getPagesByLayout":
				// レイアウトからページの一覧を取得する
				$rtn = array();
				$layout_id = (strlen(@$data['layout_id']) ? $data['layout_id'] : 'default');
				$sitemap = $this->px2ce->px2query('/?PX=api.get.sitemap', array("output"=>"json"));

				foreach($sitemap as $idx=>$page_info){
					$page_layout_id = (strlen(@$sitemap[$idx]->layout) ? $sitemap[$idx]->layout : 'default');
					if( $page_layout_id == $layout_id ){
						array_push( $rtn, $sitemap[$idx] );
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
				if(@$this->px2ce->options()['customFieldsIncludePath'] && strlen($this->px2ce->options()['customFieldsIncludePath'])){
					$confCustomFields = $this->px2ce->options()['customFieldsIncludePath'];
					return $confCustomFields;
					break;
				}
				$conf = $this->px2ce->get_project_conf();

				$codes = array();
				$code = '';

				$confCustomFields = @$conf->plugins->px2dt->guieditor->custom_fields;
				foreach($confCustomFields as $fieldName=>$field){
					// TODO: 設計についてあとで見直します。
					// if( $confCustomFields[$fieldName]->frontend->file && $confCustomFields[$fieldName]->frontend->function ){
					// 	$pathJs = $this->px2ce->fs()->get_realpath(dirname($this->px2ce->entryScript).'/'.$confCustomFields[$fieldName]->frontend->file);
					// 	$binJs = file_get_contents( $pathJs );
					// 	$code .= '/**'."\n";
					// 	$code .= ' * '.$fieldName."\n";
					// 	$code .= ' */'."\n";
					// 	$code .= $binJs."\n";
					// 	$code .= ''."\n";
					// }
				}

				$code = 'data:text/javascript;base64,'.base64_encode($code);
				array_push($codes, $code);

				return $codes;
				break;

			default:
				return true;
				break;
		}

		return false;
	}


}
