<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Default Editor
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class editor_default{

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
	 * コンテンツのソースを取得する
	 */
	public function getContentsSrc(){

		$rtn = array(
			'html' => '',
			'css' => '',
			'js' => ''
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
			$rtn['html'] = file_get_contents($_contentsPath);
			$rtn['html'] = str_replace( $strLoaderCSS, '', $rtn['html'] );
			$rtn['html'] = str_replace( $strLoaderJS, '', $rtn['html'] );

			// ↓古いメソッド名も削除
			$rtn['html'] = str_replace( '<'.'?php ob_start(); ?'.'><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?'.'>" /><'.'?php $px->bowl()->send( ob_get_clean(), \'head\' );?'.'>'."\n", '', $rtn['html'] );
			$rtn['html'] = str_replace( '<'.'?php ob_start(); ?'.'><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?'.'>"></script><'.'?php $px->bowl()->send( ob_get_clean(), \'foot\' );?'.'>'."\n", '', $rtn['html'] );
		}

		if( is_file( $realpath_resource_dir . '/style.css.scss' ) ){
			$rtn['css'] = file_get_contents( $realpath_resource_dir . '/style.css.scss' );
		}

		if( is_file( $realpath_resource_dir . '/script.js' ) ){
			$rtn['js'] = file_get_contents( $realpath_resource_dir . '/script.js' );
		}

		return $rtn;
	}

	/**
	 * コンテンツのソースを保存する
	 */
	public function saveContentsSrc($codes){
		$is_authorized_server_side_scripting = (
			is_object($this->px2ce->px()->authorizer)
				? $this->px2ce->px()->authorizer->is_authorized('server_side_scripting')
				: true
		);
		$sanitizer = new sanitizer($this->px2ce);

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
		if( array_key_exists('html', $codes) ){
			if( !$is_authorized_server_side_scripting ){
				$codes['html'] = $sanitizer->sanitize_contents($codes['html']);
			}

			$strLoaderCSS = $_targetPaths['strLoaderCSS'];
			$strLoaderJS = $_targetPaths['strLoaderJS'];

			$codes['html'] = str_replace( $strLoaderCSS, '', $codes['html'] );
			$codes['html'] = str_replace( $strLoaderJS, '', $codes['html'] );

			if( !strlen($codes['css'] ?? '') ){
				$strLoaderCSS = '';
			}
			if( !strlen($codes['js'] ?? '') ){
				$strLoaderJS = '';
			}

			if( $this->px2ce->get_target_mode() == 'theme_layout' ){
				$codes['html'] = preg_replace( '/(\s*\<\/head\>)/s', $strLoaderCSS.$strLoaderJS.'$1', $codes['html'] );
				$this->px2ce->fs()->save_file($_contentsPath, $codes['html']);
			}else{
				$this->px2ce->fs()->save_file($_contentsPath, $strLoaderCSS . $strLoaderJS . $codes['html']);
			}
		}

		// CSSファイルを保存
		if( array_key_exists('css', $codes) ){
			if( !$is_authorized_server_side_scripting ){
				$codes['css'] = $sanitizer->sanitize_contents($codes['css']);
			}

			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['css']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir . '/style.css.scss' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir . '/style.css.scss', $codes['css'] );
			}
		}

		// JSファイルを保存
		if( array_key_exists('js', $codes) ){
			if( !$is_authorized_server_side_scripting ){
				$codes['js'] = $sanitizer->sanitize_contents($codes['js']);
			}

			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['js']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir . '/script.js' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir . '/script.js', $codes['js'] );
			}
		}

		return $result;
	}

}
