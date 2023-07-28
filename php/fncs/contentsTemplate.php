<?php
/**
 * Pickles 2 contents editor
 */
namespace pickles2\libs\contentsEditor\fncs;

/**
 * Contents Templates
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class contentsTemplate{

	/**
	 * $px2ce
	 */
	private $px2ce;

	/**
	 * $px
	 */
	private $px;

    /** コンテンツテンプレートの格納ディレクトリ */
    private $path_contents_templates_dir;

	/**
	 * Constructor
	 */
	public function __construct( $px2ce ){
		$this->px2ce = $px2ce;
		$this->px = $px2ce->px();
        $this->path_contents_templates_dir = $px2ce->get_project_conf()->plugins->px2dt->path_contents_templates_dir ?? false;
	}

    /**
     * コンテンツテンプレートが利用可能か判定する
     *
     * @return boolean コンテンツテンプレートが利用できる場合に true, それ以外の場合に false を返します。
     */
    public function is_available(){
        if( !$this->path_contents_templates_dir ){
            return false;
        }
        if( !strlen($this->path_contents_templates_dir ?? '') || !is_dir($this->path_contents_templates_dir) ){
            return false;
        }
        $ls = $this->px2ce->fs()->ls($this->path_contents_templates_dir);
        $has_dir = false;
        foreach($ls as $template_id){
            if( is_dir($this->path_contents_templates_dir.'/'.urlencode($template_id).'/') ){
                $has_dir = true;
                break;
            }
        }
        if( !$has_dir ){
            return false;
        }
        return true;
    }

    /**
     * コンテンツテンプレートのリストを取得する
     *
     * @return object コンテンツテンプレートのリストを含むオブジェクト
     */
    public function get_list(){
        if( !$this->is_available() ){
            return $this->default_list();
        }

        $rtn = (object) array(
            "default" => null,
            "list" => array(),
        );

        $ls = $this->px2ce->fs()->ls($this->path_contents_templates_dir);
        foreach($ls as $template_id){
            $template_info = (object) array();
            $template_info->id = $template_id;
            $template_info->name = $template_id;

            if( is_file( $this->path_contents_templates_dir.'/'.urlencode($template_info->id).'/info.json' ) ){
                $str_json = file_get_contents( $this->path_contents_templates_dir.'/'.urlencode($template_info->id).'/info.json' );
                $json = json_decode($str_json);
                $template_info->name = $json->name;
            }

            array_push( $rtn->list, $template_info );
        }

        $rtn->default = $rtn->list[0]->id ?? null; // デフォルトの選択肢

        return $rtn;
    }

    /**
     * デフォルトのリストを取得する
     */
    private function default_list(){
        $rtn = (object) array(
            "default" => 'html.gui',
            "list" => array(
                (object) array(
                    "id" => 'html.gui',
                    "name" => $this->px2ce->lb()->get('ui_label.blockeditor'),
                ),
                (object) array(
                    "id" => 'html',
                    "name" => $this->px2ce->lb()->get('ui_label.html'),
                ),
                (object) array(
                    "id" => 'md',
                    "name" => $this->px2ce->lb()->get('ui_label.markdown'),
                ),
            ),
        );
        return $rtn;
    }

    /**
     * コンテンツテンプレートの情報を取得する
     */
    private function get_template_info( $template_id ){
        $rtn = (object) array();
        if( !is_dir( $this->path_contents_templates_dir.'/'.urlencode($template_id).'/' ) ){
            return false;
        }

        $rtn->id = $template_id;
        if( is_file( $this->path_contents_templates_dir.'/'.urlencode($template_id).'/info.json' ) ){
            $str_json = file_get_contents( $this->path_contents_templates_dir.'/'.urlencode($template_id).'/info.json' );
            $json = json_decode($str_json);
            $rtn->name = $json->name;
        }

        $rtn->realpath_template = null;
        $rtn->realpath_template_files = null;
        $rtn->ext = null;

        $ls = $this->px->fs()->ls( $this->path_contents_templates_dir.'/'.urlencode($template_id).'/' );
        foreach( $ls as $basename ){
            if( $basename == 'template.html' ){
                $rtn->realpath_template = $this->path_contents_templates_dir.'/'.urlencode($template_id).'/'.$basename;
                $rtn->ext = 'html';
                break;
            }elseif( preg_match('/^template\.html\.([a-zA-Z0-9]+)$/', $basename, $matched) ){
                $rtn->realpath_template = $this->path_contents_templates_dir.'/'.urlencode($template_id).'/'.$basename;
                $rtn->ext = $matched[1];
                break;
            }
        }

        if( $rtn->ext == 'htm' ){
            // htm は html に寄せる
            $rtn->ext = 'html';
        }

        if( is_dir( $this->path_contents_templates_dir.'/'.urlencode($template_id).'/template_files/' ) ){
            $rtn->realpath_template_files = $this->path_contents_templates_dir.'/'.urlencode($template_id).'/template_files/';
        }

        return $rtn;
    }

    /**
     * コンテンツを初期化する
     */
    public function init_content($page_path, $editor_mode){
        $is_available = $this->is_available();
        if( !$is_available ){
            $data = $this->px2ce->px2query(
                $page_path.'?PX=px2dthelper.init_content&editor_mode='.urlencode($editor_mode),
                array(
                    "output" => "json",
                )
            );
            return $data;
        }


        // px2dthelper を直接呼び出す
        $px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );

        $template_id = $editor_mode;
		if(!strlen($template_id ?? '')){
			$template_id = 'html';
		}
		$flg_force = false;
		$page_info = $this->px->site()->get_page_info( $page_path );
		$path_content = $this->px->req()->get_request_file_path();
		if( !is_null($page_info) ){
			$path_content = $page_info['content'];
		}
		$contRoot = $this->px->fs()->get_realpath( $this->px->get_path_docroot().'/'.$this->px->get_path_controot() );
		$path_find_exist_content = $px2dthelper->find_page_content( $path_content );
		$realpath_content = $this->px->fs()->get_realpath( $this->px->get_path_docroot().$this->px->get_path_controot().$path_content );
		$realpath_files = $this->px->fs()->get_realpath( $this->px->realpath_files() );

		if( $this->px->fs()->is_file( $contRoot.'/'.$path_find_exist_content ) && !$flg_force ){
			return array(false, 'Contents already exists.');
		}

        $contents_template_info = $this->get_template_info( $template_id );

		// 一旦削除する
		if( $this->px->fs()->is_file( $contRoot.'/'.$path_find_exist_content ) ){
			$this->px->fs()->rm( $contRoot.'/'.$path_find_exist_content );
		}
		if( $this->px->fs()->is_dir( $realpath_files ) ){
			$this->px->fs()->rmdir_r( $realpath_files );
		}

		// ディレクトリを作成
		$this->px->fs()->mkdir_r( dirname($realpath_content) );

		// コンテンツ本体を作成
		$extension = $contents_template_info->ext;
		if( $extension !== 'html' ){
			$realpath_content .= '.'.$extension;
		}
		$this->px->fs()->copy( $contents_template_info->realpath_template, $realpath_content );

		if( strlen($contents_template_info->realpath_template_files ?? '') && is_dir($contents_template_info->realpath_template_files) ){
			// broccoli-html-editor の data.json を作成
			$realpath_files = $px2dthelper->realpath_files( $page_path );
			$this->px->fs()->mkdir_r( $realpath_files );
			$this->px->fs()->copy_r( $contents_template_info->realpath_template_files, $realpath_files );

		}

        return array(true, 'ok');
    }
}
