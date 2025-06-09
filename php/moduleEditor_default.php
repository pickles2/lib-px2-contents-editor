<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Module: Default Editor
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class moduleEditor_default{

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
	public function getModuleSrc(){
		$module_id = $this->px2ce->get_module_id();
		$module_info = $this->px2ce->get_broccoli_module_info($module_id);
		$realpath_module_dir = $module_info->realpath.urlencode($module_info->category_id).'/'.urlencode($module_info->module_id).'/';

		$filelist = array(
			'README.md',
			'README.html',
			'info.json',
			'language.csv',
			'template.html',
			'template.html.twig',
			'src/template.kflow',
			'module.css.scss',
			'module.js',
			'finalize.php',
			'finalize.js',
			'clip.json',
		);
		$rtn = array();
		foreach($filelist as $filename){
			if( is_file( $realpath_module_dir.$filename ) ){
				$rtn[$filename] = file_get_contents($realpath_module_dir.$filename);
			}
		}

		return $rtn;
	}

	/**
	 * コンテンツのソースを保存する
	 */
	public function saveModuleSrc($codes){
		$module_id = $this->px2ce->get_module_id();
		$module_info = $this->px2ce->get_broccoli_module_info($module_id);
		$realpath_module_dir = $module_info->realpath.urlencode($module_info->category_id).'/'.urlencode($module_info->module_id).'/';
		$this->px2ce->fs()->mkdir_r( $realpath_module_dir );

		$result = array(
			'result' => true,
			'message' => 'OK'
		);

		$filelist = array(
			'README.md',
			'README.html',
			'info.json',
			'language.csv',
			'template.html',
			'template.html.twig',
			'src/template.kflow',
			'module.css.scss',
			'module.js',
			'finalize.php',
			'finalize.js',
			'clip.json',
		);
		$rtn = array();
		foreach($filelist as $filename){
			if( array_key_exists($filename, $codes) ){
				if( !$this->is_authorized_server_side_scripting ){
					$codes[$filename] = $this->sanitizer->sanitize_contents($codes[$filename]);
				}
				if( !strlen($codes[$filename] ?? '') ){
					$this->px2ce->fs()->rm( $realpath_module_dir.$filename );
				}else{
					$this->px2ce->fs()->save_file( $realpath_module_dir.$filename, $codes[$filename] );
				}
			}
		}

		return $result;
	}

}
