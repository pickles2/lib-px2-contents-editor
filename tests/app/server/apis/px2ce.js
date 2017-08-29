/**
 * px2ce.js
 */
module.exports = function(opts){

	var Px2CE = require('../../../../libs/main.js');

	return function(req, res, next){
		console.log(req.body);

		var px2ce = new Px2CE();
		px2ce.init(
			{
				'target_mode': req.body.target_mode || 'page_content',
				'page_path': req.body.page_path,
				'appMode': 'web', // 'web' or 'desktop'. default to 'web'
				'entryScript': require('path').resolve(__dirname,'../../../htdocs2/htdocs/subapp/.px_execute.php'),
				// 'entryScript': require('path').resolve(__dirname,'../../../htdocs/.px_execute.php'),
				'customFields': {
					"custom1": function(){
						// カスタムフィールド1
					}
				},
				'customFieldsIncludePath': opts.customFieldsIncludePath
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
	}

}
