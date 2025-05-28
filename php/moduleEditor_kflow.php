<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Module: kflow Editor
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class moduleEditor_kflow{

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
	 * モジュールをビルドする
	 */
	public function build(){
		$module_id = $this->px2ce->get_module_id();
		$module_info = $this->px2ce->get_broccoli_module_info($module_id);
		$realpath_module_dir = $module_info->realpath.urlencode($module_info->category_id).'/'.urlencode($module_info->module_id).'/';

		$result = array(
			'result' => true,
			'message' => 'OK'
		);

		$src_kflo = null;
		if( is_file( $realpath_module_dir.'src/template.kflow' ) ){
			$src_kflow = file_get_contents($realpath_module_dir.'src/template.kflow');
		}
		if( $src_kflow === null ){
			$result['result'] = false;
			$result['message'] = 'Template file not found.';
			return $result;
		}

		$extraValues = array();

		$kaleflower = new \kaleflower\kaleflower();
		$kaleflower->loadXml( $src_kflow );
		$kflowResult = $kaleflower->build(
			array(
				'assetsPrefix' => './template_files/resources/',
				'extra' => $extraValues,
			)
		);

		// --------------------------------------
		// HTMLを保存
		$template_html = $kflowResult->html->main ?? '';
		if( !$this->is_authorized_server_side_scripting ){
			$template_html = $this->sanitizer->sanitize($template_html);
		}
		$realpath_template_html = $realpath_module_dir.'template.html.twig';
		$this->px2ce->fs()->save_file( $realpath_template_html, $template_html );

		// --------------------------------------
		// CSSを保存
		$src_css = $kflowResult->css ?? '';
		if( !$this->is_authorized_server_side_scripting ){
			$src_css = $this->sanitizer->sanitize($src_css);
		}
		$realpath_scss = $realpath_module_dir.'module.css.scss';
		if( !strlen($src_css ?? '') ){
			$this->px2ce->fs()->rm( $realpath_scss );
		}else{
			$this->px2ce->fs()->save_file( $realpath_scss, $src_css );
		}

		// --------------------------------------
		// JSを保存
		$src_js = $kflowResult->js ?? '';
		if( !$this->is_authorized_server_side_scripting ){
			$src_js = $this->sanitizer->sanitize($src_js);
		}
		$realpath_js = $realpath_module_dir.'module.js';
		if( !strlen($src_js ?? '') ){
			$this->px2ce->fs()->rm( $realpath_js );
		}else{
			$this->px2ce->fs()->save_file( $realpath_js, $src_js );
		}

		return $result;
	}

}
