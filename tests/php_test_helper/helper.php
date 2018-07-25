<?php
class testHelper{

	/**
	 * Start Built in server.
	 */
	static public function start_built_in_server(){
		static $pid;
		if($pid){
			return;
		}
		$WEB_SERVER_HOST = 'localhost';
		$WEB_SERVER_PORT = 3000;
		$WEB_SERVER_DOCROOT = __DIR__.'/../htdocs/';
		$WEB_SERVER_ROUTER = __DIR__.'/router.php';

		// Command that starts the built-in web server
		$command = sprintf(
			'php -S %s:%d -t %s %s >/dev/null 2>&1 & echo $!',
			$WEB_SERVER_HOST,
			$WEB_SERVER_PORT,
			$WEB_SERVER_DOCROOT,
			$WEB_SERVER_ROUTER
		);

		// Execute the command and store the process ID
		$output = array();
		exec($command, $output);
		$pid = (int) $output[0];

		echo sprintf(
			'%s - Web server started on %s:%d with PID %d',
			date('r'),
			$WEB_SERVER_HOST,
			$WEB_SERVER_PORT,
			$pid
		) . PHP_EOL;

		// Kill the web server when the process ends
		register_shutdown_function(function() use ($pid) {
			echo sprintf('%s - Killing process with ID %d', date('r'), $pid) . PHP_EOL;
			exec('kill ' . $pid);
		});
		return;
	}

	/**
	 * $px2ce を生成する
	 */
	static public function makeDefaultPx2Ce($options = array()){
		require_once(__DIR__.'/test_php_field_custom1.php');
		$px2ce = new pickles2\libs\contentsEditor\main();
		$px2ce->init(array(
			'page_path' => '/sample_pages/page3/index.html', // <- 編集対象ページのパス
			'appMode' => 'web', // 'web' or 'desktop'. default to 'web'
			'entryScript' => realpath(__DIR__.'/../htdocs2/htdocs/subapp/.px_execute.php'),
			'customFields' => array(
				// この設定項目は、 broccoli-html-editor に渡されます
				'custom1' => 'test_php_field_custom1',
			) ,
			'log' => function($msg){
				// ログ情報出力時にコールされます。
				// msg を受け取り、適切なファイルへ出力するように実装してください。
				// fs.writeFileSync('/path/to/px2ce.log', {}, msg);
			}
		));
		return $px2ce;
	}
}
