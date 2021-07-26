<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * cache class
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class cache {

	/** Pickles 2 オブジェクト */
	private $px;

    /** キャッシュの保存先パス */
    private $realpath_cache;

	/**
	 * Constructor
	 *
	 * @param object $px Pickles 2 オブジェクト
	 */
	public function __construct( $px = null ){
		$this->px = $px;

        if( !$px ){
            return;
        }
		$this->realpath_cache = $px->get_path_homedir();
	}

}
