if (! ('isogame' in this)) {
    this.isogame = {};
}

dojo.declare( 'isogame.Movable', null, {
	constructor:function()
	{
		this.animatedSprites = new Array();
		this.stillSprites = new Array();
		this.displayList = new Array();
		this.relX = 0;
		this.relY = 0;
		this.initialXindex = 0;
		this.initialYindex = 0;
		this.Xindex = 0;
		this.Yindex = 0;
		this.mover = null;
		this.direction = 0;
	},
	addAnimatedSpriteSheet:function( sheet )
	{
		this.animatedSprites.push( sheet );
		this.displayList.push( sheet );
	},
	addStillSpriteSheet:function( sheet )
	{
		this.stillSprites.push( sheet );
		this.displayList.push( sheet );
	},
	update:function()
	{
		this.mover.update();
		for( var i=0; i<this.animatedSprites.length; i++ )
		{
			this.animatedSprites[i].update();
		}
	},
	draw:function( context, x, y )
	{
		for( var i=0; i<this.displayList.length; i++ )
		{
			this.displayList[i].draw( context, x, y );
		}
	},
	gotoAndStop:function(fr)
	{
		for( var i=0; i<this.animatedSprites.length; i++ )
		{
			this.animatedSprites[i].gotoAndStop( fr );
		}
	},
	gotoAndPlay:function(fr)
	{
		for( var i=0; i<this.animatedSprites.length; i++ )
		{
			this.animatedSprites[i].gotoAndPlay( fr );
		}
	},
	play:function()
	{
		for( var i=0; i<this.animatedSprites.length; i++ )
		{
			this.animatedSprites[i].play();
		}
	},
	stop:function(){
		for( var i=0; i<this.animatedSprites.length; i++ )
		{
			this.animatedSprites[i].stop();
		}
	},
	setDirection:function( dir )
	{
		this.direction = dir;
		for( var i=0; i<this.displayList.length; i++ )
		{
			this.displayList[i].setDirection(dir);
		}
	},
	getDirection:function() { return this.direction; },
	asignMover:function( mover ){  this.mover = mover; },
	getMover:function(){  return this.mover; }
});

dojo.declare('isogame.FirstPerson', [isogame.Movable], {  // extends Movable
	constructor:function(){}
});
dojo.declare('isogame.Enemy', [isogame.Movable], {
	constructor:function(){}
});



// isometric sprite sheets
dojo.declare( 'isogame.AIsoSheet', null, {
	constructor:function( sheet, ox, oy )
	{
		this._visible = true;
		this._stopped = true;
		this._ox = ox;
		this._oy = oy;
		this._dir = 0;
		this._sheet = sheet;
		this._currFrame = 0;
		this._prevFrame = 0;
		this._currDir = 0;
	},
	draw:function( context, ox, oy )
	{
		// override by sub-class
	},
	setVisible:function( v )
	{
		this._visible = v;
	},
	getVisible:function()
	{
		return this._visible;
	},
	gotoAndStop:function(fr)
	{
		if(fr<this._sheet.frames.length)
			this._currFrame = fr;
		this._stopped = true;
	},
	gotoAndPlay:function(fr)
	{
		if(fr<this._sheet.frames.length)
			this._currFrame = fr;
		this._stopped = false;
	},
	play:function()
	{
		this._stopped = false;
	},
	stop:function()
	{
		this._stopped = true;
	},
	setDirection:function(d)
	{
		this._currDir = d;
	}
});

dojo.declare( 'isogame.IsoAnimationSheet', [isogame.AIsoSheet], {
	constructor:function( sheet, ox, oy, framesPerDir )
	{
		this._framesPerDir = framesPerDir;
	},
	update:function()
	{
		if(!this._stopped)
		{
			this._prevFrame = this._currFrame;
			if( this._currFrame < this._framesPerDir-1 )
			{
				this._currFrame++;
			}
			else
			{
				this._currFrame=0;
			}
		}
	},
	draw:function( context, ox, oy )
	{
		if ( !this._visible  )
			return;
		var rect = this._sheet.getFrameData( this._currDir* this._framesPerDir+ this._currFrame );
		ox += this._ox;
		oy += this._oy;
		context.drawImage( this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height );
	},
});
dojo.declare( 'isogame.IsoStillSheet', [isogame.AIsoSheet], {
	constructor:function( sheet, ox, oy ){},
	draw:function( context, ox, oy )
	{
		if ( !this._visible )
			return;
		var rect = this._sheet.getFrameData( this._currDir );
		ox += this._ox;
		oy += this._oy;
		context.drawImage( this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height );
	}
});

dojo.declare( 'isogame.PngSheet', null, {
    constructor: function(src, sliceRect)
    {
        this._src = src;
        this._rect = sliceRect;
        //Load the image object in JS, then apply to canvas onload
        this._image = new Image();
        this._imageLoaded = false;
        var self = this;
        this._image.onload = function()
        {
            self._imageLoaded = true;
			self._sliceImage();
            self.onReady();
        }
        this._image.src = src;
        this.frames = new Array();
    },
    _sliceImage: function()
    {
        var nx = 0;
        var ny = 0;
		
        while ( ny < this._image.height)
        {
            while (nx < this._image.width)
            {
                this.frames.push( new geom.Rectangle( nx, ny, this._rect.width, this._rect.height ) );
                nx += this._rect.width;
            }
            ny += this._rect.height;
            nx = 0;
        }
    },
	getFrameData:function( f )
	{
		if( f <= this.frames.length && f>0 )
		{
			return this.frames[ f ];
		}
		return this.frames[ 0 ];
	},
    //one-per-object event functions
    onReady: function() {}
});
