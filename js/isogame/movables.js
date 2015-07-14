/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */

// isometric movable sprites
isogame.Movable = (function(){
	function Movable() {
		this.animatedSprites = new Array();
		this.stillSprites = new Array();
		this.displayList = new Array();
		this.relX = 0;
		this.relY = 0;
		this.mapX = 0;
		this.mapY = 0;
		this.initialXindex = 0;
		this.initialYindex = 0;
		this.Xindex = 0;
		this.Yindex = 0;
		this.mover = null;
		this.direction = 0;
		this.scale = 1;
		this.pathfinder = null;
		// mouse enabled stuff
		this.mouseCanvas = null;
		this.mouseContext = null;
		this.totalRect = null;
	}
	Movable.prototype = {
		buildSheetsFromJson:function( json, imgPrefix ){

			if( !json ){ throw new Error( "Movable.buildSheetsFromJson:: no json given") }
			if( !imgPrefix ){ imgPrefix = "" };

			for( var i=0; i<json.length; i++ ){
				var sheet = json[i];
				if( sheet.type == "animated" ){
					this.addAnimatedSpriteSheet(
						new isogame.IsoAnimationSheet(
							new isogame.PngSheet(
								imgPrefix+sheet.image,
								new isogame.Rectangle(
									parseInt( sheet.frame.x ),
									parseInt( sheet.frame.y ),
									parseInt( sheet.frame.width ),
									parseInt( sheet.frame.height )
								)
							),
							parseInt( sheet.offset.x ), parseInt( sheet.offset.y ), parseInt( sheet.framesPerAnimation )
						)
					);
				} else { // type == "still"
					this.addStillSpriteSheet(
						new isogame.IsoStillSheet(
							new isogame.PngSheet(
								imgPrefix+sheet.image,
								new isogame.Rectangle(
									parseInt( sheet.frame.x ),
									parseInt( sheet.frame.y ),
									parseInt( sheet.frame.width ),
									parseInt( sheet.frame.height )
							),
							parseInt( sheet.offset.x ), parseInt( sheet.offset.y ) )
						)
					);
				}
			}
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
			if( this.mover ){ this.mover.update(); }
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
		gotoAndPlay:function( fr, loops )
		{
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].gotoAndPlay( fr, loops );
			}
		},
		gotoAndPlayAndLoop:function( startFr, stopFr, loops ){
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].gotoAndPlayAndLoop( startFr, stopFr, loops );
			}
		},
		play:function( loops )
		{
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].play( loops );
			}
		},
		stop:function(){
			for( var i=0; i<this.animatedSprites.length; i++ )
			{
				this.animatedSprites[i].stop();
			}
		},
		setScale:function( sc ){
			this.scale = sc;
			for( var i=0; i<this.displayList.length; i++ )
			{
				this.displayList[i].setScale( sc );
			}
		},
		getScale:function(){ return this.scale; },
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
		getMover:function(){  return this.mover; },
		// Walk path methods ( using AStar )
		walkPathTo:function( yi, xi ){
			this.pathfinder = new isogame.AStar( this._bytes, this.Yindex, this.Xindex, yi, xi, 265 );
		},
		walkPathAt:function( yi, xi ){
			this.pathfinder = new isogame.AStar( this._bytes, this.Yindex, this.Xindex, yi, xi, 265 );
		},

		// ================= mouse enabled stuff : ( for making movable clickable!! )====================
		enableMouse:function( ) {
			if( this.mouseCanvas ){ return; } // allready enabled
			// create mouse dummy for checking mouse-hits
			this.mouseCanvas = document.createElement('canvas');

			//======= TEST ( make sure there's a div called testdiv in yer html ) ===//
			/*var test = document.getElementById('testdiv');
			test.appendChild(this.mouseCanvas);*/
			//======= TEST END

			var bounds = this.getBounds();
			this.totalRect = new isogame.Rectangle( bounds.minX, bounds.minY,
				Math.abs( bounds.minX - bounds.maxX ), Math.abs( bounds.minY - bounds.maxY ) );
			this.mouseCanvas.width  = this.totalRect.width;
			this.mouseCanvas.height = this.totalRect.height;
			this.mouseContext = this.mouseCanvas.getContext('2d');
		},
		// only call this whenn sprite images are fully loaded !!
		hitPointTest:function( x, y ) {
			//this.mouseContext.fillStyle = "#FF0000";
			this.mouseContext.clearRect( 0,0, this.mouseCanvas.width, this.mouseCanvas.height );
			this.draw( this.mouseContext, -this.totalRect.x, -this.totalRect.y ); // draw current frame

			var rx = this.mapX + this.relX + this.totalRect.x;
			var ry = this.mapY + this.relY + this.totalRect.y;
			//==== TEST =====//
			/*var test = document.getElementById('testdiv');
			test.style.left = rx+"px";
			test.style.top = ry+"px";*/
			//======= TEST END

			// get localX, Y
			var localX = x - rx;
			var localY = y - ry;
			if( localX < 0 || localY < 0 ) return false;
			if( localX > this.totalRect.width || localY > this.totalRect.height ) return false;
			// if in bounds check imgdata
			var c = this.mouseContext.getImageData( localX, localY, 1, 1).data;
			if( !isogame.compareArrays( c, [0,0,0,0,0,0,0,0] ) ) {
				return true;
			}
			return false;
		},
		// make sure to call this after sprite sheets are added
		getBounds:function(){
			var minX = this.displayList[0]._ox;
			var minY = this.displayList[0]._oy;
			var maxX = minX + this.displayList[0]._sheet._rect.width;
			var maxY = minY + this.displayList[0]._sheet._rect.height;
			for( var i=1; i<this.displayList.length; i++ )
			{
				var cminX = this.displayList[i]._ox;
				var cminY = this.displayList[i]._oy;
				var cmaxX = cminX + this.displayList[i]._sheet._rect.width;
				var cmaxY = cminY + this.displayList[i]._sheet._rect.height;
				if( cminX < minX ){
					minX = cminX;
				}
				if( cminY < minY ){
					minY = cminY;
				}
				if( cmaxX > maxX ){
					maxX - cmaxX;
				}
				if( cmaxY > maxY ){
					maxY = cmaxY;
				}
			}
			return { minX:minX, minY:minY, maxX:maxX, maxY:maxY };
		},
		setYindex:function( ny ){
			this.Yindex = ny;
		},
		setXindex:function( nx ){
			this.Xindex = nx;
		},
		setRelY:function( ry ){
			this.relY = ry;
		},
		setRelX:function( rx ){
			this.relX = rx;
		}
	};
	return Movable;
}());
isogame.FirstPerson = (function(){ // extends isogame.Movable
	function FirstPerson(){
		isogame.Movable.apply( this, arguments );
	}
	// inherit superclass stuff
	FirstPerson.prototype = ooputils.inherit( isogame.Movable.prototype );
	// use extend method to extend
	ooputils.extend( FirstPerson.prototype, {
		// overide constructor
		constructor:FirstPerson,
		dummyfunc:function(){}
	} );

	return FirstPerson;
}());
isogame.Enemy = (function(){ // extends isogame.Movable
	function Enemy(){
		isogame.Movable.apply( this, arguments );
	}
	// inherit superclass stuff
	Enemy.prototype = ooputils.inherit( isogame.Movable.prototype );
	// use extend method to extend
	ooputils.extend( Enemy.prototype, {
		// overide constructor
		constructor:Enemy,
		dummyfunc:function(){}
	} );
	return Enemy;
}());

