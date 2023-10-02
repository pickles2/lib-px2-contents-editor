<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Custom CSS/JS
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class custom_css_js {

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
	 * 編集対象のパス情報を生成する
	 */
	public function generateTargetFilePath(){
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
			// 2重拡張子の検索
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

		if( !is_file($rtn['contentsPath']) ){
			$rtn['contentsPath'] = $this->px2ce->fs()->get_realpath($this->px2ce->get_document_root().$this->px2ce->get_cont_root().$contPath);
		}
		return $rtn;
	}
}
