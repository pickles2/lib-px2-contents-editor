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

    /** コンテンツテンプレートの格納ディレクトリ */
    private $path_contents_templates_dir;

	/**
	 * Constructor
	 */
	public function __construct( $px2ce ){
		$this->px2ce = $px2ce;
        $this->path_contents_templates_dir = $px2ce->get_project_conf()->plugins->px2dt->path_contents_templates_dir ?? false;
	}

    /**
     * コンテンツテンプレートのリストを取得する
     *
     * @return object コンテンツテンプレートのリストを含むオブジェクト
     */
    public function get_list(){
        if( !$this->path_contents_templates_dir ){
            return $this->default_list();
        }
        if( !strlen($this->path_contents_templates_dir ?? '') || !is_dir($this->path_contents_templates_dir) ){
            return $this->default_list();
        }

        $rtn = (object) array(
            "default" => null,
            "list" => array(),
        );

        $ls = $this->px2ce->fs()->ls($this->path_contents_templates_dir);
        foreach($ls as $templateId){
            $templateInfo = (object) array();
            $templateInfo->id = $templateId;
            $templateInfo->name = $templateId;

            if( is_file( $this->path_contents_templates_dir.'/'.urlencode($templateInfo->id).'/info.json' ) ){
                $str_json = file_get_contents( $this->path_contents_templates_dir.'/'.urlencode($templateInfo->id).'/info.json' );
                $json = json_decode($str_json);
                $templateInfo->name = $json->name;
            }

            array_push( $rtn->list, $templateInfo );
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
}
