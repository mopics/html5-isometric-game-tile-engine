/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */

isogame.AIsoSheet = (function() {
	function AIsoSheet(sheet, ox, oy) {
		this._visible = true;
		this._stopped = true;
		this._ox = ox;
		this._oy = oy;
		this._dir = 0;
		this._sheet = sheet;
		this._currFrame = 0;
		this._prevFrame = 0;
		this._currDir = 0;
		this._playLoops = -1;
		this._currPlayLoop = 0;
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
		},
		gotoAndPlay: function(fr) {
			if (fr < this._sheet.frames.length)
				this._currFrame = fr;
			this._stopped = false;
		},
		play: function( loops ) {
			this._playLoops = -1; // for ever
			this._currPlayLoop = 0;
			if( loops > 0 )
				this._playLoops = loops;
			this._stopped = false;
		},
		stop: function() {
			this._stopped = true;
		},
		setDirection: function(d) {
			this._currDir = d;
		}
	};
	return AIsoSheet;
}());

isogame.IsoAnimationSheet = (function() { // extends isogame.AIsoSheet
	function IsoAnimationSheet(sheet, ox, oy, framesPerDir) {
		// call super constructor !!
		isogame.AIsoSheet.apply(this, arguments);
		this._framesPerDir = framesPerDir;
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
				var rect = this._sheet.getFrameData(this._currDir * this._framesPerDir + this._currFrame);
				if( rect ) {
					ox += this._ox;
					oy += this._oy;
					context.drawImage(this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height);
				}
			}
		}
	});
	// own methods
	IsoAnimationSheet.prototype.update = function() {
		// loop animation
		if ( !this._stopped ) {
			this._prevFrame = this._currFrame;
			if (this._currFrame < this._framesPerDir - 1) {
				this._currFrame++;
			} else {
				this._currFrame = 0;
				this._currPlayLoop ++;
				if( this._currPlayLoop==this._playLoops ){
					this.stop();
				}
			}
		}
	}
	return IsoAnimationSheet;
}());
/**
 * single dir animation sheet 
*/
isogame.IsoDirAnimationSheet = (function(){
	function IsoDirAnimationSheet(sheet, ox, oy, frames ) {
		// call super constructor !!
		isogame.AIsoSheet.apply(this, arguments);
		this._frames = frames;
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
				var rect = this._sheet.getFrameData( this._currFrame);
				if( rect ) {
					ox += this._ox;
					oy += this._oy;
					context.drawImage(this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height);
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
	return IsoDirAnimationSheet;
}())
isogame.IsoStillSheet = (function() { // extends isogame.AIsoSheet
	function IsoStillSheet(sheet, ox, oy) {
		// call super constructor !!
		isogame.AIsoSheet.apply(this, arguments);
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
				var rect = this._sheet.getFrameData(this._currDir);
				if( rect ) {
					ox += this._ox;
					oy += this._oy;
					context.drawImage(this._sheet._image, rect.x, rect.y, rect.width, rect.height, ox, oy, rect.width, rect.height);
				}
			}
		}
	});

	return IsoStillSheet;
}());
isogame.PngSheet = (function() {
	function PngSheet(src, sliceRect) {
		this._rect = sliceRect;
		this.frames = [];
		
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
		getFrameData: function(f) {
			var fr = this.frames
			if (f <= fr.length && f > 0) {
				return fr[f];
			}
			return fr[0];
		},
		//one-per-object event functions
		onReady: function() {}
	};
	return PngSheet;
}());