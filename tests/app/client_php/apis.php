<?php
require_once(__DIR__.'/../../../vendor/autoload.php');
require_once(__DIR__.'/../../php_test_helper/test_php_field_custom1.php');
require_once( __DIR__.'/../../htdocs2/px-files/broccoli-fields/projectCustom1/backend.php' );
require_once( __DIR__.'/../../htdocs2/px-files/broccoli-fields/projectCustom2/backend.php' );



// Pickles 2 に擬態する
// `$px` を生成するため。
$px = null;
$realpath_current = realpath('.');
$script_filename_current = $_SERVER['SCRIPT_FILENAME'];
chdir(__DIR__.'/../../htdocs2/htdocs/subapp/');
$_SERVER['PATH_INFO'] = @$_REQUEST['page_path'];
$_SERVER['SCRIPT_NAME'] = '/subapp/.px_execute.php';
$_SERVER['SCRIPT_FILENAME'] = realpath('./.px_execute.php');
$px = new \picklesFramework2\px('../../px-files/');
header('HTTP/1.1 200 OK');



$px2ce = new pickles2\libs\contentsEditor\main($px);
$px2ce->init(array(
	'target_mode' => (strlen(''.@$_REQUEST['target_mode']) ? $_REQUEST['target_mode'] : 'page_content'),
	'page_path' => @$_REQUEST['page_path'], // <- 編集対象ページのパス
	'appMode' => 'web', // 'web' or 'desktop'. default to 'web'
	'entryScript' => realpath(__DIR__.'/../../htdocs2/htdocs/subapp/.px_execute.php'),
	// 'entryScript' => realpath(__DIR__.'/../../htdocs/.px_execute.php'),
	'customFields' => array(
		'custom1' => 'test_php_field_custom1',
	) ,
	'log' => function($msg){
	}
));
if(@$_GET['client_resources']){
	$value = $px2ce->get_client_resources(__DIR__.'/caches/');
	header('Content-type: text/json');
	echo json_encode($value);
	exit;
}
$value = $px2ce->gpi( json_decode( $_REQUEST['data'] ) );
header('Content-type: text/json');
echo json_encode($value);
exit;
