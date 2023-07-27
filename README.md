# pickles2/lib-px2-contents-editor

[Pickles 2](https://pickles2.com/) のコンテンツ編集インターフェイスを提供します。

## Usage

### Server Side (PHP)

```php
<?php
/**
 * api.php
 */
require_once('vendor/autoload.php');

$px2ce = new pickles2\libs\contentsEditor\main();
$px2ce->init(array(
	'target_mode' => 'page_content', // <- 編集対象のモード ('page_content' (default) or 'theme_layout')
	'page_path' => '/path/to/page.html', // <- 編集対象ページのパス (target_mode=theme_layout のとき、 `/{theme_id}/{layout_id}.html` の形式)
	'appMode' => 'web', // 'web' or 'desktop'. default to 'web'
	'entryScript' => '/realpath/to/.px_execute.php', // Pickles 2 のエンドポイント
	'customFields' => array(
		// カスタムフィールドのサーバーサイドスクリプト。クラス名(ネームスペース含む)を指定します。
		// この関数は、`broccoliHtmlEditor\fieldBase` を基底クラスとして継承します。
		// customFields オブジェクトのキー(ここでは custom1)が、フィールドの名称になります。
		'custom1' => 'test_php_field_custom1',
	) ,
	'log' => function($msg){
		// ログ情報出力時にコールされます。
		// $msg を受け取り、適切なファイルへ出力するように実装してください。
		file_put_contents('/path/to/px2ce.log', $msg);
	},
	'commands' => array(
		'php' => array(
			// PHPコマンドのパスを表すオブジェクト
			// または、 文字列で '/path/to/php' とすることも可 (この場合、 php.ini のパスは指定されない)
			'bin' => '/path/to/php',
			'ini' => '/path/to/php.ini'
		)
	)
));

if($_GET['client_resources'] ?? null){
	$value = $px2ce->get_client_resources(__DIR__.'/caches/');
	header('Content-type: text/json');
	echo json_encode($value);
	exit;
}
$value = $px2ce->gpi( json_decode( $_REQUEST['data'] ) );
header('Content-type: text/json');
echo json_encode($value);
exit;
```


### Client Side

```php
<div id="canvas"></div>

<!--
エディタが利用する CSS や JavaScript などのリソースファイルがあります。
`$px2ce->get_client_resources()` からリソースの一覧を取得し、読み込んでください。
-->

<?php
require_once('vendor/autoload.php');

$px2ce = new pickles2\libs\contentsEditor\main();
$px2ce->init( /* any options */ );

$resources = $px2ce->get_client_resources();
foreach($resources->css as $css_file){
	echo('<link rel="stylesheet" href="'.htmlspecialchars($css_file).'" />');
}
foreach($resources->js as $js_file){
	echo('<script src="'.htmlspecialchars($js_file).'"></script>');
}
?>

<script>
var pickles2ContentsEditor = new Pickles2ContentsEditor();
pickles2ContentsEditor.init(
	{
		'page_path': '/path/to/page.html' , // <- 編集対象ページのパス
		'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
		'preview':{ // プレビュー用サーバーの情報を設定します。
			'origin': 'http://127.0.0.1:8081'
		},
		'lang': 'en', // language
		'customFields': {
			// この設定項目は、 broccoli-html-editor に渡されます
			'custom1': function(broccoli){
				// カスタムフィールドを実装します。
				// この関数は、fieldBase.js を基底クラスとして継承します。
				// customFields オブジェクトのキー(ここでは custom1)が、フィールドの名称になります。
			}
		},
		'gpiBridge': function(input, callback){
			// GPI(General Purpose Interface) Bridge
			// broccoliは、バックグラウンドで様々なデータ通信を行います。
			// GPIは、これらのデータ通信を行うための汎用的なAPIです。
			$.ajax({
				"url": '/your/api/path',
				"type": 'post',
				'data': {'data':JSON.stringify(input)},
				"success": function(data){
					callback(data);
				}
			});
			return;
		},
		'clipboard': {
			// クリップボード操作の機能を拡張できます。
			'set': function( data, type ){
				// クリップボードにコピーする機能を実装してください。
			},
			'get': function( type ){
				// クリップボードからデータを取得する機能を実装してください。
			}
		},
		'complete': function(){
			alert('完了しました。');
		},
		'onOpenFilesDirectory': function(){
			alert('リソースディレクトリを開きます。');
		},
		'onClickContentsLink': function( uri, data ){
			alert('編集: ' + uri);
		},
		'onMessage': function( message ){
			// ユーザーへ知らせるメッセージを表示する
			console.info('message: '+message);
		}
	},
	function(){
		// スタンバイ完了したら呼び出されるコールバックメソッドです。
		console.info('standby!!');
	}
);
</script>
```


## 更新履歴 - Change log

### pickles2/lib-px2-contents-editor v2.2.0 (リリース日未定)

- NodeJS版の提供を廃止した。
- デフォルトエディタ: プレビュー中のリンククリック時の挙動を改善した。
- デフォルトエディタ: 記述したPHPがサーバー内部エラーを含んでいる場合に、プレビューのリロードが失敗したあと、修正しても復旧できない問題を修正した。
- コンテンツテンプレート機能を追加した。

### pickles2-contents-editor v2.1.8 (2023年5月1日)

- Broccoli編集画面で、インスタンスツリービューのトグルボタンのデザインを修正。

### pickles2-contents-editor v2.1.7 (2023年4月22日)

- ページが未定義のパスからのコンテンツ編集に関する不具合を修正した。

### pickles2-contents-editor v2.1.6 (2023年3月11日)

- デフォルトエディタ: 画像ファイルダイアログのサムネイルプレビューのUI改善。
- ページが未定義のパスから、コンテンツの編集を初期化できるようになった。
- テーマ編集モードの動作を改善した。

### pickles2-contents-editor v2.1.5 (2023年2月11日)

- テーマレイアウトをBroccoli編集する際に、Request URI Too Long になる場合がある問題を修正した。
- デフォルトエディタで、コンテンツの変更に反応して自動保存されるようになった。
- デフォルトエディタで、`Cmd + Shift + S` (Windows では `Ctrl + Shift + S`) で、保存して終了できるようになった。
- デフォルトエディタで、画像ファイルを挿入できるようになった。
- その他の細かい修正。

### pickles2-contents-editor v2.1.4 (2022年12月29日)

- 依存パッケージを更新。
- カスタムフィールドの指定をフィールドIDで指定して、既存の設定をコピーできるようになった。
- Broccoli編集画面で、 `[contenteditable]` が利用されているフィールドでバックスペースなどのキーボード操作が効かなくなる問題を修正。
- `onOpenFilesDirectory` オプションを追加。

### pickles2-contents-editor v2.1.3 (2022年11月3日)

- デフォルトのエディタで、保存時にプレビューのスクロール位置を復元するようになった。
- プレビューコンテンツ用スクリプトに関する不具合の修正。
- 編集画面レイアウトの改善。
- Broccoli v1.0.x に対応した。
- Broccoli編集画面に「挿入」ボタンを追加した。
- その他の細かい修正。

### pickles2-contents-editor v2.1.2 (2022年6月5日)

- 小さい画面に配慮したレイアウトの改善。

### pickles2-contents-editor v2.1.1 (2022年5月22日)

- `$conf->path_controot` が深いパスに設定されている場合に、異なる編集対象が選択される場合がある問題を修正。
- その他の細かい修正。

### pickles2-contents-editor v2.1.0 (2022年1月8日)

- サポートするPHPのバージョンを `>=7.3.0` に変更。
- PHP 8.1 に対応した。

### pickles2-contents-editor v2.0.15 (2022年1月4日)

- broccoli-field-table v0.3系対応

### pickles2-contents-editor v2.0.14 (2021年11月26日)

- Broccoli v0.5系対応

### pickles2-contents-editor v2.0.13 (2021年8月21日)

- パフォーマンスに関する改善。
- UIに関する改善。
- その他、内部コードの細かい修正。

### pickles2-contents-editor v2.0.12 (2020年2月21日)

- Update: Broccoli v0.4.x
- デフォルトエディタでリソースファイルの直接ドロップができるようになった。
- その他の細かい修正。

### pickles2-contents-editor v2.0.11 (2020年8月12日)

- defaultエディタで、行の折り返しのモードを切り替えられるようになった。
- Broccoliエディタで、ビューポートサイズを変更できるようになった。
- Broccoliエディタで、選択したインスタンスをJSONファイルに出力できるようになった。
- Broccoliエディタの新しい設定項目 `fieldConfig` に対応。
- Broccoliエディタの新しい設定項目 `userStorage` に対応。
- Broccoliエディタの新しい設定項目 `droppedFileOperator` に対応。

### pickles2-contents-editor v2.0.10 (2020年1月2日)

- PHP 7.4 に対応した。

### pickles2-contents-editor v2.0.9 (2019年12月13日)

- プレビューの読み込みに 30秒以上かかる場合、タイムアウトを発生させて強制的に編集画面へ移行するようになった。

### pickles2-contents-editor v2.0.8 (2019年8月11日)

- 内部のライブラリ構成を調整した。
- タッチ端末でのスクロールに関する問題を修正。

### pickles2-contents-editor v2.0.7 (2019年7月10日)

- 編集中のプレビューにGETパラメータ `PICKLES2_CONTENTS_EDITOR` を付加するようになった。
- `vendor` ディレクトリ中のカスタムフィールドを自動的に検索して読み込むようになった。
- テーマをBroccoliエディタモードで編集するとき、カスタムCSSとJavaScriptを記述できるようになった。

### pickles2-contents-editor v2.0.6 (2019年6月15日)

- モジュールパレットの表示サイズの調整が少しズレる問題を修正。
- コンテンツの作成をキャンセルできるようになった。


## License

MIT License


## Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
