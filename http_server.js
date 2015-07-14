var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "./";

var mimeTypes ={
	"js":"text/javascript",
	"json":"text/data",
	"html":"text/html",
	"png":"image/png",
	"jpg":"image/jpg",
	"jpeg":"image/jpeg"
}
http.createServer( function( req, res ) {
	
	var urlObj = url.parse( req.url, true, false );
	var tmp  = urlObj.pathname.lastIndexOf(".");
	var extension  = urlObj.pathname.substring((tmp + 1));
	
	fs.readFile( ROOT_DIR + urlObj.pathname, function( err, data ){
		if( err ){
			res.writeHead(404);
			res.end(JSON.stringify( err ) );
			return;
		}
		if( mimeTypes[ extension ] ){
			res.writeHead(200, {'Content-Type': mimeTypes[extension]});
		}
		else {
			res.writeHead(200);
		}
		res.end(data);
	} )
}).listen( 8080 );