dojo.require('geom.all');

dojo.provide('sprites.SpriteSheet');
dojo.declare( 'sprites.SpriteSheet', null, {
	_src:null,
	_rect:null,
	_image:new Image(),
	_imageLoaded:false,
	frames:new collections.ArrayList(),
    constructor: function(src, sliceRect)
    {
        this._src = src;
        this._rect = sliceRect;
        //Load the image object in JS, then apply to canvas onload
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