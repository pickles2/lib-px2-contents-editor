<?php
// var_dump('project custom field 1 - backend.js');
class projectCustom1 extends \broccoliHtmlEditor\fieldBase{

	private $broccoli;

	public function __construct($broccoli){
		$this->broccoli = $broccoli;
		parent::__construct($broccoli);
	}

	/**
	 * データをバインドする
	 */
	public function bind( $fieldData, $mode, $mod ){
		$rtn = '';
		if(is_array($fieldData) && is_string(@$fieldData['src'])){
			$rtn = $fieldData['src'];

			switch( $fieldData['editor'] ){
				case 'text':
					$rtn = htmlspecialchars( $rtn ); // ←HTML特殊文字変換
					$rtn = preg_replace('/\r\n|\r|\n/s', '<br />', $rtn); // ← 改行コードは改行タグに変換
					break;
				case 'markdown':
					$rtn = $this->broccoli->markdown($rtn);
					break;
				case 'html':
				default:
					break;
			}
		}
		if( $mode == 'canvas' && !strlen($rtn) ){
			$rtn = '<span style="color:#999;background-color:#ddd;font-size:10px;padding:0 1em;max-width:100%;overflow:hidden;white-space:nowrap;">(ダブルクリックしてテキストを編集してください)</span>';
		}

		return $rtn;
	}

	/**
	 * データを正規化する
	 */
	public function normalizeData( $fieldData, $mode ){
		// 編集画面用にデータを初期化。
		$rtn = array();
		if( is_array($fieldData) ){
			$rtn = $fieldData;
		}else if( is_string($fieldData) ){
			$rtn['src'] = $fieldData;
			$rtn['editor'] = 'markdown';
		}
		return $rtn;
	}

}
