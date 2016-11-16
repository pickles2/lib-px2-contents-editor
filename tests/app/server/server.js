/**
 * server.js
 */
var conf = require('config');
var urlParse = require('url-parse');
conf.originParsed = new urlParse(conf.origin);
conf.originParsed.protocol = conf.originParsed.protocol.replace(':','');
if(!conf.originParsed.port){
	conf.originParsed.port = (conf.originParsed.protocol=='https' ? 443 : 80);
}
conf.px2server.originParsed = new urlParse(conf.px2server.origin);
conf.px2server.originParsed.protocol = conf.px2server.originParsed.protocol.replace(':','');
if(!conf.px2server.originParsed.port){
	conf.px2server.originParsed.port = (conf.originParsed.protocol=='https' ? 443 : 80);
}
console.log(conf);

var fs = require('fs');
var path = require('path');
var px2agent = require('px2agent');
var utils79 = require('utils79');
var express = require('express'),
	app = express();
var server = require('http').Server(app);
console.log('port number is '+conf.originParsed.port);
console.log('Pickles 2 preview server port number is '+conf.px2server.originParsed.port);

var entryScript = path.resolve(__dirname, '../../htdocs2/htdocs/subapp/.px_execute.php');
// var entryScript = path.resolve(__dirname, '../../htdocs/.px_execute.php');

var px2proj = require('px2agent').createProject(entryScript);

px2proj.get_config(function(px2conf){
	// console.log(px2conf);

	var confCustomFields = px2conf.plugins.px2dt.guieditor.custom_fields;
	var customFieldsIncludePath = [];
	for(var fieldName in confCustomFields){
		if( confCustomFields[fieldName].frontend.file && confCustomFields[fieldName].frontend.function ){
			var pathJs = require('path').resolve(entryScript, '..', confCustomFields[fieldName].frontend.file);
			app.use( '/broccoli_custom_fields/'+fieldName, express.static( require('path').resolve(pathJs, '..') ) );
			var binJs = '<script src="file://'+pathJs+'"></script>';
			customFieldsIncludePath.push( '/broccoli_custom_fields/'+fieldName+'/'+utils79.basename(pathJs) );
		}
	}

	app.use( require('body-parser')({"limit": "1024mb"}) );
	app.use( '/common/', express.static( path.resolve(__dirname, '../../../dist/') ) );
	app.use( '/apis/px2ce', require('./apis/px2ce.js')({
		'customFieldsIncludePath': customFieldsIncludePath
	}) );

	app.use( express.static( __dirname+'/../client/' ) );

	// {conf.port}番ポートでLISTEN状態にする
	server.listen( conf.originParsed.port, function(){
		console.log('server-standby');
	} );
});




// Pickles2 preview server
var expressPickles2 = require('express-pickles2');
var appPx2 = express();
appPx2.use( require('body-parser')({"limit": "1024mb"}) );

appPx2.use( '/*', expressPickles2(
	entryScript,
	{
		// 'liveConfig': function(callback){
		// 	var pj = px.getCurrentProject();
		// 	var realpathEntryScript = path.resolve(pj.get('path'), pj.get('entry_script'));
		// 	callback(
		// 		realpathEntryScript,
		// 		{}
		// 	);
		// },
		'processor': function(bin, ext, callback){
			if( ext == 'html' ){
				bin += (function(){
					var fin = '';
						fin += '<script data-broccoli-receive-message="yes">'+"\n";
						// fin += 'console.log(window.location);'+"\n";
						fin += 'window.addEventListener(\'message\',(function() {'+"\n";
						fin += 'return function f(event) {'+"\n";
						// fin += 'console.log(event.origin);'+"\n";
						// fin += 'console.log(event.data);'+"\n";
						fin += 'if(window.location.origin!=\''+conf.px2server.origin+'\'){alert(\'Unauthorized access.\');return;}'+"\n";
						fin += 'if(!event.data.scriptUrl){return;}'+"\n";
						fin += 'var s=document.createElement(\'script\');'+"\n";
						fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
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
appPx2.listen(conf.px2server.originParsed.port);
