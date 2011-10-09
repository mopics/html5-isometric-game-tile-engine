var lines= 0;
var maxlines= 24;

function init()
{
    if (document.addEventListener)
    {
       document.addEventListener("keydown",keydown,false);
       document.addEventListener("keypress",keypress,false);
       document.addEventListener("keyup",keyup,false);
       document.addEventListener("textInput",textinput,false);
    }
    else if (document.attachEvent)
    {
       document.attachEvent("onkeydown", keydown);
       document.attachEvent("onkeypress", keypress);
       document.attachEvent("onkeyup", keyup);
       document.attachEvent("ontextInput", textinput);
    }
    else
    {
       document.onkeydown= keydown;
       document.onkeypress= keypress;
       document.onkeyup= keyup;
       document.ontextinput= textinput;   // probably doesn't work
    }

    document.testform.t.value+= '';
    lines= 0;
}

function showmesg(t)
{
   //var old= document.forms['testform'].elements[0].value;
   var old= document.testform.t.value;
   if (lines >= maxlines)
   {
   	var i= old.indexOf('\n');
	if (i >= 0)
	    old= old.substr(i+1);
   }
   else
   	lines++;

   document.testform.t.value= old + t + '\n';
}

function keyval(n)
{
    if (n == null) return 'undefined';
    var s= '' + n;
    if (n >= 32 && n < 127) s+= ' (' + String.fromCharCode(n) + ')';
    while (s.length < 9) s+= ' ';
    return s;
}

function pressmesg(w,e)
{
   showmesg(w + '  keyCode=' + keyval(e.keyCode) +
                 ' which=' + keyval(e.which) +
                 ' charCode=' + keyval(e.charCode));
   showmesg('          shiftKey='+e.shiftKey
	      + ' ctrlKey='+e.ctrlKey
	      + ' altKey='+e.altKey
	      + ' metaKey='+e.metaKey);
}

function keymesg(w,e)
{
   showmesg(w + '  keyCode=' + keyval(e.keyCode) +
                 ' which=' + keyval(e.which) +
                 ' charCode=' + keyval(e.charCode));
   showmesg('          keyIdentifier='+ e.keyIdentifier
	      + ' keyLocation='+e.keyLocation);
   showmesg('          shiftKey='+e.shiftKey
	      + ' ctrlKey='+e.ctrlKey
	      + ' altKey='+e.altKey
	      + ' metaKey='+e.metaKey);
}

function suppressdefault(e,flag)
{
   if (flag)
   {
       if (e.preventDefault) e.preventDefault();
       if (e.stopPropagation) e.stopPropagation();
   }
   return !flag;
}

function keydown(e)
{
   if (!e) e= event;
   keymesg('keydown ',e);
   return suppressdefault(e,document.testform.keydown.checked);
}

function keyup(e)
{
   if (!e) e= event;
   keymesg('keyup   ',e);
   return suppressdefault(e,document.testform.keyup.checked);
}

function keypress(e)
{
   if (!e) e= event;
   pressmesg('keypress',e);
   return suppressdefault(e,document.testform.keypress.checked);
}

function textinput(e)
{
   if (!e) e= event;
   //showmesg('textInput  data=' + e.data);
   showmesg('textInput data='+e.data);
   return suppressdefault(e,document.testform.textinput.checked);
}

