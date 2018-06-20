<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor;

/**
 * Default Editor
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class editor_default{

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
	 * コンテンツのソースを取得する
	 */
	public function getContentsSrc(){

		$rtn = array(
			'html' => '',
			'css' => '',
			'js' => ''
		);

		$_targetPaths = $this->generateTargetFilePath();
		if( $_targetPaths === false ){
			return false;
		}

		$_contentsPath = $_targetPaths['contentsPath'];
		$realpath_resource_dir = $_targetPaths['realpathFiles'];
		$strLoaderCSS = $_targetPaths['strLoaderCSS'];
		$strLoaderJS = $_targetPaths['strLoaderJS'];

		if( is_file( $_contentsPath ) ){
			$rtn['html'] = file_get_contents($_contentsPath);
			$rtn['html'] = str_replace( $strLoaderCSS, '', $rtn['html'] );
			$rtn['html'] = str_replace( $strLoaderJS, '', $rtn['html'] );

			// ↓古いメソッド名も削除
			$rtn['html'] = str_replace( '<'.'?php ob_start(); ?'.'><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?'.'>" /><'.'?php $px->bowl()->send( ob_get_clean(), \'head\' );?'.'>'."\n", '', $rtn['html'] );
			$rtn['html'] = str_replace( '<'.'?php ob_start(); ?'.'><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?'.'>"></script><'.'?php $px->bowl()->send( ob_get_clean(), \'foot\' );?'.'>'."\n", '', $rtn['html'] );
		}

		if( is_file( $realpath_resource_dir . '/style.css.scss' ) ){
			$rtn['css'] = file_get_contents( $realpath_resource_dir . '/style.css.scss' );
		}

		if( is_file( $realpath_resource_dir . '/script.js' ) ){
			$rtn['js'] = file_get_contents( $realpath_resource_dir . '/script.js' );
		}

		return $rtn;
	}

	// /**
	//  * コンテンツのソースを保存する
	//  */
	// this.saveContentsSrc = function(codes, callback){
	// 	callback = callback||function(){};
	// 	// var_dump(codes);

	// 	var result = {
	// 		'result': true,
	// 		'message': 'OK'
	// 	};

	// 	var _targetPaths;

	// 	new Promise(function(rlv){rlv();})
	// 		.then(function(){ return new Promise(function(rlv, rjt){
	// 			generateTargetFilePath(function(paths){
	// 				if( paths === false ){
	// 					rjt('Page not Exists.');
	// 					return;
	// 				}
	// 				_targetPaths = paths;
	// 				rlv();
	// 			});
	// 		}); })
	// 		.then(function(){ return new Promise(function(rlv, rjt){

	// 			var _contentsPath = _targetPaths.contentsPath;
	// 			var realpath_resource_dir = _targetPaths.realpathFiles;
	// 			var strLoaderCSS = _targetPaths.strLoaderCSS;
	// 			var strLoaderJS = _targetPaths.strLoaderJS;

	// 			try {
	// 				if( !codes.css.length ){
	// 					strLoaderCSS = '';
	// 				}
	// 				if( !codes.js.length ){
	// 					strLoaderJS = '';
	// 				}

	// 				if( $this->px2ce->target_mode == 'theme_layout' ){
	// 					codes.html = codes.html.replace( /(\s*\<\/head\>)/, strLoaderCSS+strLoaderJS+'$1' );
	// 					fs.writeFileSync(_contentsPath, codes.html);
	// 				}else{
	// 					fs.writeFileSync(_contentsPath, strLoaderCSS + strLoaderJS + codes.html);
	// 				}

	// 			} catch (e) {
	// 			}

	// 			try {
	// 				fsx.mkdirpSync( realpath_resource_dir );
	// 				if( !codes.css.length ){
	// 					fs.unlinkSync( realpath_resource_dir + '/style.css.scss' );
	// 				}else{
	// 					fs.writeFileSync( realpath_resource_dir + '/style.css.scss', codes.css );
	// 				}
	// 			} catch (e) {
	// 			}

	// 			try {
	// 				fsx.mkdirpSync( realpath_resource_dir );
	// 				if( !codes.js.length ){
	// 					fs.unlinkSync( realpath_resource_dir + '/script.js' );
	// 				}else{
	// 					fs.writeFileSync( realpath_resource_dir + '/script.js', codes.js );
	// 				}
	// 			} catch (e) {
	// 			}

	// 			rlv();

	// 		}); })
	// 		.then(function(){
	// 			callback(result);
	// 		})
	// 		.catch(function (err) {
	// 			result = {
	// 				'result': true,
	// 				'message': (typeof(err) == typeof('') ? err : err.message)
	// 			};
	// 			callback(result);
	// 		})
	// 	;

	// 	return;
	// }

	/**
	 * 編集対象のパス情報を生成する
	 */
	private function generateTargetFilePath(){
		$rtn = array(
			'realpathFiles' => $this->px2ce->fs()->get_realpath($this->px2ce->get_realpath_files()),
			'contentsPath' => $this->px2ce->fs()->get_realpath($this->px2ce->get_document_root().$this->px2ce->get_page_path()),
			'strLoaderCSS' => '<'.'?php ob_start(); ?'.'><link rel="stylesheet" href="<?= htmlspecialchars( $px->path_files(\'/style.css\') ) ?'.'>" /><'.'?php $px->bowl()->put( ob_get_clean(), \'head\' );?'.'>'."\n",
			'strLoaderJS' => '<'.'?php ob_start(); ?'.'><script src="<?= htmlspecialchars( $px->path_files(\'/script.js\') ) ?'.'>"></script><'.'?php $px->bowl()->put( ob_get_clean(), \'foot\' );?'.'>'."\n"
		);

		if( $this->px2ce->get_target_mode() == 'theme_layout' ){
			$tmpPathThemeLayoutDir = '/layouts/'.urlencode($this->px2ce->get_layout_id()).'/';
			$rtn['strLoaderCSS'] = '<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files(\''.$tmpPathThemeLayoutDir.'style.css\') ) ?'.'>" />'."\n";
			$rtn['strLoaderJS'] = '<script src="<?= htmlspecialchars( $theme->files(\''.$tmpPathThemeLayoutDir.'script.js\') ) ?'.'>"></script>'."\n";
		}

		$pageInfo = $this->px2ce->px2query( $this->px2ce->get_page_path().'?PX=api.get.page_info&path='.urlencode($this->px2ce->get_page_path()), array('output'=>'json') );
		if( $pageInfo == null ){
			if( !is_file($rtn['contentsPath']) ){
				return false;
			}
		}
		$contPath = $this->px2ce->px2query($this->px2ce->get_page_path().'?PX=api.get.path_content', array('output'=>'json'));

		// var_dump($contPath);
		if( !is_file($rtn['contentsPath']) ){
			$rtn['contentsPath'] = $this->px2ce->fs()->get_realpath($this->px2ce->get_document_root().$this->px2ce->get_cont_root().$contPath);
		}
		return $rtn;
	}


}
