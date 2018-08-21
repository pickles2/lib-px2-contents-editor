# pickles2/lib-px2-contents-editor

Pickles 2 のコンテンツ編集インターフェイスを提供します。

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

## for developer

```
$ npm install
```
開発環境をセットアップします。

```
$ npm run submodule-update
```
サブモジュールを更新します。

```
$ npm start
```
アプリケーションをスタートします。

```
$ npm run up
```
サーバーを起動します。(`npm start` と同じ)

```
$ npm run preview
```
ブラウザで開きます。(Macのみ)

```
$ gulp
```
ビルドします。

```
$ gulp watch
```
更新を監視して自動的にビルドします。

```
$ npm run test
```
テストスクリプトを実行します。


## 更新履歴 - Change log


### pickles2-contents-editor v2.0.5 (リリース日未定)

- 初期起動時のパフォーマンスを向上した。

### pickles2-contents-editor v2.0.4 (2018年8月10日)

- PHP版で、 Windows でテーマのプレビューを開けない問題を修正。

### pickles2-contents-editor v2.0.3 (2018年8月8日)

- NodeJS版のオプションで、 カスタムフィールドの frontend.dir に対応した。
- PHP版で、依存ライブラリのバージョン指定に関する間違いを修正。

### pickles2-contents-editor v2.0.2 (2018年7月30日)

- PHP版で、モジュールのCSS、JSが取得できない不具合を修正。
- PHP版で、Windows上で起きていたいくつかの不具合を修正。

### pickles2-contents-editor v2.0.1 (2018年7月27日)

- PHP版でフィールドプラグインを読み込めるようになった。
- PHP版でオプション `customFieldsIncludePath` を削除。 `get_client_resources()` が必要なリソースリストを提供するように変更。
- その他いくつかの不具合を修正。

### pickles2-contents-editor v2.0.0 (2018年7月11日)

- バックエンドの処理を PHP に移行。 (NodeJS の実装は、しばらく残した後に、削除される予定)

### pickles2-contents-editor v2.0.0-beta.4 (2018年6月22日)

- broccoli-html-editor を外部からの供給に依存するようになった。
- broccoli-field-table
	- 最後の行が結合されている場合に、列幅指定が欠落する不具合を修正。
- broccoli-html-editor オブジェクトを取り出すAPI `px2ce.createBroccoli()` を追加。
- broccoli-html-editor で、プロジェクト固有のカスタムフィールドを追加できる機能を追加。
- テーマの編集に対応した。
- `page_path` に alias や dynamic path を受け取った場合に異常終了する不具合を修正。
- Pickles 2 が深い階層にある場合に、HTMLを正常に更新できない不具合を修正。
- 新しい Pickles 2 共有設定 `$conf->plugins->px2dt->guieditor->path_resource_dir` を追加。
- 新しい Pickles 2 共有設定 `$conf->plugins->px2dt->guieditor->path_data_dir` を追加。
- 新しい Pickles 2 共有設定 `$conf->plugins->px2dt->guieditor->custom_fields` を追加。
- 新しい Pickles 2 共有設定 `$conf->plugins->px2dt->path_module_templates_dir` を追加。
- サーバーサイドのオプションに `target_mode` を追加。
- サーバーサイドのオプションに `commands.php` を追加。
- サーバーサイドのオプションに `customFieldsIncludePath` を追加。
- クライアントサイドの新しいオプション `lang` を追加。
- クライアントサイドに `clipboard.set()`, `clipboard.get()` オプションを追加。
- `checkEditorMode()` を px2-px2dthelper 依存に変更。
- `initContentFiles()` を px2-px2dthelper 依存に変更。
- その他パフォーマンス向上、細かい不具合の修正など。

### pickles2-contents-editor v2.0.0-beta.3 (2016年8月3日)

- コンフィグ `path_controot` が `/` 以外の場合に、起きる不具合を修正。
- ローカルリソースの読み込みの記述を、 $px->path_files() 依存に変更。
- broccoli-html-editor
	- selectフィールドに、オプション `"display": "radio"` を追加。ラジオボタン形式の入力欄を作成できるようになった。
	- editWindow上 の loop appender をダブルクリック操作した後に表示が更新されない問題を修正。
	- Ace Editor が有効な場合、同じ種類のフィールドが1つのモジュールに並んでいる場合に、最後の値がすべてに適用されてしまう不具合を修正。
	- コピー＆ペースト操作時に、誤った操作ができてしまう不具合を修正。
	- データ上のエラーで、誤ったモジュールが混入した場合に異常終了しないように修正。
	- loopフィールドのサブモジュールに元のモジュール名が引き継がれない不具合を修正。

### pickles2-contents-editor v2.0.0-beta.2 (2016年6月8日)

- broccoli-html-editor@0.1.0-beta.9 に更新。
- 設定項目 customFields を追加。
- window.keypress が存在する場合に、自動的にキーバインドを設定するようになった。
- Ace Editor を自然改行されるように設定した。
- Ace Editor で、書式に応じてテーマが変わるようにした。
- Ace Editor の文字サイズを最適化。
- broccoli-html-editorのモジュールの詳細ダイアログで、READMEの内容をコピーできるようにした。
- サーバーサイドのinit項目にも page_path を追加。
- ソース編集で、CSS と JS が空白なときにも、外部ファイルが作られてしまう問題を修正。
- desktopモードで ブラウザで開く が動作しない不具合を修正。
- その他パフォーマンス向上、細かい不具合の修正など。


## License

MIT License


## Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <http://www.pxt.jp/>
- Twitter: @tomk79 <http://twitter.com/tomk79/>
