this.fullscreen = this.fullscreen || {};

fullscreen.pfx = ["webkit", "moz", "ms", "o", ""];  
fullscreen.runPrefixMethod = function(obj, method) {  
    var p = 0, m, t;  
    while (p < this.pfx.length && !obj[m]) {  
        m = method;  
        if (this.pfx[p] == "") {  
            m = m.substr(0,1).toLowerCase() + m.substr(1);  
        }  
        m = this.pfx[p] + m;  
        t = typeof obj[m];  
        if (t != "undefined") {  
            this.pfx = [this.pfx[p]];  
            return (t == "function" ? obj[m]() : obj[m]);  
        }  
        p++;  
    }  
}

/**
 example use:

	var e = document.getElementById("fullscreen");  
	e.onclick = function() {  
	    if (fullscreen.runPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {  
	        fullscreen.runPrefixMethod(document, "CancelFullScreen");  
	    }  
	    else {  
	        fullscreen.runPrefixMethod(e, "RequestFullScreen");  
	    }  
	}

*/

/**

/**

The CSS

Once the browser enters full-screen mode you’ll almost certainly want to modify the styles for the element and it’s children. For example, if your element normally has a width of 500px, you’ll want to change that to 100% so it uses the space available, e.g.

#myelement  
{  
    width: 500px;  
}  
#myelement:full-screen  
{  
    width: 100%;  
}  
#myelement:full-screen img  
{  
    width: 100%;  
}  
However, you cannot use a list of vendor prefixed selectors:

// THIS DOES NOT WORK 
#myelement:-webkit-full-screen,  
#myelement:-moz-full-screen,  
#myelement:-ms-full-screen,  
#myelement:-o-full-screen,  
#myelement:full-screen  
{  
    width: 100%;  
}  
For some bizarre reason, you must repeat the styles in their own blocks or they won’t be applied:

// this works 
#myelement:-webkit-full-screen  { width: 100% }  
#myelement:-moz-full-screen     { width: 100% }  
#myelement:-ms-full-screen      { width: 100% }  
#myelement:-o-full-screen       { width: 100% }  
#myelement:full-screen          { width: 100% }

*/