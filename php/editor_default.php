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

		$_targetPaths = $this->generateTargetFilePath();
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

		$result = array(
			'result' => true,
			'message' => 'OK'
		);

		$_targetPaths = $this->generateTargetFilePath();
		if( $_targetPaths === false ){
			return false;
		}

		$_contentsPath = $_targetPaths['contentsPath'];
		$realpath_resource_dir = $_targetPaths['realpathFiles'];

		// HTMLファイルを保存
		if( array_key_exists('html', $codes) ){
			$strLoaderCSS = $_targetPaths['strLoaderCSS'];
			$strLoaderJS = $_targetPaths['strLoaderJS'];

			if( !strlen(''.$codes['css']) ){
				$strLoaderCSS = '';
			}
			if( !strlen(''.$codes['js']) ){
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
			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['css']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir . '/style.css.scss' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir . '/style.css.scss', $codes['css'] );
			}
		}

		// JSファイルを保存
		if( array_key_exists('js', $codes) ){
			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen(''.$codes['js']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir . '/script.js' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir . '/script.js', $codes['js'] );
			}
		}

		return $result;
	}

	/**
	 * 編集対象のパス情報を生成する
	 */
	private function generateTargetFilePath(){
		$page_path = $this->px2ce->get_page_path();
		if(is_null($page_path)){
			return false;
		}
		$rtn = array(
			'realpathFiles' => $this->px2ce->fs()->get_realpath($this->px2ce->get_realpath_files()),
			'contentsPath' => $this->px2ce->fs()->get_realpath($this->px2ce->get_document_root().$this->px2ce->get_cont_root().$page_path),
			'strLoaderCSS' => '<'.'?php ob_start(); ?'.'><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?'.'>" /><'.'?php $px->bowl()->put( ob_get_clean(), \'head\' );?'.'>'."\n",
			'strLoaderJS' => '<'.'?php ob_start(); ?'.'><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?'.'>"></script><'.'?php $px->bowl()->put( ob_get_clean(), \'foot\' );?'.'>'."\n"
		);
		if( !is_file($rtn['contentsPath']) ){
			$tmp_ary_exts = array_keys((array) $this->px2ce->get_project_conf()->funcs->processor);
			foreach( $tmp_ary_exts as $tmpExt ){
				if( is_file($rtn['contentsPath'].'.'.$tmpExt) ){
					$rtn['contentsPath'] = $rtn['contentsPath'].'.'.$tmpExt;
					break;
				}
			}
			unset($tmp_ary_exts, $tmpExt);
		}

		if( $this->px2ce->get_target_mode() == 'theme_layout' ){
			$tmpPathThemeLayoutDir = '/layouts/'.urlencode($this->px2ce->get_layout_id()).'/';
			$rtn['strLoaderCSS'] = '<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files(\''.$tmpPathThemeLayoutDir.'style.css\') ) ?'.'>" />'."\n";
			$rtn['strLoaderJS'] = '<script src="<?= htmlspecialchars( $theme->files(\''.$tmpPathThemeLayoutDir.'script.js\') ) ?'.'>"></script>'."\n";
		}

		$pageInfo = $this->px2ce->px2query( $page_path.'?PX=api.get.page_info&path='.urlencode($page_path), array('output'=>'json') );
		if( $pageInfo == null ){
			if( !is_file($rtn['contentsPath']) ){
				return false;
			}
		}
		$contPath = $this->px2ce->px2query($page_path.'?PX=api.get.path_content', array('output'=>'json'));

		// var_dump($contPath);
		if( !is_file($rtn['contentsPath']) ){
			$rtn['contentsPath'] = $this->px2ce->fs()->get_realpath($this->px2ce->get_document_root().$this->px2ce->get_cont_root().$contPath);
		}
		return $rtn;
	}


}
