<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Sanitizer
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class sanitizer {

	/**
	 * $px2ce
	 */
	private $px2ce;

	/** サニタイズパターン */
	private $patterns = array(
		array(
			'pattern' => '/\<\?php/',
			'replace_to' => '<!-- ?php',
		),
		array(
			'pattern' => '/\<\?\=/',
			'replace_to' => '<!-- ?=',
		),
		array(
			'pattern' => '/\<\?/',
			'replace_to' => '<!-- ?',
		),
		array(
			'pattern' => '/\?\>/',
			'replace_to' => '? -->',
		),

		// NOTE: server_side_scripting 権限がなくても許容する記述を除外する
		array(
			'pattern' => '/\<\!\-\- (\?\= \$px\-\>h\(\$px\-\>path_files\(\"[a-zA-Z0-9\/\-\_\.]+\"\)\) \?) \-\-\>/',
			'replace_to' => '<'.'$1'.'>',
		),
	);

	/**
	 * Constructor
	 */
	public function __construct( $px2ce ){
		$this->px2ce = $px2ce;
	}

	/**
	 * サニタイズが望まれる記述が含まれるか？
	 *
	 * @param string $src 検査対象のソースコード
	 * @return boolean 検査結果。望まれる記述が発見された場合に true, 無毒だった場合に false。
	 */
	public function is_sanitize_desired($src){
		$src_check = $src;

		// NOTE: server_side_scripting 権限がなくても許容する記述を除外する
		$src_check = preg_replace('/\<(\?\= \$px\-\>h\(\$px\-\>path_files\(\"[a-zA-Z0-9\/\-\_\.]+\"\)\) \?)\>/', '', $src_check);

		$result = false;
		foreach($this->patterns as $pattern){
			if( preg_match($pattern['pattern'], $src_check) ){
				$result = true;
				break;
			}
		}
		return $result;
	}

	/**
	 * 編集されたコンテンツの解毒
	 *
	 * @param string $src 検査対象のソースコード
	 * @return string 解毒済みのソースコード
	 */
	public function sanitize_contents($src){
		foreach($this->patterns as $pattern){
			$src = preg_replace($pattern['pattern'], $pattern['replace_to'], $src);
		}
		return $src;
	}

}
