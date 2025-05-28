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

		// TODO: ビルド処理をここに実装する

		return $result;
	}

}
