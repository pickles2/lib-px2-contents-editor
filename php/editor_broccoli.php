<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Broccoli Editor
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class editor_broccoli{

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
	 * broccoliBridge
	 */
	public function bridge($data){
		$is_authorized_server_side_scripting = (
			is_object($this->px2ce->px()->authorizer)
				? $this->px2ce->px()->authorizer->is_authorized('server_side_scripting')
				: true
		);
		$sanitizer = new sanitizer($this->px2ce);

		// --------------------------------------
		// 権限がない場合に、危険なコードを無害化する
		if( $data['forBroccoli']['api'] == 'saveContentsData' ){
			if( !$is_authorized_server_side_scripting ){
				$tmp_data_json = json_encode($data['forBroccoli']['options']['data'], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
				$tmp_data_json = $sanitizer->sanitize_contents($tmp_data_json);
				$data['forBroccoli']['options']['data'] = json_decode($tmp_data_json, true);
			}
		}


		// --------------------------------------
		// Broccoliの処理
		$broccoli = $this->px2ce->createBroccoli();
		$rtn = $broccoli->gpi(
			$data['forBroccoli']['api'],
			$data['forBroccoli']['options']
		);


		// --------------------------------------
		// カスタムCSS/JS がある場合に、ロードさせる
		if( $data['forBroccoli']['api'] == 'buildHtml' ){
			$custom_css_js = new custom_css_js($this->px2ce);
			$_targetPaths = $custom_css_js->generateTargetFilePath();
			if( $_targetPaths === false ){
				return $rtn;
			}

			$_contentsPath = $_targetPaths['contentsPath'];
			$realpath_resource_dir = $_targetPaths['realpathFiles'];
			$strLoaderCSS = $_targetPaths['strLoaderCSS'];
			$strLoaderJS = $_targetPaths['strLoaderJS'];

			if( !is_file($realpath_resource_dir.'style.css') && !is_file($realpath_resource_dir.'style.css.scss') ){
				$strLoaderCSS = '';
			}
			if( !is_file($realpath_resource_dir.'script.js') ){
				$strLoaderJS = '';
			}

			if( strlen($strLoaderCSS.$strLoaderJS) ){
				if( $this->px2ce->get_target_mode() == 'theme_layout' ){
					$src_html = $this->px2ce->fs()->read_file($_contentsPath);
					$src_html = str_replace( $strLoaderCSS, '', $src_html );
					$src_html = str_replace( $strLoaderJS, '', $src_html );
					$src_html = preg_replace( '/(\s*\<\/head\>)/s', $strLoaderCSS.$strLoaderJS.'$1', $src_html );
					$this->px2ce->fs()->save_file($_contentsPath, $src_html);

				}
			}
		}
		return $rtn;
	}
}
