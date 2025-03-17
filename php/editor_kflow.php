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

		// HTMLファイルを保存
		if( array_key_exists('kflow', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['kflow'] = $this->sanitizer->sanitize_contents($codes['kflow']);
			}

			$strLoaderCSS = $_targetPaths['strLoaderCSS'];
			$strLoaderJS = $_targetPaths['strLoaderJS'];

			$codes['kflow'] = str_replace( $strLoaderCSS, '', $codes['kflow'] );
			$codes['kflow'] = str_replace( $strLoaderJS, '', $codes['kflow'] );

			if( !strlen($codes['css'] ?? '') ){
				$strLoaderCSS = '';
			}
			if( !strlen($codes['js'] ?? '') ){
				$strLoaderJS = '';
			}

			if( $this->px2ce->get_target_mode() == 'theme_layout' ){
				$codes['kflow'] = preg_replace( '/(\s*\<\/head\>)/s', $strLoaderCSS.$strLoaderJS.'$1', $codes['kflow'] );
				$this->px2ce->fs()->save_file($_kflowPath, $codes['kflow']);
			}else{
				$this->px2ce->fs()->save_file($_kflowPath, $strLoaderCSS.$strLoaderJS.$codes['kflow']);
			}
		}

		// CSSファイルを保存
		if( array_key_exists('css', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['css'] = $this->sanitizer->sanitize_contents($codes['css']);
			}

			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['css']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir.'/style.css' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir.'/style.css', $codes['css'] );
			}
		}

		// JSファイルを保存
		if( array_key_exists('js', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['js'] = $this->sanitizer->sanitize_contents($codes['js']);
			}

			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['js']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir.'/script.js' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir.'/script.js', $codes['js'] );
			}
		}

		return $result;
	}

}
