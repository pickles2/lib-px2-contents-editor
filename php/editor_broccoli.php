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

		if( $data['forBroccoli']['api'] == 'saveContentsData' ){
			if( !$is_authorized_server_side_scripting ){
				$tmp_data_json = json_encode($data['forBroccoli']['options']['data'], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
				$tmp_data_json = $sanitizer->sanitize_contents($tmp_data_json);
				$data['forBroccoli']['options']['data'] = json_decode($tmp_data_json, true);
			}
		}

		$broccoli = $this->px2ce->createBroccoli();
		$rtn = $broccoli->gpi(
			$data['forBroccoli']['api'],
			$data['forBroccoli']['options']
		);
		return $rtn;
	}
}
