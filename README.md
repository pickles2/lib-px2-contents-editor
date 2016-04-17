# pickles2-contents-editor

Pickles 2 のコンテンツ編集インターフェイスを提供します。

## Usage

### Server Side

```js

var express = require('express'),
	app = express();
var server = require('http').Server(app);
var Px2CE = require('pickles2-contents-editor');

app.use( '/your/api/path', function(req, res, next){

	var px2ce = new Px2CE();
	px2ce.init(
		{
			'appMode': 'web', // 'web' or 'desktop'. default to 'web'
			'entryScript': require('path').resolve('/path/to/.px_execute.php'),
			'log': function(msg){
				// エラー発生時にコールされます。
				// msg を受け取り、適切なファイルへ出力するように実装してください。
				fs.writeFileSync('/path/to/error.log', {}, msg);
			}
		},
		function(){
			px2ce.gpi(JSON.parse(req.body.data), function(value){
				res
					.status(200)
					.set('Content-Type', 'text/json')
					.send( JSON.stringify(value) )
					.end();
			});
		}
	);

	return;
} );

server.listen(8080);



// Pickles2 preview server
var expressPickles2 = require('express-pickles2');
var appPx2 = express();
appPx2.use( require('body-parser')() );

appPx2.use( '/*', expressPickles2(
	path.resolve('/path/to/.px_execute.php'),
	{
		'processor': function(bin, ext, callback){
			if( ext == 'html' ){
				bin += (function(){
					var scriptSrc = fs.readFileSync('node_modules/pickles2-contents-editor/dist/libs/broccoli-html-editor/client/dist/broccoli-preview-contents.js').toString('utf-8');
					var fin = '';
						fin += '<script data-broccoli-receive-message="yes">'+"\n";
						fin += 'window.addEventListener(\'message\',(function() {'+"\n";
						fin += 'return function f(event) {'+"\n";
						fin += 'if(window.location.hostname!=\'127.0.0.1\'){alert(\'Unauthorized access.\');return;}'+"\n";
						fin += 'if(!event.data.scriptUrl){return;}'+"\n";
						fin += scriptSrc+';'+"\n";
						fin += 'window.removeEventListener(\'message\', f, false);'+"\n";
						fin += '}'+"\n";
						fin += '})(),false);'+"\n";
						fin += '</script>'+"\n";
					return fin;
				})();
			}
			callback(bin);
			return;
		}
	}
) );
appPx2.listen(8081);

```

### Client Side

```html
<div id="canvas"></div>

<!-- Pickles 2 Contents Editor -->
<link rel="stylesheet" href="/path/to/pickles2-contents-editor.css" />
<script src="/path/to/pickles2-contents-editor.js"></script>

<script>
var pickles2ContentsEditor = new Pickles2ContentsEditor();
pickles2ContentsEditor.init(
	{
		'page_path': '/path/to/page.html' , // <- 編集対象ページのパス
		'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
		'preview':{ // プレビュー用サーバーの情報を設定します。
			'origin': 'http://127.0.0.1:8081'
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

## License

MIT License

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
