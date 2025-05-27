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

		$rtn = array(
			'readme' => '',
			'info' => '',
			'html' => '',
			'twig' => '',
			'kflow' => '',
			'css' => '',
			'js' => ''
		);

		if( is_file( $realpath_module_dir.'README.md' ) ){
			$rtn['readme'] = file_get_contents($realpath_module_dir.'README.md');
		}

		if( is_file( $realpath_module_dir.'info.json' ) ){
			$rtn['info'] = file_get_contents($realpath_module_dir.'info.json');
		}

		if( is_file( $realpath_module_dir.'template.html' ) ){
			$rtn['html'] = file_get_contents($realpath_module_dir.'template.html');
		}

		if( is_file( $realpath_module_dir.'template.html.twig' ) ){
			$rtn['twig'] = file_get_contents($realpath_module_dir.'template.html.twig');
		}

		if( is_file( $realpath_module_dir.'src/template.kflow' ) ){
			$rtn['kflow'] = file_get_contents($realpath_module_dir.'src/template.kflow');
		}

		if( is_file( $realpath_module_dir.'module.css.scss' ) ){
			$rtn['css'] = file_get_contents( $realpath_module_dir.'module.css.scss' );
		}

		if( is_file( $realpath_module_dir.'module.js' ) ){
			$rtn['js'] = file_get_contents( $realpath_module_dir.'module.js' );
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

		$result = array(
			'result' => true,
			'message' => 'OK'
		);

		// info.jsonファイルを保存
		if( array_key_exists('info', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['info'] = $this->sanitizer->sanitize_contents($codes['info']);
			}

			$this->px2ce->fs()->save_file($realpath_module_dir.'info.json', $codes['info']);
		}

		// READMEファイルを保存
		if( array_key_exists('readme', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['readme'] = $this->sanitizer->sanitize_contents($codes['readme']);
			}

			$this->px2ce->fs()->save_file($realpath_module_dir.'README.md', $codes['readme']);
		}

		// HTMLファイルを保存
		if( array_key_exists('html', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['html'] = $this->sanitizer->sanitize_contents($codes['html']);
			}

			$this->px2ce->fs()->save_file($realpath_module_dir.'template.html', $codes['html']);
		}

		// HTML(Twig)ファイルを保存
		if( array_key_exists('twig', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['twig'] = $this->sanitizer->sanitize_contents($codes['twig']);
			}

			$this->px2ce->fs()->save_file($realpath_module_dir.'template.html.twig', $codes['twig']);
		}

		// Kflowファイルを保存
		if( array_key_exists('kflow', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['kflow'] = $this->sanitizer->sanitize_contents($codes['kflow']);
			}

			$this->px2ce->fs()->save_file($realpath_module_dir.'src/template.kflow', $codes['kflow']);
		}

		// CSSファイルを保存
		if( array_key_exists('css', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['css'] = $this->sanitizer->sanitize_contents($codes['css']);
			}

			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['css']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir.'/module.css.scss' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir.'/module.css.scss', $codes['css'] );
			}
		}

		// JSファイルを保存
		if( array_key_exists('js', $codes) ){
			if( !$this->is_authorized_server_side_scripting ){
				$codes['js'] = $this->sanitizer->sanitize_contents($codes['js']);
			}

			$this->px2ce->fs()->mkdir_r( $realpath_resource_dir );
			if( !strlen($codes['js']) ){
				$this->px2ce->fs()->rm( $realpath_resource_dir.'/module.js' );
			}else{
				$this->px2ce->fs()->save_file( $realpath_resource_dir.'/module.js', $codes['js'] );
			}
		}

		return $result;
	}

}
