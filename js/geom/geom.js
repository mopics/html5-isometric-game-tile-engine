if (! ('geom' in this)) {
    this.geom = {};
}

dojo.declare(
	'geom.Rectangle',
	null,
	{
		x:0,
		y:0,
		width:0,
		height:0,
		constructor:function(x,y,w,h){
			if( typeof x!='undefined' )
				this.x = parseInt( x );
			if( typeof y!='undefined' )
				this.y = parseInt( y );
			if( typeof w!='undefined' )
				this.width = parseInt( w );
			if( typeof h!='undefined' )
				this.height = parseInt( h );
		}
	}
);

dojo.declare(
	'geom.Point',
	null,
	{
		x:0,
		y:0,
		constructor:function(x,y)
		{
			if( typeof x!='undefined' )
				this.x = parseInt( x );
			if( typeof y!='undefined' )
				this.y = parseInt( y );
		}
	}
);
