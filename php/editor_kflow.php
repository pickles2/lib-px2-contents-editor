<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Kaleflower Editor
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class editor_kflow{

	/**
	 * $px2ce
	 */
	private $px2ce;

	private $sanitizer;
	private $is_authorized_server_side_scripting;

	/**
	 * Constructor
	 */
	public function __construct( $px2ce ){
		$this->px2ce = $px2ce;

		$this->is_authorized_server_side_scripting = (
			is_object($this->px2ce->px()->authorizer)
				? $this->px2ce->px()->authorizer->is_authorized('server_side_scripting')
				: true
		);

		$this->sanitizer = new sanitizer($this->px2ce);
	}

	/**
	 * コンテンツのソースを取得する
	 */
	public function getContentsSrc(){

		$rtn = array(
			'kflow' => '',
		);

		$custom_css_js = new custom_css_js($this->px2ce);
		$_targetPaths = $custom_css_js->generateTargetFilePath();
		if( $_targetPaths === false ){
			return false;
		}

		$_contentsPath = $_targetPaths['contentsPath'];
		$realpath_resource_dir = $_targetPaths['realpathFiles'];
		$strLoaderCSS = $_targetPaths['strLoaderCSS'];
		$strLoaderJS = $_targetPaths['strLoaderJS'];

		if( is_file( $_contentsPath ) ){
			$rtn['kflow'] = file_get_contents($_contentsPath);
		}

		$kaleflower = new \kaleflower\kaleflower();
		$kaleflower->loadXml( $rtn['kflow'] );

		// Contents modules for Kaleflower
		$realpath_kflow_components_dir = $this->px2ce->fs()->get_realpath($this->px2ce->px()->get_realpath_homedir().'kflow/modules/');
		if( is_dir($realpath_kflow_components_dir) ){
			$kflow_component_files = $this->px2ce->fs()->ls($realpath_kflow_components_dir);
			foreach( $kflow_component_files as $kflow_component_file ){
				if( is_file($realpath_kflow_components_dir.$kflow_component_file) ){
					$kaleflower->load( $realpath_kflow_components_dir.$kflow_component_file );
				}
			}
		}

		// Theme modules for Kaleflower
		if( $this->px2ce->get_target_mode() == 'theme_layout' ){
			$realpath_kflow_components_dir = $this->px2ce->fs()->get_realpath($this->px2ce->get_document_root().$this->px2ce->get_cont_root().$this->px2ce->get_theme_id().'/kflow/modules/');
			if( is_dir($realpath_kflow_components_dir) ){
				$kflow_component_files = $this->px2ce->fs()->ls($realpath_kflow_components_dir);
				foreach( $kflow_component_files as $kflow_component_file ){
					if( is_file($realpath_kflow_components_dir.$kflow_component_file) ){
						$kaleflower->load( $realpath_kflow_components_dir.$kflow_component_file );
					}
				}
			}
		}

		$rtn['kflow'] = $kaleflower->getXml();

		return $rtn;
	}

	/**
	 * コンテンツのソースを保存する
	 */
	public function saveContentsSrc($codes){
		$result = array(
			'result' => true,
			'message' => 'OK'
		);

		$custom_css_js = new custom_css_js($this->px2ce);
		$_targetPaths = $custom_css_js->generateTargetFilePath();
		if( $_targetPaths === false ){
			return false;
		}

		$_contentsPath = $_targetPaths['contentsPath'];
		$realpath_resource_dir = $_targetPaths['realpathFiles'];

		// HTMLファイルを保存
		if( array_key_exists('kflow', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['kflow'] = $this->sanitizer->sanitize_contents($codes['kflow']);
			}
			$this->px2ce->fs()->save_file($_contentsPath, $codes['kflow']);
		}

		return $result;
	}

}
