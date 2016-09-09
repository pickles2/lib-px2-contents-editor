/**
 * broccoli
 */
module.exports = function(px2ce, data, callback){
	callback = callback || function(){};

	var utils79 = require('utils79');
	var Promise = require('es6-promise').Promise;

	px2ce.createBroccoli(function(broccoli){
		// console.log('GPI called');
		// console.log(api);
		// console.log(options);
		broccoli.gpi(
			data.forBroccoli.api,
			data.forBroccoli.options,
			function(rtn){
				// console.log(rtn);
				// console.log('GPI responced');
				callback(rtn);
			}
		);

	});

	return;
}
