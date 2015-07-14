/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */

isogame.AIsoSheet = (function() {
	function AIsoSheet(sheet, ox, oy, supportedDirs, framesPerDir ) {
		this._supportedDirs = supportedDirs || [ true, true, true, true, true, true, true, true ];
		this._framesPerDir = framesPerDir || 1;
		this._visible = true;
		this._stopped = true;
		this._ox = ox;
		this._oy = oy;
		this._translatedSupportedDir = 0;
		this._sheet = sheet;
		this._currFrame = 0;
		this._loopStartFrame = 0;
		this._endFrame = this._framesPerDir - 1;
		this._prevFrame = 0;
		this._currDir = 0;
		this._currScale = 1;
		this._playLoops = -1;
		this._currPlayLoop = 0;

		this._allDirsArePresent = true;
		for( var i=0; i<this._supportedDirs.length; i++ ){
			var frame = i * this._framesPerDir + this._framesPerDir-1;
			if( !this._sheet.getFrameData( frame, true ) ){
				this._allDirsArePresent = false;
				console.log("isogame:AIsoSheet:::Not all dirs are present");
				break;
			}
		}
		this._currDir = this._supportedDirs.length;
		// set direction to first supported direction
		for( var i=0; i<this._supportedDirs.length; i++ ){
			if( this._supportedDirs[i] ){
				this.setDirection( i );
				break;
			}
		}
		if( this._currDir >= this._supportedDirs.length ){
			throw new Error( "Sprite must have at least one supported direction" );
		}
	}
	AIsoSheet.prototype = {
		draw: function(context, ox, oy) {
			// override by sub-class
		},
		setVisible: function(v) {
			this._visible = v;
		},
		getVisible: function() {
			return this._visible;
		},
		gotoAndStop: function(fr) {
			if (fr < this._sheet.frames.length)
				this._currFrame = fr;
			this._stopped = true;
			this._loopStartFrame = 0;
		},
		gotoAndPlay: function( fr, loops ) {
			this._setPlayLoops( loops );
			if (fr < this._sheet.frames.length)
				this._currFrame = fr;
			this._stopped = false;
			this._endFrame = this._framesPerDir-1;
			this._loopStartFrame = 0;
		},
		gotoAndPlayAndLoop:function( startFr, stopFr, loops ) {
			this._setPlayLoops( loops );
			if ( startFr < this._sheet.frames.length) {
				this._currFrame = startFr;
				this._loopStartFrame = startFr;
			}
			this._stopped = false;
			this._endFrame = stopFr;
		},
		play: function( loops ) {
			this._setPlayLoops( loops );
			this._stopped = false;
			this._endFrame = this._framesPerDir-1;
			this._loopStartFrame = 0;
		},
		_setPlayLoops:function( loops ) {
			this._playLoops = -1; // for ever
			this._currPlayLoop = 0;
			if( loops > 0 )
				this._playLoops = loops;
		},
		stop: function() {
			this._stopped = true;
			this._loopStartFrame = 0;
		},
		setDirection: function( d ) {
			if( this._supportedDirs[ d ] ) {
				this._currDir = this._translatedSupportedDir = d;
				if( !this._allDirsArePresent ) {
					this._translatedSupportedDir = -1;
					// translate currDir using _supportedDirs array
					for( var i=0; i<this._supportedDirs.length; i++ ) {
						if( this._supportedDirs[ i ] ) {
							this._translatedSupportedDir ++;
						}
						if( this._currDir == i ) {
							break;
						}
					}
				}
			}
		},
		setScale:function( sc ) {
			this._currScale = sc;
		}
	};
	return AIsoSheet;
}());

isogame.IsoAnimationSheet = (function() { // extends isogame.AIsoSheet
	function IsoAnimationSheet(sheet, ox, oy, framesPerDir, supportedDirs) {
		// call super constructor !!
		isogame.AIsoSheet.apply(this, [ sheet, ox, oy, supportedDirs, framesPerDir ]);
		this.type = IsoAnimationSheet.TYPE;
	}
	// inherit superclass stuff
	IsoAnimationSheet.prototype = ooputils.inherit(isogame.AIsoSheet.prototype);
	// use extend method to extend
	ooputils.extend(IsoAnimationSheet.prototype, {
		// overide constructor
		constructor: IsoAnimationSheet,
		// method overrides
		draw: function(context, ox, oy) {
			if (this._visible){
				var rect = this._sheet.getFrameData( this._translatedSupportedDir * this._framesPerDir + this._currFrame );
				//var rect = this._sheet.getFrameData( this._currDir * this._framesPerDir + this._currFrame );
				if( rect ) {
					ox += this._ox*this._currScale;
					oy += this._oy*this._currScale;
					context.drawImage(this._sheet._image,
						rect.x, rect.y, rect.width, rect.height, // source rect
						ox, oy, rect.width*this._currScale, rect.height*this._currScale
					);
				}
			}
		}
	});
	// own methods
	IsoAnimationSheet.prototype.update = function() {
		// loop animation
		if ( !this._stopped ) {
			this._prevFrame = this._currFrame;
			if ( this._currFrame < this._endFrame ) {
				this._currFrame++;
			} else {
				this._currPlayLoop ++;
				if( this._currPlayLoop == this._playLoops ) {
					this.stop();
				}
				else{
					this._currFrame = this._loopStartFrame;
				}
			}
		}
	}
	IsoAnimationSheet.TYPE = "animated";

	return IsoAnimationSheet;
}());

