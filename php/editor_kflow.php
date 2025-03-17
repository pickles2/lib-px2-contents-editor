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
		$_kflowPath = $_targetPaths['contentsPath'];
		$realpath_resource_dir = $_targetPaths['realpathFiles'];
		$strLoaderCSS = $_targetPaths['strLoaderCSS'];
		$strLoaderJS = $_targetPaths['strLoaderJS'];

		if( $this->px2ce->get_target_mode() == 'theme_layout' ){
			$_kflowPath = $this->px2ce->get_realpath_data_dir().'data.kflow';
		}

		if( is_file( $_kflowPath ) ){
			$rtn['kflow'] = file_get_contents($_kflowPath);
			$rtn['kflow'] = str_replace( $strLoaderCSS, '', $rtn['kflow'] );
			$rtn['kflow'] = str_replace( $strLoaderJS, '', $rtn['kflow'] );
		}

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
		$_kflowPath = $_targetPaths['contentsPath'];
		$realpath_resource_dir = $_targetPaths['realpathFiles'];

		if( $this->px2ce->get_target_mode() == 'theme_layout' ){
			$_kflowPath = $this->px2ce->get_realpath_data_dir().'data.kflow';
		}


		if( $this->px2ce->get_target_mode() == 'theme_layout' ){

			// HTMLファイルを保存
			$this->px2ce->fs()->save_file($_kflowPath, $codes['kflow']);

			$kaleflower = new \kaleflower\kaleflower();
			$kflow_built = $kaleflower->build(
				$_kflowPath,
				array(
					'assetsPrefix' => './main_files/',
				)
			);

			if( !$this->is_authorized_server_side_scripting ){
				$kflow_built->html->main = $this->sanitizer->sanitize_contents($kflow_built->html->main);
			}
			$kflow_built->html->main = preg_replace( '/(\s*\<\/head\>)/s', $strLoaderCSS.$strLoaderJS.'$1', $kflow_built->html->main );
			$this->px2ce->fs()->save_file( $_contentsPath, $kflow_built->html->main );

			// CSSファイルを保存
			if( property_exists($kflow_built, 'css') ){
				if( !$this->is_authorized_server_side_scripting ){
					$kflow_built->css = $this->sanitizer->sanitize_contents($kflow_built->css);
				}

				$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
				if( !strlen($kflow_built->css) ){
					$this->px2ce->fs()->rm( $realpath_resource_dir.'/style.css.scss' );
				}else{
					$this->px2ce->fs()->save_file( $realpath_resource_dir.'/style.css.scss', $kflow_built->css );
				}
			}

			// JSファイルを保存
			if( property_exists($kflow_built, 'js') ){
				if( !$this->is_authorized_server_side_scripting ){
					$kflow_built->js = $this->sanitizer->sanitize_contents($kflow_built->js);
				}

				$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
				if( !strlen($kflow_built->js) ){
					$this->px2ce->fs()->rm( $realpath_resource_dir.'/script.js' );
				}else{
					$this->px2ce->fs()->save_file( $realpath_resource_dir.'/script.js', $kflow_built->js );
				}
			}
		}else{

			// HTMLファイルを保存
			if( array_key_exists('kflow', $codes) ){
				if( !$this->is_authorized_server_side_scripting ){
					$codes['kflow'] = $this->sanitizer->sanitize_contents($codes['kflow']);
				}
				$this->px2ce->fs()->save_file($_kflowPath, $codes['kflow']);
			}
		}

		return $result;
	}

}
