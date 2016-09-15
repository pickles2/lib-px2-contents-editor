var assert = require('assert');
var Px2CE = require('../libs/main.js');

function Px2CEGen(options, callback){
	var px2ce = new Px2CE();
	px2ce.init(
		{
			'page_path': '/sample_pages/page3/index.html', // <- 編集対象ページのパス
			'appMode': 'web', // 'web' or 'desktop'. default to 'web'
			'entryScript': require('path').resolve(__dirname, './htdocs2/htdocs/subapp/.px_execute.php'),
			'customFields': {
				// この設定項目は、 broccoli-html-editor に渡されます
				'custom1': function(broccoli){
					// カスタムフィールドを実装します。
					// この関数は、fieldBase.js を基底クラスとして継承します。
					// customFields オブジェクトのキー(ここでは custom1)が、フィールドの名称になります。
				}
			} ,
			'log': function(msg){
				// ログ情報出力時にコールされます。
				// msg を受け取り、適切なファイルへ出力するように実装してください。
				// fs.writeFileSync('/path/to/px2ce.log', {}, msg);
			}
		},
		function(){
			callback(px2ce);
		}
	);
	return;
}

describe('createBroccoli', function() {

	it('createBroccoli', function(done) {
		this.timeout(10*1000);
		Px2CEGen({}, function(px2ce){
			// console.log(px2ce);
			assert.equal( typeof(px2ce), typeof({}) );
			done();
		});
	});

});