isogame.IsoStillSheet = (function() { // extends isogame.AIsoSheet
	function IsoStillSheet(sheet, ox, oy, supportedDirs ) {
		// call super constructor !!
		isogame.AIsoSheet.apply(this, [sheet, ox, oy, supportedDirs, 1 ] );
		this.type = IsoStillSheet.TYPE;
	}
	// inherit superclass stuff
	IsoStillSheet.prototype = ooputils.inherit(isogame.AIsoSheet.prototype);
	// use extend method to extend
	ooputils.extend(IsoStillSheet.prototype, {
		// overide constructor
		constructor: IsoStillSheet,
		// method overrides
		draw: function(context, ox, oy) {
			if ( this._visible){
				var rect = this._sheet.getFrameData( this._translatedSupportedDir );
				if( rect ) {
					ox += this._ox*this._currScale;
					oy += this._oy*this._currScale;
					context.drawImage(this._sheet._image,
						rect.x, rect.y, rect.width, rect.height, // source rect
						ox, oy, rect.width*this._currScale, rect.height*this._currScale
					);
				}
			}
		}
	});
	IsoStillSheet.TYPE =  "still";

	return IsoStillSheet;
}());

isogame.PngSheet = (function() {
	function PngSheet(src, sliceRect) {
		this._rect = sliceRect;
		this.frames = [];

		if( !src ){
			console.log( "foo" );
		}
		if (src.src) { // if src is an already loaded Image object
			this._src = src.src;
			this._image = src;
			this._imageLoaded = true;
			this._sliceImage();
			this.onReady();

		} else {
			//Load the image object in JS, then apply to canvas onload
			this._src = src;
			this._image = new Image();
			this._imageLoaded = false;
			var self = this;
			this._image.onload = function() {
				self._imageLoaded = true;
				self._sliceImage();
				self.onReady();
			}
			this._image.src = src;
		}
	}
	PngSheet.prototype = {
		_sliceImage: function() {
			var nx = 0;
			var ny = 0;

			while (ny < this._image.height) {
				while (nx < this._image.width) {
					this.frames.push(new isogame.Rectangle(nx, ny, this._rect.width, this._rect.height));
					nx += this._rect.width;
				}
				ny += this._rect.height;
				nx = 0;
			}
		},
		getFrameData: function( f, returnNull) {
			var fr = this.frames
			if (f <= fr.length && f > -1) {
				return fr[f];
			}
			if( returnNull ){
				return null;
			}
			return fr[0];
		},
		//one-per-object event functions
		onReady: function() {}
	};
	return PngSheet;
}());




/**
 * single dir animation sheet
 * f.e. used in ebabel - the door(open) animation
 */
isogame.IsoDirAnimationSheet = (function(){
	function IsoDirAnimationSheet(sheet, ox, oy, frames ) {
		// call super constructor !!
		isogame.AIsoSheet.apply(this, [ sheet, ox, oy ]);
		this._frames = frames;
		this.type = IsoDirAnimationSheet.TYPE;
	}
	// inherit superclass stuff
	IsoDirAnimationSheet.prototype = ooputils.inherit(isogame.AIsoSheet.prototype);
	// use extend method to extend
	ooputils.extend(IsoDirAnimationSheet.prototype, {
		// overide constructor
		constructor: IsoDirAnimationSheet,
		// method overrides :
		draw: function( context, ox, oy ) {
			if (this._visible){
				var rect = this._sheet.getFrameData( this._currFrame );
				if( rect ) {
					ox += this._ox*this._currScale;
					oy += this._oy*this._currScale;
					context.drawImage(this._sheet._image,
						rect.x, rect.y, rect.width, rect.height, // source rect
						ox, oy, rect.width*this._currScale, rect.height*this._currScale
					);
				}
			}
		}
	});
	// own methods
	IsoDirAnimationSheet.prototype.update = function() {
		// loop animation
		if ( !this._stopped ) {
			this._prevFrame = this._currFrame;
			if (this._currFrame < this._frames - 1) {
				this._currFrame++;
			} else {
				this._currFrame = 0;
				this._currPlayLoop ++;
				if( this._currPlayLoop==this._playLoops ){
					this.stop();
					this.animationComplete();
				}
			}
		}
	}
	IsoDirAnimationSheet.TYPE = "singlediranimated";

	return IsoDirAnimationSheet;
}())
