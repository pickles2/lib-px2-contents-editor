/**
 * server.js
 */
var fs = require('fs');
var path = require('path');
var express = require('express'),
	app = express();
var server = require('http').Server(app);
console.log('port number is '+8080);
console.log('Pickles2 preview server port number is '+8081);


app.use( require('body-parser')() );
app.use( '/common/', express.static( path.resolve(__dirname, '../../../dist/') ) );
app.use( '/apis/px2ce', require('./apis/px2ce.js')() );

app.use( express.static( __dirname+'/../client/' ) );

// {conf.port}番ポートでLISTEN状態にする
server.listen( 8080, function(){
	console.log('server-standby');
} );



// Pickles2 preview server
var expressPickles2 = require('express-pickles2');
var appPx2 = express();
appPx2.use( require('body-parser')() );

appPx2.use( '/*', expressPickles2(
	path.resolve(__dirname, '../../htdocs/.px_execute.php'),
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
					var scriptSrc = fs.readFileSync(__dirname+'/../client/common/broccoli-html-editor/client/dist/broccoli-preview-contents.js').toString('utf-8');
					var fin = '';
						fin += '<script data-broccoli-receive-message="yes">'+"\n";
						// fin += 'console.log(window.location);'+"\n";
						fin += 'window.addEventListener(\'message\',(function() {'+"\n";
						fin += 'return function f(event) {'+"\n";
						// fin += 'console.log(event.origin);'+"\n";
						// fin += 'console.log(event.data);'+"\n";
						fin += 'if(window.location.hostname!=\'127.0.0.1\'){alert(\'Unauthorized access.\');return;}'+"\n";
						fin += 'if(!event.data.scriptUrl){return;}'+"\n";
						// fin += 'var s=document.createElement(\'script\');'+"\n";
						// fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
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
