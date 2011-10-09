Class = js.lang.Class;

if (! ('geom' in this)) {
    this.geom = {};
}

geom.Rectangle = new Class()({
	__init__:function(x,y,w,h)
	{
		if( typeof x=='undefined' )
			this.x = 0;
		else
			this.x = x;
		if( typeof y=='undefined' )
			this.y = 0;
		else
			this.y = y;
		if( typeof w=='undefined' )
			this.width = 0;
		else
			this.width = w;
		if( typeof h=='undefined' )
			this.height = 0;
		else
			this.height = h;
	}
});

geom.Point = new Class() ({
	__init__:function(x,y)
	{
		if( typeof x=='undefined' )
			this.x = 0;
		else
			this.x = x;
		if( typeof y=='undefined' )
			this.y = 0;
		else
			this.y = y;
	}
});
