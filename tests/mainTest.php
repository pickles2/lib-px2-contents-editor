<?php
/**
 * test for pickles2/lib-px2-contents-editor
 */
class mainTest extends PHPUnit\Framework\TestCase{
	private $fs;

	public function setUp() : void{
		mb_internal_encoding('UTF-8');
		require_once(__DIR__.'/php_test_helper/helper.php');
		testHelper::start_built_in_server();
	}


	/**
	 * 普通にインスタンス化して実行してみるテスト
	 */
	public function testStandard(){
		$this->assertTrue( true );
		$px2ce = testHelper::makeDefaultPx2Ce();

		// $cd = realpath('.');
		// $SCRIPT_FILENAME = $_SERVER['SCRIPT_FILENAME'];
		// chdir(__DIR__.'/testData/standard/');
		// $_SERVER['SCRIPT_FILENAME'] = __DIR__.'/testData/standard/.px_execute.php';

		// $px = new picklesFramework2\px('./px-files/');
		// $toppage_info = $px->site()->get_page_info('');
		// // var_dump($toppage_info);
		// $this->assertEquals( $toppage_info['title'], '<HOME>' );
		// $this->assertEquals( $toppage_info['path'], '/index.html' );
		// $this->assertEquals( $_SERVER['HTTP_USER_AGENT'], '' );

		// $this->assertEquals( $px->get_scheme(), 'http' );
		// $this->assertEquals( $px->get_domain(), 'pickles2.pxt.jp' );
	}

}
