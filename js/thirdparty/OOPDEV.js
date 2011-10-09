if (! ('S3_COMPONENTS' in this)) {
    this.S3_COMPONENTS = {};
}

S3_COMPONENTS.util = function() {

    this.version = function() {
        return this.META.version;
    }

    var privateVar = "this is private...";


    this.getPrivateVar = function() {
        return privateVar;
    }
    this.getPrivateVarViaMethod = function() {
        return noThisgetPrivateVar();
    }


    var noThisgetPrivateVar = function() {
        return privateVar;
    }






};

S3_COMPONENTS.util.prototype = {
    META: {


        version: "001"


    }
};

var s = new S3_COMPONENTS.util();

document.writeln(s.getPrivateVar());
//this is private...
document.writeln(s.getPrivateVarViaMethod());
//this is private...
document.writeln(s.privateVar);
//undefined
document.writeln(s.META.version);
//001
document.writeln(s.version());
//001
