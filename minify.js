/*
minify isogame v.0.1.0 
 node minify.js deploy index.html isogame-0.1.0.min.js
 */

var UglifyJS = require("uglify-js");
var fs = require('fs');

var MINJS = /\<\!--START_MINIFY--\>([\s\S])*\<\!--END_MINIFY--\>/g;
var SCRIPTG = /<script.*?src ?= ?"([^"]+)"/g;
var SCRIPTSRC = /<script.*?src ?= ?"([^"]+)"/;

var action = process.argv[2]; // deploy || single
var afile = process.argv[3]; // can be a single js file or a deployment of html-file with script-tags between : <!--START_MINIFY--><!--END_MINIFY--> comments
var bfile = process.argv[4]; // path to minified js file
var dest  = process.argv[5]; // path to deploy to ( if not defined relative deploy-dir will be used )
if( !dest ){ dest = './deploy/'; }

if( action=="deploy" )
    deploy(); // createDestPath( 'deploy/'+bfile );
else
    single();


function deploy(){
    // create needed folder structure :
    createDestPath( dest+afile );
    createDestPath( dest+bfile );

    var file = fs.readFile( afile, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var minjs = data.match( MINJS );

        if( minjs ){ // minify script tags
            var str = data.replace( MINJS, '<script src="'+bfile+'"></script>' );
            fs.writeFile( dest+afile,
                str,
                function(err) {
                    if(err) {
                        return console.log(err);
                    } else {
                        var dev = data.match( MINJS );
                        var sm = dev[0].match( SCRIPTG );
                        var scripts = [];
                        for( var i=0; i<sm.length; i++ ){
                            scripts.push( sm[i].match(SCRIPTSRC)[1] );
                        }
                        writeMinifiedJS( scripts );
                    }
                }
            );
        }
        else
            return console.log( 'No minify comments were found in :'+ afile );
    });
}
function single(){
    writeMinifiedJS( [ afile ] );
}

function writeMinifiedJS( files ){
    console.log( 'minifying javascripts' );
    var minjs = UglifyJS.minify( files ).code;

    console.log( 'writing '+bfile);
    fs.writeFile( dest+bfile,
        minjs,
        function(err) {
            if(err) {
                return console.log(err);
            } else {
                console.log( "complete!" );
            }
        }
    );
}

function createDestPath( path ){
    var a =  path.split("/");
    for( var i=0; i< a.length ; i++ ){
        if( folderExsists( a[i] ) ){
            continue;
        }
    }
}

function folderExsists( path, mkdir, callback ){
    var mode = 0777;
    try {
        // Query the entry
        stats = fs.lstatSync( path );
        // Is it a directory?
        if (stats.isDirectory()) {
            return true;
        }
        return false;
    }
    catch (e) {
        if( mkdir ){
            try{
                fs.mkdirSync( path, 0777 );
            }
            catch(e) {
                console.log( e );
                return false;
            }
            return true;
        }
        return false;
    }
}