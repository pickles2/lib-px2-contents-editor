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
		$broccoli = $this->px2ce->createBroccoli();
		$rtn = $broccoli->gpi(
			$data['forBroccoli']['api'],
			$data['forBroccoli']['options']
		);
		return $rtn;
	}
}
