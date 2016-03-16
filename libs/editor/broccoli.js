/**
 * broccoli
 */
module.exports = function(){

	var Broccoli = require('broccoli-html-editor');
	var broccoli = new Broccoli();

	// 初期化を実行してください。
	broccoli.init(
		{
			'paths_module_template': {
				'testMod1': '/realpath/to/modules1/',
				'testMod2': '/realpath/to/modules2/'
			} ,
			'documentRoot': '/realpath/to/www/htdocs/',// realpath
			'pathHtml': '/editpage/index.html',
			'pathResourceDir': '/editpage/index_files/resources/',
			'realpathDataDir':  '/realpath/to/www/htdocs/editpage/index_files/guieditor.ignore/',
			'customFields': {
				'custom1': function(broccoli){
					// カスタムフィールドを実装します。
					// この関数は、fieldBase.js を基底クラスとして継承します。
					// customFields オブジェクトのキー(ここでは custom1)が、フィールドの名称になります。
				}
			} ,
			'bindTemplate': function(htmls, callback){
				var fin = '';
				fin += '<!DOCTYPE html>'+"\n";
				fin += '<html>'+"\n";
				fin += '	<head>'+"\n";
				fin += '		<title>sample page</title>'+"\n";
				fin += '	</head>'+"\n";
				fin += '	<body>'+"\n";
				fin += '		<div data-contents="main">'+"\n";
				fin += htmls['main']+"\n";
				fin += '		</div><!-- /main -->'+"\n";
				fin += '		<div data-contents="secondly">'+"\n";
				fin += htmls['secondly']+"\n";
				fin += '		</div><!-- /secondly -->'+"\n";
				fin += '	</body>'+"\n";
				fin += '</html>';

				callback(fin);
				return;
			},
			'log': function(msg){
				// エラー発生時にコールされます。
				// msg を受け取り、適切なファイルへ出力するように実装してください。
				fs.writeFileSync('/path/to/error.log', {}, msg);
			}
		},
		function(){
			console.log('standby!');
		}
	);


}
