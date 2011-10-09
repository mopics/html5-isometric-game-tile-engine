/**
TODOs : implement rotation scaling
*/
Class = js.lang.Class;

if (! ('sprites' in this)) {
    this.sprites = {};
}

sprites.Sprite = new Class()({
    __init__: function() {
        //graphic related
        this._image = null;
        this._imageLoaded = false;
        this._imageData = null;
        this._spritesheet = null;
        this._childs = new js.util.ArrayList();
        //coords & physical props
        this._x = this._px = 0;
        this._y = this._py = 0;
        this._z = this._pz = 0;
        this._width = this._pwidth = 0;
        this._height = this._pheight = 0;
		this.visible = true;
        //_rotation:0,
        this._scaleX = this._pscaleX = 1;
        this._scaleY = this._pscaleY = 1;
        this._alpha = this._palpha = 1;
        //animation related
        this._isPlaying = false;
        this.currFrame = 1;
        this.numFrames = 1;

    },
    setImage: function(url, w, h)
    {
        //Load the image object in JS, then apply to canvas onload
        this._image = new Image();
        this._imageLoaded = false;
        var self = this;
        this._image.onload = function()
        {
            self._imageLoaded = true;
            self._draw = self._drawImage;
        }
        this._image.src = url;
        this._width = w;
        this._height = h;
        this.currFrame = this.numFrames = 1;
    },
    setImageData: function(imageData)
    {
        this._imageData = imageData;
        this._draw = this._drawImageData;
        this.currFrame = this.numFrames = 1;
    },
    setSpriteSheet: function(src, rect)
    {
        this._spriteSheet = new sprites.SpriteSheet(src, rect);
        var self = this;
        this._spriteSheet.onReady = function()
        {
            self._imageLoaded = true;
            self._draw = self._drawSpriteSheetFrame;
            self.currFrame = 1;
            self.numFrames = self._spriteSheet.frames.size();
        }
        this._width = rect.width;
        this._height = rect.height;
    },
    getNumFrames: function()
    {
        return this.numFrames;
    },
    play: function()
    {
        this._isPlaying = true;
    },
    stop: function()
    {
        this._isPlaying = false
    },
    nextFrame: function()
    {
        if (this.numFrames == 1)return;

        if (this.currFrame < this.numFrames)
        {
            this.currFrame++;
        }
		else
		{
			this.currFrame = 1;
		}
    },
    prevFrame: function()
    {
        if (this.numFrames == 1) return;
        if (this.currFrame > 1)
        {
            this.currFrame--;
        }
		else
		{
			this.currFrame = numFrames;
		}
    },
    gotoAndStop: function(f)
    {
        this._isPlaying = false;
        if (f <= this.numFrames && f > 0)
        {
			this.currFrame = f;
		}
    },
    gotoAndPlay: function(f)
    {
        if (f <= this.numFrames && f > 0)
        {
			this.currFrame = f;
		}
        this._isPlaying = true;
    },
    hitTest: function(x, y, z)
    {
        //TODO
    },
    hitTest: function(sprite)
    {
        //TODO
    },
    addChild: function( c )
    {
        this._childs.add( c );
    },
    _draw: function(context, parent) {},
    _drawImage: function(context, parent) {
        if (parent) {
            context.drawImage(this._image, this._x + parent._x, this._y + parent._y, this._width, this._height);
        } else {
            context.drawImage(this._image, this._x, this._y, this._width, this._height);
        }
    },
    _drawImageData: function(context, parent) {
        if (parent) {
            context.putImageData(this._imageData, this._x + parent._x, this._y + parent._y, this._width, this._height);
        } else {
            context.putImageData(this._imageData, this._x, this._y, this._width, this._height);
        }
    },
    _drawSpriteSheetFrame: function(context, parent) {
		var rect = this._spriteSheet.getFrameData(this.currFrame);
		if (parent) {
			context.drawImage( this._spriteSheet._image, rect.x, rect.y, rect.width, rect.height, this._x + parent._x, this._y + parent._y, rect.width, rect.height );
        } else {
            context.drawImage( this._spriteSheet._image, rect.x, rect.y, rect.width, rect.height, this._x, this._y, rect.width, rect.height );
        }
		this._updateFrameCounter();
    },
	_updateFrameCounter:function(){
		if( !this._isPlaying || this.numFrames==1 ) return;
		
		if( this.currFrame==this.numFrames)
		{
			this.currFrame = 1;
		}
		else
		{
			this.currFrame ++;
		}
	},
    draw: function(context, parent)
    {
		if( !this.visible ) return;
		
		this._draw(context, parent);
		
		if( this._childs.size()==0 ) return;
        //draw kids
		var cxt = context;
		var self = this;
		this._childs.iterate( function( k, c ) {
          	//TODO add mother-rotation to childs
	        //TODO add mother-alpha to childs
            c.draw( cxt, self );
		});
    }
});

sprites.SpriteSheet = new Class()({
    __init__: function(src, sliceRect)
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
        this.frames = new js.util.ArrayList();
    },
    _sliceImage: function()
    {
        var nx = 0;
        var ny = 0;
		
        while ( ny < this._image.height)
        {
            while (nx < this._image.width)
            {
                this.frames.add( new geom.Rectangle( nx, ny, this._rect.width, this._rect.height ) );
                nx += this._rect.width;
            }
            ny += this._rect.height;
            nx = 0;
        }
    },
	getFrameData:function( f )
	{
		if( f <= this.frames.size() && f>0 )
		{
			return this.frames.get( f-1 );
		}
		return this.frames.get( 0 );
	},
    //one-per-object event functions
    onReady: function() {}
});