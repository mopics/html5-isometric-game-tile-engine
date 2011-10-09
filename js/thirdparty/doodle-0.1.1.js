/* doodle-0.1.1 - http://www.lamberta.org/blog/doodle */
/**
 * Compatibility
 **/

/* Array methods */

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /*, from*/) {
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		
		if (from < 0){ from += len; }
		
		for (; from < len; from++) {
			if (from in this && this[from] === elt){ return from; }
		}
		return -1;
	};
}

if (!Array.prototype.lastIndexOf) {
	Array.prototype.lastIndexOf = function(elt /*, from*/) {
		var len = this.length;
		var from = Number(arguments[1]);

		if (isNaN(from)) {
			from = len - 1;
		}else {
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			
			if (from < 0) {
				from += len;
			}else if (from >= len){
				from = len - 1;
			}
		}
		
		for (; from > -1; from--) {
			if (from in this && this[from] === elt){ return from; }
		}
		return -1;
	};
}

if (!Array.prototype.filter) {
	Array.prototype.filter = function(fun /*, thisp*/) {
		var len = this.length;
		
		if (typeof fun != "function"){ throw new TypeError(); }
		
		var res = new Array();
		var thisp = arguments[1];
		
		for (var i = 0; i < len; i++) {
			if (i in this) {
				var val = this[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, this))
					res.push(val);
			}
		}	
		return res;
	};
}

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fun /*, thisp*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();
		
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this)
				fun.call(thisp, this[i], i, this);
		}
	};
}

if (!Array.prototype.every) {
	Array.prototype.every = function(fun /*, thisp*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();
		
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this &&
				!fun.call(thisp, this[i], i, this))
				return false;
		}
		return true;
	};
}

if (!Array.prototype.map) {
	Array.prototype.map = function(fun /*, thisp*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();
		
		var res = new Array(len);
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this)
				res[i] = fun.call(thisp, this[i], i, this);
		}
		return res;
	};
}

if (!Array.prototype.some) {
	Array.prototype.some = function(fun /*, thisp*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();
		
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this &&
				fun.call(thisp, this[i], i, this))
				return true;
		}
		return false;
	};
}

if (!Array.prototype.reduce) {
	Array.prototype.reduce = function(fun /*, initial*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();

		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1)
			throw new TypeError();
		
		var i = 0;
		if (arguments.length >= 2) {
			var rv = arguments[1];
		} else {
			do {
				if (i in this) {
					rv = this[i++];
					break;
				}
				
				// if array contains no values, no initial value to return
				if (++i >= len)
					throw new TypeError();
			}while (true);
		}
		
		for (; i < len; i++) {
			if (i in this)
				rv = fun.call(null, rv, this[i], i, this);
		}
		return rv;
	};
}

if (!Array.prototype.reduceRight) {
	Array.prototype.reduceRight = function(fun /*, initial*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function")
			throw new TypeError();
		
		// no value to return if no initial value, empty array
		if (len == 0 && arguments.length == 1)
			throw new TypeError();
		
		var i = len - 1;
		if (arguments.length >= 2) {
			var rv = arguments[1];
		}else {
			do {
				if (i in this) {
					rv = this[i--];
					break;
				}
				
				// if array contains no values, no initial value to return
				if (--i < 0)
					throw new TypeError();
			} while (true);
		}
		
		for (; i >= 0; i--) {
			if (i in this)
				rv = fun.call(null, rv, this[i], i, this);
		}
		
		return rv;
	};
}

if (typeof Array.isArray !== "function") {
	Array.isArray = function( array ) {
		return Object.prototype.toString.call( array ) === "[object Array]";
	};	
}
//alias for isArray
if (typeof Array.arrayp !== "function") {
	Array.arrayp = Array.isArray;
}
/* bind(thisObj[, arg...]) */
if(typeof Function.prototype.bind !== "function") {
	Function.prototype.bind = function (context) {
		var fn = this;
		return function(){
			return fn.apply(context, arguments);
		};
	};
}
if ( typeof Object.getPrototypeOf !== "function" ) {
  if ( typeof "test".__proto__ === "object" ) {
    Object.getPrototypeOf = function(object){
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function(object){
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    };
  }
}

var $doodle = {};

function throwError(type, msg) {
	throw new type(msg);
}


$doodle.utils = {};

$doodle.utils.parse = {};

$doodle.utils.parse.relativeEquation = function (old, str) {
	//get value in string equation
	var n  = parseFloat(str.substr(2));
	
	switch(str.substr(0,2)/*get operator*/) {
	 case '+=': old += n; break;
	 case '-=': old -= n; break;
	 case '*=': old *= n; break;
	 case '/=': old /= n; break;
	 case '%=': old %= n; break;
	 default: old = str; //not found, just apply
	}
	return old; //what's old is new again
};

$doodle.utils.parse.rotation = function (str/*degrees*/) {
	var a = parseFloat(str);
	if(!str.match(/rad/i)){ a = a * Math.PI/180; }//degrees to radians
	return a;
};

$doodle.utils.draw = {};

$doodle.utils.draw.circle = function (ctx, radius, color) {
	ctx.fillStyle = color;// || '#000000';
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
};

$doodle.utils.draw.axis = function (obj) {
	var fillColor;
	
	//assuming context has already been moved for object
	obj.context.save(); //always 'source-over'
	
	if(obj.axis.coord === 'local') {
		fillColor = '#FF0000';
		obj.context.translate(obj.axis.x, obj.axis.y);
	}else if(obj.axis.coord === 'global') {
		fillColor = '#009999';
		obj.context.translate(obj.axis.x - obj.x, obj.axis.y - obj.y);
	}else {
		
	}
	
	obj.context.globalAlpha = 1;
	
	$doodle.utils.draw.circle(obj.context, 3, '#000000'); //stroke
	$doodle.utils.draw.circle(obj.context, 2, fillColor); //fill
	
	obj.context.restore();
};

//animate is just a proof-of-concept for now
$doodle.animate = function (draw, framerate, clear) {
	
	if(typeof draw !=='function'){
		throw new TypeError("doodle.animate: Must execute a function."); }

	framerate = (typeof framerate !=='undefined') ? framerate : 42; //24fps
	
	if(typeof clear ==='undefined'){ clear = true; }//clear screen by default

	var _framerate;
	var render;
	var ctx = $doodle.canvas().context;
	
	var self = {}; //animation control object
	self.ing = true;
	
	self.play = function (fps) {
		//if no args, just return current framerate
		if(arguments.length === 0){ return _framerate; }

		if(fps === false){ clearInterval(render); }//turn off
		else if(fps === true){ setInterval(render_frame, _framerate); }//restart
		else{
			if(typeof fps ==='string') {
				if(fps.match(/fps/i)){ fps = (1000 / parseInt(fps, 10)) | 0; }
				else if(fps.match(/sec/i)){ fps = (1000 * parseFloat(fps)) | 0; }
			}
			_framerate = fps;
			
			//stop and start renderloop
			clearInterval(render);
			render = setInterval(render_frame, _framerate);
		}
	};

	
	self.play(framerate); //set fps and start loop
	
	function render_frame() {
		if(clear) {
			//clear everything, redraw background
			ctx.save();
			$doodle.canvas().clear();
			ctx.restore();
		}
		draw();
	}
};

$doodle.utils.time = function (fn, count, total) {
	if (typeof count === 'undefined') count = 1000;
	if (typeof total === 'undefined') total = false;
	var diff = 0,
		start = (new Date);
	
	for (var n = 0; n < count; n = n + 1) {
		fn();
	}
	diff = (new Date);
	diff = diff.getTime() - start.getTime();
	
	if (total) {
		console.log("Elapsed time (total): " + diff + " msecs");
	} else {
		console.log("Elapsed time (avg): " + (diff / count) + " msecs");
	}
	return fn();
};
/**
 * The n-functions are short for "non-concating". These do not create
 * new array objects, but overwrite the first array values.
**/

//namespacing
if (!$doodle) {
	var $doodle = {};
}
if (!$doodle.Matrix) {
	$doodle.Matrix = {};
}

//a matrix is an array containing 6 numbers
$doodle.Matrix.isMatrix = function (m1) {
	if (Array.isArray(m1) && m1.length === 6) {
		var i = m1.length;
		while (--i > -1) {
			if (typeof m1[i] !== 'number') {
				return false;
			}
		}
		return true;
	} else {
		return false;
	}
};
//alias
$doodle.matrixp = $doodle.Matrix.isMatrix;

$doodle.Matrix.identity = function () {
	var m = new Array(6);
	m[0] = 1;
	m[1] = 0;
	m[2] = 0;
	m[3] = 1;
	m[4] = 0;
	m[5] = 0;
	return m;
};

$doodle.Matrix.nidentity = function (m1)  {
	if ($doodle.Matrix.isMatrix(m1)) {
		m1[0] = 1;
		m1[1] = 0;
		m1[2] = 0;
		m1[3] = 1;
		m1[4] = 0;
		m1[5] = 0;
		return m1;
	}
	//otherwise...
	throw new TypeError("Matrix.nidentity: argument is not a matrix.");
};

$doodle.Matrix.create = function (a, b, c, d, tx, ty) {
	var len = arguments.length,
		m;

	if (len === 6) {
		//given 6 numbers
		m = Array.prototype.slice.call(arguments);
		if ($doodle.Matrix.isMatrix(m)) {
			return m;
		}
	} else if (len === 1) {
		//given an array, returns different object
		m = arguments[0].concat();
		if ($doodle.Matrix.isMatrix(m)) {
			return m;
		}
	}
	//otherwise...
	throw new SyntaxError("Matrix.create: A matrix requires 6 numbers.");
};

//given a literal, reuse
$doodle.Matrix.ncreate = function (m1) {
	if ($doodle.Matrix.isMatrix(m1)) {
		return m1;
	} else {
		var m = Array.prototype.slice.call(arguments);
		$doodle.Matrix.create(m);
	}
};

$doodle.Matrix.add = function (m1, m2) {
	var m = new Array(6);
	m[0] = m1[0] + m2[0];
	m[1] = m1[1] + m2[1];
	m[2] = m1[2] + m2[2];
	m[3] = m1[3] + m2[3];
	m[4] = m1[4] + m2[4];
	m[5] = m1[5] + m2[5];
	return m;
};

$doodle.Matrix.nadd = function (m1, m2) {
	m1[0] = m1[0] + m2[0];
	m1[1] = m1[1] + m2[1];
	m1[2] = m1[2] + m2[2];
	m1[3] = m1[3] + m2[3];
	m1[4] = m1[4] + m2[4];
	m1[5] = m1[5] + m2[5];
	return m1;
};

/*
 * m11 m21 dx   m[0], m[2], m[4]
 * m12 m22 dy   m[1], m[3], m[5]
 *  0   0  1
 */
$doodle.Matrix.multiply = function (m1, m2) {
	var m = new Array(6);
	m[0] = m1[0] * m2[0] + m1[2] * m2[1];
	m[1] = m1[1] * m2[0] + m1[3] * m2[1];
	m[2] = m1[0] * m2[2] + m1[2] * m2[3];
	m[3] = m1[1] * m2[2] + m1[3] * m2[3];
	m[4] = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
	m[5] = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
	return m;
};

$doodle.Matrix.nmultiply = function (m1, m2) {
	var a = m1[0] * m2[0] + m1[2] * m2[1],
		b = m1[1] * m2[0] + m1[3] * m2[1],
		c = m1[0] * m2[2] + m1[2] * m2[3],
		d = m1[1] * m2[2] + m1[3] * m2[3];
	m1[4] = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
	m1[5] = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
	m1[0] = a;
	m1[1] = b;
	m1[2] = c;
	m1[3] = d;
	return m1;
};

$doodle.Matrix.translate = function (m1, dx, dy) {
	return $doodle.Matrix.multiply(m1, [1, 0, 0, 1, dx, dy]);
};

$doodle.Matrix.ntranslate = function (m1, dx, dy) {
	return $doodle.Matrix.nmultiply(m1, [1, 0, 0, 1, dx, dy]);
};

$doodle.Matrix.rotate = function (m1, angle /*radians*/) {
	var sin = Math.sin(angle),
		cos = Math.cos(angle);
	return $doodle.Matrix.multiply(m1, [cos, sin, -sin, cos, 0, 0]);
};

$doodle.Matrix.nrotate = function (m1, angle /*radians*/) {
	var sin = Math.sin(angle),
		cos = Math.cos(angle);
	return $doodle.Matrix.nmultiply(m1, [cos, sin, -sin, cos, 0, 0]);
};

//get angle in radians of rotation in a matrix
$doodle.Matrix.rotation = function (m1) {
	return Math.atan2(m1[1], m1[0]);
};

$doodle.Matrix.scale = function (m1, sx, sy) {
	return $doodle.Matrix.multiply(m1, [sx, 0, 0, sy, 0, 0]);
};

$doodle.Matrix.nscale = function (m1, sx, sy) {
	return $doodle.Matrix.nmultiply(m1, [sx, 0, 0, sy, 0, 0]);
};

$doodle.Matrix.skew = function (m1, sx, sy) {
	var skewX = Math.tan(sx),
		skewY = Math.tan(sy);
	return $doodle.Matrix.multiply(m1, [1, skewY, skewX, 1, 0, 0]);
};

$doodle.Matrix.nskew = function (m1, sx, sy) {
	var skewX = Math.tan(sx),
		skewY = Math.tan(sy);
	return $doodle.Matrix.nmultiply(m1, [1, skewY, skewX, 1, 0, 0]);
};

//when a matrix is multiplied by it's inversion matrix
//it returns an identity matrix.
//this function doesn't always work
$doodle.Matrix.invert = function (m1) {
	var m = new Array(6),
		det =  m1[0] * m1[3] - m1[1] * m1[2];
	m[0] =  m1[3] / det;
	m[1] = -m1[1] / det;
	m[2] = -m1[2] / det;
	m[3] =  m1[0] / det;
	m[4] =  (m1[5] * m1[2] - m1[3] * m1[4]) / det;
	m[5] = -(m1[5] * m1[0] - m1[1] * m1[4]) / det;
	return m;
};

$doodle.Matrix.transformPoint = function (m1, p) {
	return {
		x: p.x * m1[0] + p.y * m1[1] + m1[4],
		y: p.x * m1[2] + p.y * m1[3] + m1[5]
	};
};

$doodle.Matrix.ntransformPoint = function (m1, p) {
	var x = p.x * m1[0] + p.y * m1[1] + m1[4],
		y = p.x * m1[2] + p.y * m1[3] + m1[5];
	p.x = x;
	p.y = y;
	return p;
};

//same as transformPoint, except matrix translate has no effect
$doodle.Matrix.deltaTransformPoint = function (m1, p) {
	return {
		x: p.x * m1[0] + p.y * m1[1],
		y: p.x * m1[2] + p.y * m1[3]
	};
};

$doodle.Matrix.ndeltaTransformPoint = function (m1, p) {
	var x = p.x * m1[0] + p.y * m1[1],
		y = p.x * m1[2] + p.y * m1[3];
	p.x = x;
	p.y = y;
	return p;
};



$doodle.Matrix.rotateAroundExternalPoint = function (m1, x, y, angle /*degrees*/) {
	var m = $doodle.Matrix.translate(m1, x, y);
	$doodle.Matrix.nrotate(m, angle * Math.PI / 180);
	m[4] -= x;
	m[5] -= y;
	return m;
};

$doodle.Matrix.nrotateAroundExternalPoint = function (m1, x, y, angle /*degrees*/) {
	m1[4] += x;
	m1[5] += y;
	$doodle.Matrix.nrotate(m1, angle * Math.PI / 180);
	m1[4] -= x;
	m1[5] -= y;
	return m1;
};

$doodle.Matrix.rotateAroundInternalPoint = function (m1, x, y, angle /*degrees*/) {
	var p = $doodle.Matrix.transformPoint(m1, {x: x, y: y}),
		m = $doodle.Matrix.rotateAroundExternalPoint(m1, p.x, p.y, angle);
	return m;
};

$doodle.Matrix.nrotateAroundInternalPoint = function (m1, x, y, angle /*degrees*/) {
	var p = $doodle.Matrix.transformPoint(m1, {x: x, y: y});
	$doodle.Matrix.nrotateAroundExternalPoint(m1, p.x, p.y, angle);
	return m1;
};

/**
 * Moves a matrix to align an internal point with an external point.
 * Can be used to match a point in a transformed sprite with one in its parent.
 */
$doodle.Matrix.matchInternalPointWithExternal = function (m1, int_point, ext_point) {
	var int_p_trans = $doodle.Matrix.transformPoint(m1, int_point),
		dx = ext_point.x - int_p_trans.x,
		dy = ext_point.y - int_p_trans.y,
		m = $doodle.Matrix.translate(m1, dx, dy);
	return m;
};

$doodle.Matrix.nmatchInternalPointWithExternal = function (m1, int_point, ext_point) {
	var int_p_trans = $doodle.Matrix.transformPoint(m1, int_point),
		dx = ext_point.x - int_p_trans.x,
		dy = ext_point.y - int_p_trans.y;
	m1[4] += dx;
	m1[5] += dy;
	return m1;
};
$doodle.canvas = function() {
	var _canvas;
	var _backgroundColor = false; //defaults to clear
	var _backgroundImage = false; //nuthin'
	
	var canv = function(canvas) {
		//without args, just return the active canvas
		if(arguments.length === 0) { return _canvas; }
		
		//strip id selector if there
		if(typeof canvas ==='string' && canvas[0] === '#'){
			canvas = canvas.slice(1);
		}

		_canvas = document.getElementById(canvas) || canvas;

		//set context if supported
		if(_canvas.getContext) {
			_canvas.context = _canvas.getContext("2d");
			addProperties();
			return _canvas;
		}else {
			console.log("$doodle: canvas not supported.");
		}
	};

	/*
	 * add additional getter/setters to canvas object
	 */
	function addProperties() {
		
		_canvas.bgcolor = function(bgColor) {
			if(arguments.length === 0) { return _backgroundColor; }
			_backgroundColor = bgColor;
			_canvas.context.fillStyle = _backgroundColor;
			_canvas.context.fillRect(0, 0, _canvas.width, _canvas.height);
			return _canvas;
		};

		_canvas.bgimage = function(bgImage) {
			if(arguments.length === 0) { return _backgroundImage; }

			if(typeof bgImage ==='string') {
				_backgroundImage = new Image();
				_backgroundImage.src = bgImage;
			}else {
				_backgroundImage = bgImage;
			}

			_backgroundImage.onload = function() {
				_canvas.context.drawImage(_backgroundImage, 0, 0);
			}
			//_canvas.context.fillStyle = _backgroundColor;
			//_canvas.context.fillRect(0, 0, _canvas.width, _canvas.height);
			return _canvas;
		};

		_canvas.clear = function() {
			_canvas.context.save();
			//clear everything
			_canvas.context.clearRect(0, 0, _canvas.width, _canvas.height);
			
			if(_backgroundColor) {
				_canvas.context.fillStyle = _backgroundColor;
				_canvas.context.fillRect(0, 0, _canvas.width, _canvas.height);
			}
			if(_backgroundImage) {
				_canvas.context.drawImage(_backgroundImage, 0, 0);
			}
			_canvas.context.restore();
		};
	}
	
	return canv;
}();
//Make a point object, out of another point, an Array, or two numbers.
$doodle.point = function (params) {
	var self = {};
	
	if(arguments.length === 2 || arguments.length === 0) {
		//2 numbers or none
		self.x = (typeof(arguments[0])==='number') ? arguments[0] : undefined;
		self.y = (typeof(arguments[1])==='number') ? arguments[1] : undefined;
		
	}else if(arguments.length === 3) {
		//given an axis-point
		self.x = (typeof(arguments[0])==='number') ? arguments[0] : undefined;
		self.y = (typeof(arguments[1])==='number') ? arguments[1] : undefined;
		if((typeof arguments[2] ==='string') &&
		   (arguments[2] === 'local' || arguments[2] === 'global')) {
			self.coord = arguments[2];
		}else {
			throw new SyntaxError("point: Axis-point must be 'local' or 'global'.");
		}
	}else if(typeof(params) === 'object'){
		//array or point object
		self.x = (typeof(params[0])==='number') ? params[0] : params.x;
		self.y = (typeof(params[1])==='number') ? params[1] : params.y;
		if(params.coord){ self.coord = params.coord; }//given axis point
	}
	
	return self;
};
/**
 * @classDescription	Returns a basic object. Position information.
 * @param {Object}		[params.context = canvas.context]
 * @param {Number}		[params.z = 0]
 * @param {point}		[params.axis = {x:0,y:0,coord:'local',visible:false}]
 * @param {Boolean}		[params.visible = true] //not fully implemented
 * @param {shape}		[params.masks = []] //takes a path-shape function
 * @return {Object}
 */
$doodle.object = function (params) {
	var self = {};
	//add all the properties in the top object, will value/type check later
	for(var prop in params) {
		//apply any in-line functions to properties
		if(typeof params[prop] === 'function') {
			var f = params[prop];
			self[prop] = f(self/*call with this object*/);
		
		}else {
			//add all our properties in the top object
			self[prop] = params[prop];
		}
	}

	//defaults for object
	self.context = self.context || $doodle.canvas().context;
	self.visible = (typeof self.visible !=='undefined') ? self.visible : true;
	
	self.x = (typeof self.x !=='undefined') ? self.x : 0;
	self.y = (typeof self.y !=='undefined') ? self.y : 0;
	self.z = (typeof self.z !=='undefined') ? self.z : 0;
	
	//make sure all the axis parts are there
	self.axis = self.axis || {};
	self.axis.x = (typeof self.axis.x !=='undefined') ? self.axis.x : 0;
	self.axis.y = (typeof self.axis.y !=='undefined') ? self.axis.y : 0;
	self.axis.coord = self.axis.coord || 'local';
	self.axis.visible = (typeof self.axis.visible!=='undefined')? self.axis.visible : false;

	self.masks = self.masks || []; //shape functions drawn as clipping paths
	//apply initial translate to matrix
	self.matrix = $doodle.Matrix.translate($doodle.Matrix.identity(), self.x, self.y);
	
	//type-checks
	if(typeof self.z !=='number'){ throw new TypeError("object: z must be a number."); }
	if(typeof self.visible !=='boolean'){ throw new TypeError("object: visible must be true or false."); }
	if(self.axis && (typeof self.axis.x !=='number' ||
					 typeof self.axis.y !=='number')) {
		throw new TypeError("object: axis x and y must be numbers.");
	}
	if(self.axis.coord && typeof self.axis.coord ==='string') {
		if(self.axis.coord !== 'local' && self.axis.coord !== 'global') {
			throw new SyntaxError("object: axis coord must be 'local' or 'global'."); }
	}
	if(typeof self.axis.visible !=='boolean') {
		throw new TypeError("object: axis.visible must be 'true' or 'false'."); }

	if(typeof self.masks==='object' && typeof self.masks.length==='number') {
		//it's an array all right, now check it the elements are shape functions
		for(var i = 0; i < self.masks.length; i++) {
			if(typeof self.masks[i] !=='function') {
				throw new TypeError("object.masks: '"+self.masks[i]+"' must be a shape function.");}
		}
	}else {
		throw new TypeError("object.masks: Must be an Array of shape functions."); }

	
	self.loaded = true; //loaded by default, image changes it
	
	//apply differences to object
	self.modify = function(params) {
		var f, n;
		var paramFuncs = {};
		//loop through all supplied properties to modify
		for(var prop in params) {
			//if passed an inline function, eval and store value
			if(typeof params[prop] === 'function') {
				f = params[prop];
				params[prop] = f(self/*this object*/, self[prop]/*this property*/);
			}
			
			switch(prop) {
				//fall through, check if we have a relative equation
			case 'x':
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				self.translate(n - self.x, 0);
				self[prop] = n;
				break;
				
			case 'y':
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				self.translate(0, n - self.y );
				self[prop] = n;
				break;

			case 'z':
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				self[prop] = n;
				break;
				
			case 'alpha':
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				if(n > 1){ n = 1; }
				if(n < 0){ n = 0; }
				self[prop] = n;
				break;
				
			case 'width':
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				self[prop] = n;
				break;
				
			case 'height':
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				self[prop] = n;
				break;
				
			case 'fill':
				self[prop] = params[prop];
				break;

			case 'axis':
				for(var p in params[prop]) {
					switch(p) {
					case 'x':
					case 'y':
						if(typeof params[prop][p] === 'string') {
							params[prop][p] = $doodle.utils.parse.relativeEquation(self.axis[p], params[prop][p]);}
						self[prop][p] = params[prop][p];
						break;
					case 'coord':
					case 'visible':
						self[prop][p] = params[prop][p];
						break;
					default:
						throw new SyntaxError("object.modify.axis: "+p+" parameter not found.");
					}
				}
				break;
				
			case 'translate':
				f = self[prop];
				f(params[prop]);
				break;
			case 'rotate':
				f = self[prop];
				f(params[prop]);
				break;
			case 'scale':
				f = self[prop];
				f(params[prop]);
				break;
			case 'transform':
				f = self[prop];
				f(params[prop]);
				break;
				
			default:
				n = params[prop];
				if(typeof n === 'string') {
					n = $doodle.utils.parse.relativeEquation(self[prop], n); }
				self[prop] = n;
				//throw new SyntaxError("object.modify: "+prop+" parameter not found.");
			}//end{switch-prop}
		}//end{for prop in params}
		
		return self;
		
	};//end{self.modify}


	/*
	 * transform functions
	 */

	
	self.translate = function (point) {
		var tX, tY;
		//--type check
		if(arguments.length === 2){
			//given numbers
			tX = arguments[0];
			tY = arguments[1];
		}else if(typeof point === 'object'){
			//given array or point object
			tX = point[0] || point.x;
			tY = point[1] || point.y;
		}else {
			throw new SyntaxError("translate: requires a point.");
		}//--end type check

		self.matrix = $doodle.Matrix.translate(self.matrix, tX, tY);
		self.x = self.matrix[4];
		self.y = self.matrix[5];

		return self;
	};

	self.rotate = function (angle, axis/*optional*/) {
		var dx, dy;
		if(typeof axis ==='undefined'){ axis = self.axis; }

		if(axis.coord === 'local'){
			//rotate around internal point
			dx = axis.x;
			dy = axis.y;
		}else if(axis.coord === 'global'){
			//rotate around external point
			dx = axis.x - self.x;
			dy = axis.y - self.y;
		}else {
			throw new SyntaxError("rotate: coord system must be 'local' or 'global'."); }

		var m = $doodle.Matrix.translate(self.matrix, dx, dy);
		m = $doodle.Matrix.rotate(m, angle * Math.PI/180);
		self.matrix = $doodle.Matrix.translate(m, -dx, -dy);

		return self;
	};

	self.scale = function (scale) {
		var sx, sy;
		if(typeof scale ==='object'){
			//passed array or object
			if(scale.length === 1){ sx = sy = scale[0]; }
			else{
				sx = scale[0] || scale.x;
				sy = scale[1] || scale.y;
			}
		}else {
			//passed args
			if(arguments.length === 1){ sx = sy = scale; }
			else if(arguments.length === 2){
				sx = arguments[0];
				sy = arguments[1];
			}
		}
		self.matrix = $doodle.Matrix.scale(self.matrix, sx, sy);
		return self;
	};

	self.transform = function (matrix) {
		var m;
		if(arguments.length === 1){ m = $doodle.Matrix.create(matrix); }
		else if(arguments.length === 6) {
			m = $doodle.Matrix.create(arguments[0],arguments[1],arguments[2],
									  arguments[3],arguments[4],arguments[5]);
			
		}else{ throw new SyntaxError("object.transform: incorrect number or arguments."); }
		
		self.matrix = $doodle.Matrix.multiply(self.matrix, m);
		return self;
	};

	/*
	 * end transform functions
	 */

	
	//apply the transform functions, should consolidate with modify i guess
	//have to add at end when everything is defined
	for(var p in params) {
		if(p === 'translate') {
			self.translate(params[p]);
		}else if(p === 'rotate') {
			self.rotate(params[p]);
		}else if(p === 'scale') {
			self.scale(params[p]);
		}else if(p === 'transform') {
			self.transform(params[p]);
		}
	}

	return self;
	
};//end{object}
/**
 * @classDescription	Returns a new sprite object.
 * @param {Number}		params.x
 * @param {Number}		params.y
 * @param {String}		[params.fill = '#000000']
 * @param {Number}		[params.alpha = 1]
 * @return {Object}
 */
$doodle.sprite = function (params) {
	//if given a shape param, store it till assignment later
	if(typeof params.shape ==='function') {
		var arg_shape = params.shape;
		delete params.shape;
	}
	
	var self = $doodle.object(params);

	//defaults for sprite
	self.fill = (typeof self.fill !=='undefined') ? self.fill : '#000000';
	self.alpha = (typeof self.alpha !=='undefined') ? self.alpha : 1;
	
	if(typeof self.fill ==='string' && self.fill[3] === 'a') {
		//passed 'rgba(r,g,b,a)', regexp these out so we can use self.alpha as control
		//oh dear...
		var r = parseInt(self.fill.match(/\d*\s*(?=,)/), 10);
		var g = parseInt(self.fill.match(/\d*\s*,\s*\d*\s*,\s*\d*\.?\d*\s*\)$/), 10);
		var b = parseInt(self.fill.match(/\d*\s*,\s*\d*\.?\d*\s*\)$/), 10);
		var a = parseFloat(self.fill.match(/\d*\.?\d*\s*\)$/), 10);

		self.fill = 'rgb('+r+','+g+','+b+')';
		self.alpha = a;

		if(typeof r !=='number' || typeof g !=='number' ||
		   typeof b !=='number' || typeof a !=='number') {
			//of course the regexp wouldn't have worked if it got here
			throw new TypeError("sprite: error parsing " + self.fill);
		}
	}
	//alpha type and bounds check: 0.0 - 1.0
	if(typeof self.alpha !=='number' || (self.alpha < 0 || self.alpha > 1)) {
		throw new SyntaxError("sprite: alpha value must be between 0.0 and 1.0.");
	}


	function drawClippingMasks(obj) {
		obj.masks.map(function(shape) {
			obj.context.beginPath();
			shape();
			obj.context.clip();
		});
	}

	//the poor man's loop
	self.animate = function (params, framerate) {
		if(typeof framerate ==='undefined'){ framerate = 42; } //24fps
		self.loop(params, 0, framerate, true); //infinite loop w/ clear
	};
	
	self.loop = function (params/*or fn*/, count, framerate/*optional*/, clear/*optional*/) {
		if(typeof count ==='undefined' || typeof count !=='number') {
			throw new SyntaxError("sprite.loop: count must be a number."); }

		if(typeof clear ==='undefined'){ clear = false; }
		
		var infinite = false;
		var i = 1;
		var render;
		
		if(count === 0) {
			//infinite loop
			count = 2;
			infinite = true;
		}

		if(typeof framerate ==='undefined'){ framerate = false; }
		else if(typeof framerate ==='string'){
			if(framerate.match(/fps/i)){
				framerate = (1000 / parseInt(framerate, 10)) | 0;
			}else if(framerate.match(/sec/i)){
				framerate = (1000 * parseFloat(framerate, 10)) | 0;
			}
		}
		
		self.draw(); //initial draw
		
		if(framerate) {
			//we gotta loop
			render = setInterval(renderFrame, framerate);
			self.loop.ing = true;
			
		}else {
			//no animation, just loop
			while(i < count) {
				if(clear){ $doodle.canvas().clear(); }

				//shallow copy of parameters object,
				//otherwise functions get overwritten on subsequent calls
				if(typeof params ==='object'){
					var params_copy = {};
					for(var prop in params) {
						//store update function to run after everything else
						if(prop === 'on_update'){ var update_fn = params[prop]; }
						else{ params_copy[prop] = params[prop]; }
					}
				}
				
				//self.modify(params_copy).draw();

				//call if function, otherwise apply modify parameters
				if(typeof params ==='function'){
					//console.log("heer");
					params(self); //call
					self.draw();  //update
				}else{ self.modify(params_copy).draw(); }

				//if update function exists, call it
				if(typeof update_fn !=='undefined'){ update_fn(self); }
				
				if(!infinite){ i += 1; }
			}
		}

		function renderFrame() {
			if(i < count) {
				if(clear) {
					self.context.save();
					
					$doodle.canvas().clear(); //this clears all canvas
					
					//self.context.transform(self.matrix[0],self.matrix[2],self.matrix[1],
					//					   self.matrix[3],self.matrix[4],self.matrix[5]);

					//draw shape woth erase fill?
					
					//just clear rects box. every sprite needs a width/height then
					//need to make a touch larger to get errant outlines
					/**
					if(!bgcolor) self.context.clearRect(-1, -1, self.width+2, self.height+2);
					else {
						self.context.fillStyle = bgcolor;
						self.context.fillRect(-1, -1, self.width+2, self.height+2);
					}
**/
					self.context.restore();
				}//end clear previous

				//shallow copy of parameters object,
				//otherwise functions get overwritten on subsequent calls
				if(typeof params ==='object'){
					var params_copy = {};
					for(var prop in params) {
						//store update function to run after everything else
						if(prop === 'on_update'){ var update_fn = params[prop]; }
						else{ params_copy[prop] = params[prop]; }
					}
				}
				
				//call if function, otherwise apply modify parameters
				if(typeof params ==='function'){
					params(self); //call
					self.draw();  //update

				//apply params to successive loops
				}else{ self.modify(params_copy).draw(); }

				//if update function exists, call it
				if(typeof update_fn !=='undefined'){ update_fn(self); }
				
				if(!infinite){ i += 1; }
				
			}else {
				//loop done
				clearInterval(render);
				self.loop.ing = false;
			}
		}
		
		return self;
	};

	//kinda cheap way to measure if loop is already executing - set in loop
	self.loop.ing = false;
	
	//mold holds the shape function
	self.mold = undefined;
	//shape takes the function and sets it in the mold
	self.shape = function(shape){ self.mold = shape; return self; };
	//if given a shape in the parameters assign it
	if(arg_shape){ self.shape(arg_shape); }
	
	self.draw = function(shape) {
		shape = shape || self.mold;
		if(typeof(shape) !== 'function') {
			throw new Error("sprite.draw: no shape function provided.");
		}
		if(typeof(self.context) === 'undefined') {
			throw new Error("sprite.draw: context must be defined.");
		}
		
		if(self.loaded){ draw(shape); }
		else{ redraw_when_loaded(self); }

		return self;
	};
	
	
	function draw (shape) {
		self.context.save();
		
		self.context.transform(self.matrix[0],self.matrix[1],self.matrix[2],
							   self.matrix[3],self.matrix[4],self.matrix[5]);
		
		self.context.fillStyle = self.fill; //set shape fill

		if(self.alpha > 1) {
			self.context.globalAlpha = self.alpha; //set global context alpha
		}
		
		$doodle.gfx = self.context;

		
		if(self.masks.length){ drawClippingMasks(self); }
		
		if(self.visible){ shape(self); }//should probably check the whole block

		if(self.axis.visible){ $doodle.utils.draw.axis(self); }
		
		$doodle.gfx = $doodle.canvas().context;

		self.context.restore();
	}

	//checks when the object is loaded, then redraws
	function redraw_when_loaded (obj) {
		//if not already loading
		if(!obj.loading) {
			var timeout = 10000; //ms, 10sec
			var time = 0;
			var obj_check = setInterval(check_object, 100); //ms
			obj.loading = true; //add property
		}
		function check_object () {
			if(self.loaded) {
				//stop checking and redraw everything
				clearInterval(obj_check);
				self.draw();
			}else {
				//check timeout
				if(time < timeout ){ time += 100; }//interval
				else {
					//reset and throw error
					clearInterval(obj_check);
					delete obj.loading;
					throw new Error ("group.redraw_when_loaded: Image load timeout.");
				}
			}
		}
	}
	
	return self;
};//end{sprite}
$doodle.group = function (params) {
	//need to grab these before being altered on the way down
	var aX, aY, coord;
	if(params && typeof params.axis.x ==='number'){ aX = params.axis.x; }
	if(params && typeof params.axis.y ==='number'){ aY = params.axis.y; }
	if(params && typeof params.axis.coord ==='string'){ coord = params.axis.coord; }
	
	var self = $doodle.object(params);
	
	//defaults for group if not there
	self.composite = self.composite || 'source-over';
	self.axis.x = (typeof aX !=='undefined') ? aX : $doodle.canvas().width/2;
	self.axis.y = (typeof aY !=='undefined') ? aY : $doodle.canvas().height/2;
	self.axis.coord = (typeof coord !=='undefined') ? coord : 'global';
	//self.axis.coord = self.axis.coord || 'global';

	var children = [];


	function drawClippingMasks(obj) {
		obj.masks.map(function(shape) {
			obj.context.beginPath();
			shape();
			obj.context.clip();
		});
	}
	
	function drawAxisPoint(obj) {
		//assuming context has already been moved for object
		obj.context.save(); //always 'source-over'

		obj.context.translate(obj.axis.x, obj.axis.y);
		obj.context.globalAlpha = 1;

		//draw 2 little circles, first for stroke
		obj.context.fillStyle = '#000000';
		obj.context.beginPath();
		obj.context.arc(0, 0, 4, 0, Math.PI*2, true);
		obj.context.closePath();
		obj.context.fill();
		
		obj.context.fillStyle = '#00FF00';
		obj.context.beginPath();
		obj.context.arc(0, 0, 3, 0, Math.PI*2, true);
		obj.context.closePath();
		obj.context.fill();

		obj.context.restore();
	}
	
	
	self.add = function(obj) {
		for(var i = 0; i < arguments.length; i++) {
			children.push(arguments[i]);
		}
		children.sort(function(a, b){ return a.z - b.z; }); //z-sort
		
		return self;
	};

	self.remove = function(/* obj(s) */) {
		for(var i = 0; i < arguments.length; i++) {
			children.splice(children.indexOf(arguments[i]), 1);
		}
		return self;
	};
	
	self.rotate = function(ang) {
		//rotate every child around the global group axis
		//doesn't apply to group matrix
		children.map(function(obj){ obj.rotate(ang, self.axis); });
		return self;
	};

	self.draw = function() {
		if(typeof(self.context) === 'undefined') {
			throw new Error("group.draw: context must be defined.");
		}

		self.context.save();
		self.context.globalCompositeOperation = self.composite;

		/*
		 * what if its an unloaded image? wait and reshuffle?
		 */
		
		children.map( function(obj){
			//tell if its a group, then loop through .children
			//console.log("what? " + obj.loaded);
			if(obj.loaded) {
				obj.context = self.context;
				obj.transform(self.matrix);
				obj.draw();
				
			}else{ redraw_when_loaded(obj); }
		});

		if(self.axis.visible){ drawAxisPoint(self); }
		
		self.context.restore();

		return self;
	};

	//checks when the object is loaded, then redraws group
	function redraw_when_loaded (obj) {
		//if not already loading
		if(!obj.loading) {
			var timeout = 10000; //ms, 10sec
			var time = 0;
			var obj_check = setInterval(check_object, 100); //ms
			obj.loading = true; //add property
		}
		
		function check_object () {
			if(obj.loaded) {
				//stop checking and redraw everything
				self.draw();
				clearInterval(obj_check);
				delete obj.loading; //remove property
			}else {
				//check timeout
				if(time < timeout ){ time += 100; }//add interval
				else {
					//reset and throw error
					clearInterval(obj_check);
					delete obj.loading;
					throw new Error ("group.redraw_when_loaded: Image load timeout.");
				}
			}
		}
	}

	self.loop = function(params/*or fn*/, count, framerate/*optional*/, clear/*optional*/) {
		//-->from sprite loop 
		if(typeof count ==='undefined' || typeof count !=='number'){
			throw new SyntaxError("sprite.loop: count must be a number."); }

		if(typeof clear ==='undefined'){ clear = false; }
		
		var infinite = false;
		var i = 1;
		var render;
		
		if(count === 0) {
			//infinite loop
			count = 2;
			infinite = true;
		}

		if(typeof framerate ==='undefined'){ framerate = false; }
		else if(typeof framerate ==='string'){
			if(framerate.match(/fps/i)){
				framerate = (1000 / parseInt(framerate, 10)) | 0;
			}else if(framerate.match(/sec/i)){
				framerate = (1000 * parseFloat(framerate, 10)) | 0;
			}
		}
		//<--
		self.draw(); //initial group draw
		
		if(framerate){
			//we gotta loop
			render = setInterval(renderFrame, framerate);
			self.loop.ing = true;			
		}else{
			//no animation, just loop
			while(i < count) {
				self.modify(params).draw();
				if(!infinite){ i += 1; }
			}
		}

		function renderFrame() {
			if(i < count) {
				if(!infinite){ i += 1; }
				
				if(clear){
					//clear everything, redraw background
					self.context.save();
					$doodle.canvas().clear();
					self.context.restore();
				}
				
				if(typeof params === 'function'){
					params(self); //call
					self.draw(); //update
					
				}else{ self.modify(params).draw(); }//apply params to successive loops
				
			}else {
				//loop done
				clearInterval(render);
				self.loop.ing = false;
			}
		}
		
		return self;
		
	};

	return self;
};
$doodle.rect = function (params) {
	//type-check required parameters
	if(typeof params.width !=='number' ||
	   typeof params.height !=='number') {
		throw new SyntaxError("rect: requires width and height parameters.");
	}
	
	var self = $doodle.sprite(params); //inherit sprite properties

	/*
	 * This function gets called when it's time to draw.
	 * In local space, (0,0) is top-left corner of sprite.
	 */
	self.mold = function() {
		self.context.fillStyle = self.fill;
		self.context.fillRect(0, 0, self.width, self.height);
	};

	return self; //allows chaining
};
$doodle.circle = function (params) {
	if(typeof params.radius ==='undefined'){
		throw new SyntaxError("circle: requires radius parameter."); }
	
	var self = $doodle.sprite(params);
	
	var startAngle = 0;
	var endAngle = Math.PI * 2;
	var anticlockwise = true;
	
	self.mold = function() {
		self.context.fillStyle = self.fill;
		self.context.beginPath();
		self.context.arc(0, 0, self.radius,
						 startAngle, endAngle, anticlockwise);
		self.context.closePath();
		self.context.fill();
	};

	return self;
};
$doodle.image = function (params) {
	//grab on_load function to call later
	if(typeof params.on_load !=='undefined'){
		var on_load = params.on_load;
		delete params.on_load;
	}
	
	var self = $doodle.sprite(params);

	var _img; //internal Image reference

	//might already be there ya'know
	if(typeof self.width ==='undefined'){ self.width = params.width; }
	if(typeof self.height ==='undefined'){ self.height = params.height; }

	if(typeof self.src ==='undefined'){ _img = new Image(); }
	else if(typeof self.src ==='string') {
		//passed url
		_img = new Image();
		_img.src = self.src;
	}else if(typeof self.src ==='object'){ _img = self.src; }//passed Image

	//polls image to see if loaded, then turns itself off
	function image_check() {
		if(_img.complete) {
			property_set(_img);
			clearInterval(load_check);
			self.loaded = true;
		}
	}

	//called after image loaded
	function property_set(image) {
		self.width = image.width;
		self.height = image.height;

		if(typeof on_load ==='function'){ on_load(self); }
	}
	
	self.loaded = _img.complete ? true : false;
	
	if(self.loaded){ property_set(_img); }
	else{ var load_check = setInterval(image_check, 100); }

	self.mold = function() {
		self.context.drawImage(_img, 0, 0, self.width, self.height);
	};
	
	return self;
};
