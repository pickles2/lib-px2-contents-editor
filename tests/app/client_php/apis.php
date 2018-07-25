<?php
require_once(__DIR__.'/../../../vendor/autoload.php');
require_once(__DIR__.'/../../php_test_helper/test_php_field_custom1.php');
$px2ce = new pickles2\libs\contentsEditor\main();
$px2ce->init(array(
	'target_mode' => (strlen(@$_REQUEST['target_mode']) ? $_REQUEST['target_mode'] : 'page_content'),
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
