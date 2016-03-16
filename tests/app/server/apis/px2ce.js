/**
 * px2ce.js
 */
module.exports = function(){

	var Px2CE = require('../../../../libs/main.js');

	return function(req, res, next){
		console.log(req.body);

		var px2ce = new Px2CE();
		px2ce.init(
			{
				'entryScript': require('path').resolve(__dirname,'../../../htdocs/.px_execute.php'),
				'page_path': req.body.page_path
			},
			function(){
				px2ce.gpi(JSON.parse(req.body.api), JSON.parse(req.body.options), function(value){
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
