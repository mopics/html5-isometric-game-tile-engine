/** MOVERS **/

isogame.AMover = (function(){
	/**
	 * Abstract-class for all movable sprite movers ( classes that can move movable sprites over the map, or the map under the movable )
	 *
	 * @namespace isogame
	 * @class isogame.AMover
	 * @param {isogame.AMovable} movable - the movable to move
	 * @param {isogame.IsoMap} isomap - the map the movable is assigned to
	 * @param {integer} speed - fastness of movement.
	 * @constructor
	 */
    function AMover( movable, isomap, speed ) {
        this._map = isomap;
        this._bytes = isomap._bytes;
        this._sm = isomap._spriteManager;
        this._movable = movable;
        this._stepX = 0;
        this._stepY = 0;
        //check if movespeed is acceptable
        var n = this._map.tw / speed;
        var ch = n.toString().split('.');
        if ( ch.length > 1 )
        {
            throw isogame.Constants.errors.SPITE_MOVE_SPEED_ODD;
        }
        this._speed = speed;
        this._moveInRequest=false;
        this._currDir = 888;
        this._dirFuncs = [ this.down, this.leftdown, this.left, this.leftup,
            this.up, this.rightup, this.right, this.rightdown  ];
        this._ascendingsFuncs = [ this.ascDown, this.ascLeftDown, this.ascLeft, this.ascLeftUp,
            this.ascUp, this.ascRightUp, this.ascRight, this.ascRightDown ];
        this._mouseTarget; // isogame.Point
    }
    AMover.prototype = {
		/**
		 * Mover's game-tick update ( to be overriden by subclasses )
		 * @method update
		 */
        update:function()
        {
            //to be overridden by subclasses
        },
		/**
		 * TODO:??
		 * @method getFutureIndexes
		 * @return {*}
		 */
        getFutureIndexes:function(){
            if( this._currDir>7  )
                return { y:this._movable.Yindex, x:this._movable.Xindex };
            return this._ascendingsFuncs[this._currDir]( this._movable.Yindex, this._movable.Xindex );
        },
		/**
		 * TODO:
		 * @method goInDir
		 * @param d
		 */
        goInDir:function( d )
        {
            this._currDir = d;
            this._dirFuncs[d](this);
        },
		/**
		 * TODO:
		 * @method up
		 * @param {isogame.AMover} self
		 */
        up:function(self)
        {
            self._stepY = 2*self._speed;
            self._stepX = 0;
        },
		/**
		 * TODO:
		 * @method down
		 * @param {isogame.AMover} self
		 */
        down:function(self)
        {
            self._stepY = 2*self._speed;
            self._stepX = 0;
        },
		/**
		 * TODO:
		 * @method left
		 * @param {isogame.AMover} self
		 */
        left:function(self)
        {
            self._stepY = 0;
            self._stepX = 2*self._speed;
        },
		/**
		 * TODO:
		 * @method right
		 * @param {isogame.AMover} self
		 */
        right:function(self)
        {
            self._stepY = 0;
            self._stepX = 2*self._speed;
        },
		/**
		 * TODO:
		 * @method leftup
		 * @param {isogame.AMover} self
		 */
        leftup:function(self)
        {
            self._stepY   = 1*self._speed;
            self._stepX   = 2*self._speed;
        },
		/**
		 * TODO:
		 * @method rightup
		 * @param {isogame.AMover} self
		 */
        rightup:function(self)
        {
            self._stepY   = 1*self._speed;
            self._stepX   = 2*self._speed;
        },
		/**
		 * TODO:
		 * @method leftdown
		 * @param {isogame.AMover} self
		 */
        leftdown:function(self)
        {
            self._stepY   = 1*self._speed;
            self._stepX   = 2*self._speed;
        },
		/**
		 * TODO:
		 * @method rightdown
		 * @param {isogame.AMover} self
		 */
        rightdown:function(self)
        {
            self._stepY   = 1*self._speed;
            self._stepX   = 2*self._speed;
        },
		/**
		 * Returns ascending(up) tile
		 * @method ascUp
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascUp:function(yi, xi)
        {
            return { y:yi-2, x:xi };
        },
		/**
		 * Returns ascending(down) tile
		 * @method ascDown
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascDown:function(yi, xi)
        {
            return { y:yi+2, x:xi };
        },
		/**
		 * Returns ascending(left) tile
		 * @method ascLeft
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascLeft:function(yi, xi)
        {
            return { y:yi, x:xi-1 };
        },
		/**
		 * Returns ascending(right) tile
		 * @method ascRight
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascRight:function(yi, xi)
        {
            return { y:yi, x:xi+1 };
        },
		/**
		 * Returns ascending(leftup) tile
		 * @method ascLeftUp
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascLeftUp:function( yi, xi )
        {
            if( yi%2==0 ) {// if even
                return { y:yi-1, x:xi };
            }
            return { y:yi-1, x:xi-1 };
        },
		/**
		 * Returns ascending(rightup) tile
		 * @method ascRightUp
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascRightUp:function(yi, xi)
        {
            if( yi%2==0 ) {// if even
                return { y:yi-1, x:xi+1 };
            }
            return { y:yi-1, x:xi };
        },
		/**
		 * Returns ascending(leftdown) tile
		 * @method ascLeftDown
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascLeftDown:function(yi, xi)
        {
            if( yi%2==0 ) {// if even
                return { y:yi+1, x:xi };
            }
            return { y:yi+1, x:xi-1 };
        },
		/**
		 * Returns ascending(rightdown) tile
		 * @method ascRightDown
		 * @param {int} yi
		 * @param {int} xi
		 */
        ascRightDown:function(yi, xi)
        {
            if( yi%2==0 ) {// if even
                return { y:yi+1, x:xi+1 };
            }
            return { y:yi+1, x:xi };
        },
		/**
		 * Stops movement
		 * @method stop
		 */
        stop:function()
        {
            this._currDir = 888;
            this._stepY   = 0;
            this._stepX   = 0;
            this._moveInRequest = false;
        },
		/**
		 * Returns wether there is still a move requested
		 * @method isRequested
		 * @return {boolean}
		 */
        isRequested:function() {
            return this._moveInRequest;
        },
		/**
		 * Requests move
		 * @method setRequested
		 * @param {boolean} b
		 */
        setRequested:function( b ) {
            this._moveInRequest = b;
        },
		/**
		 * Returns wether the movable is perfectly snapped on it's tile
		 * @method isSnapped
		 * @return {Boolean}
		 */
        isSnapped:function(){
            return ( this._movable.relX==0 && this._movable.relY==0 );
        },
        setSnapped:function( b ){
            //
        },
        getDirection:function() {
            return this._currDir;
        },
        setDirection:function( d ) {
            this._currDir = d;
        },
        getSpeed:function(){
            return this._speed;
        },
        setSpeed:function( s ){
			//check if movespeed is acceptable
			var n = this._map.tw / s;
			var ch = n.toString().split('.');
			if ( ch.length > 1 )
			{
				throw isogame.Constants.errors.SPITE_MOVE_SPEED_ODD;
			}
            this._speed = s;
        },
        getMap:function() {
            return this._map;
        },
        setMap:function( isomap ) {
            this._map = isomap;
        },
        getXstep:function() {
            return this._stepX;
        },
        getYstep:function()	{
            return this._stepY;
        },
        getMovable:function() {
            return this._movable;
        },
        //setter func
        setXstep:function(xs) {
            this._stepX = xs;
        },
        setYstep:function(ys) {
            this._stepY = ys;
        },
        getMouseTarget:function() {
            return this._mouseTarget;
        },
        setMouseTarget:function(p) {
            this._mouseTarget = p;
        }
    };

    return AMover;
}());
isogame.MapMover = (function(){ // extends AMover
    function MapMover( movable, isomap, speed ){
        isogame.AMover.apply( this, arguments );
        this.sm = this._map._spriteManager;
        this.tp = this._map._tilePainter;
        this.resolvers = [
            this.resolveDown,
            this.resolveLeftDown,
            this.resolveLeft,
            this.resolveLeftUp,
            this.resolveUp,
            this.resolveRightUp,
            this.resolveRight,
            this.resolveRightDown
        ];
        this._m2t = this._map._m2t;
    };
    // inherit superclass stuff
    MapMover.prototype = ooputils.inherit( isogame.AMover.prototype );
    // use extend method to extend
    ooputils.extend( MapMover.prototype, {
        // overide constructor
        constructor:MapMover,
        // method overrides
        update:function() {
            if( !this.isSnapped() || this._currDir<8 )
            {
                this.resolvers[this._currDir](this);
            }
            else
                this.stop();
        },
        resolveUp:function(self) {
            var m = self._movable;
            if( self.isSnapped() )
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-2,m.Xindex) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relY =  m.relY - self._stepY;
            //update map
            self.tp.setMapMoveTranslate( 0, self._stepY );
            //swap row
            if( m.relY == -self._bytes.th )
            {
                self._sm.switchRow(m, m.Yindex - 2);
                self.tp.scroll( isogame.Constants.dirs.DOWN,m )
            }
        },
        resolveDown:function(self){
            var m = self._movable;
            if( self.isSnapped() )
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+2,m.Xindex) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relY =  m.relY + self._stepY;
            //update map
            self.tp.setMapMoveTranslate( 0, -self._stepY );
            //swap row
            if( m.relY == self._bytes.th )
            {
                self._sm.switchRow(m, m.Yindex + 2);
                self.tp.scroll( isogame.Constants.dirs.UP,m );
            }
        },
        resolveLeft:function(self){
            var m = self._movable;
            if( self.isSnapped() )
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex-1) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relX =  m.relX - self._stepX;
            //update map
            self.tp.setMapMoveTranslate( self._stepX, 0 );
            //swap col
            if( m.relX == -self._bytes.tw )
            {
                self._sm.switchCol( m, m.Xindex-1 );
                self.tp.scroll( isogame.Constants.dirs.RIGHT,m );
            }
        },
        resolveRight:function(self){
            var m = self._movable;
            if( self.isSnapped() )
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex+1) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relX =  m.relX + self._stepX;
            //update map
            self.tp.setMapMoveTranslate( -self._stepX, 0 );
            //swap col
            if( m.relX == self._bytes.tw )
            {
                self._sm.switchCol( m, m.Xindex+1 );
                self.tp.scroll( isogame.Constants.dirs.LEFT,m );
            }
        },
        resolveLeftUp:function(self){
            var Xi;
            var m = self._movable;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==1)
                    Xi --;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable( m.Yindex-1,Xi ) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX- self._stepX;
            m.relY = m.relY - self._stepY;

            //update map
            self.tp.setMapMoveTranslate( self._stepX, self._stepY );

            if( m.relX == -self._bytes.th )
            {
                Xi  = m.Xindex;
                if( m.Yindex%2==1)
                {
                    Xi --;
                }
                self._sm.switchColRow( m, m.Yindex-1, Xi );
                self.tp.scroll( isogame.Constants.dirs.RIGHT_DOWN, m );
            }
        },
        resolveLeftDown:function(self) {
            var m = self._movable;
            var Xi;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==1)
                    Xi --;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX- self._stepX;
            m.relY = m.relY+ self._stepY;
            //update map
            self.tp.setMapMoveTranslate( self._stepX, -self._stepY );
            //swap tile?
            if( m.relX==-self._bytes.th )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==1)
                {
                    Xi --;
                }
                self._sm.switchColRow( m, m.Yindex+1, Xi );
                self.tp.scroll( isogame.Constants.dirs.RIGHT_UP, m );
            }
        },
        resolveRightUp:function(self){
            var Xi;
            var m = self._movable;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                    Xi ++;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX+ self._stepX;
            m.relY = m.relY- self._stepY;
            //update map
            self.tp.setMapMoveTranslate( -self._stepX, self._stepY );
            //swap tile?
            if( m.relX==self._bytes.th )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                {
                    Xi ++;
                }
                self._sm.switchColRow( m, m.Yindex-1, Xi );
                self.tp.scroll( isogame.Constants.dirs.LEFT_DOWN, m );
            }
        },
        resolveRightDown:function(self){
            var Xi;
            var m = self._movable;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                    Xi ++;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX+ self._stepX;
            m.relY = m.relY+ self._stepY;
            //update map
            self.tp.setMapMoveTranslate( -self._stepX, -self._stepY );
            //swap tile?
            if( m.relX == self._bytes.th )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                {
                    Xi ++;
                }
                self._sm.switchColRow( m, m.Yindex+1, Xi );
                self.tp.scroll( isogame.Constants.dirs.LEFT_UP, m );
            }
        },
        stop:function(){
            this._moveInRequest = false;
        }

    } );

    return MapMover;
}());
isogame.SpriteMover = (function(){ // extends AMover
    function SpriteMover( movable, isomap, speed )
    {
        isogame.AMover.apply( this, arguments );
        this.sm = this._map._spriteManager;
        this.resolvers = [
            this.resolveDown,
            this.resolveLeftDown,
            this.resolveLeft,
            this.resolveLeftUp,
            this.resolveUp,
            this.resolveRightUp,
            this.resolveRight,
            this.resolveRightDown
        ];
        this._m2t = this._map._m2t;
    }
    // inherit superclass stuff
    SpriteMover.prototype = ooputils.inherit( isogame.AMover.prototype );
    // use extend method to extend
    ooputils.extend( SpriteMover.prototype, {
        // overide constructor
        constructor:SpriteMover,
        // method overrides
        update:function()
        {
            if( !this.isSnapped() || this._currDir<8 )
            {
                this.resolvers[this._currDir](this);
            }
            else
                this.stop();
        },
        resolveUp:function(self) {
            var m = self._movable;

            if( self.isSnapped() )
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-2,m.Xindex) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relY =  m.relY - self._stepY;
            //swap row
            if( m.relY == -self._bytes.th )
            {
                self._sm.switchRow(m, m.Yindex - 2);
            }
        },
        resolveDown:function(self)  {
            var m = self._movable;

            if(self.isSnapped())
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+2,m.Xindex) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relY = m.relY + self._stepY;
            //swap tile?
            if( m.relY == self._bytes.th )
            {
                self._sm.switchRow( m, m.Yindex+2 );
            }
        },
        resolveLeft:function(self) {
            var m = self._movable;

            if(self.isSnapped())
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex-1) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            // update movable
            m.relX =  m.relX-self._stepX;
            //swap tile ?
            if(m.relX==-self._bytes.tw)
            {
                self._sm.switchCol(m,m.Xindex-1);
            }
        },
        resolveRight:function(self) {
            var m = self._movable;
            if(self.isSnapped())
            {
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex,m.Xindex+1) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX+ self._stepX;
            //swap tile?
            if(m.relX==self._bytes.tw)
            {
                self._sm.switchCol(m,m.Xindex+1);
            }
        },
        resolveLeftUp:function(self) {
            var Xi;
            var m = self._movable;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==1)
                    Xi --;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX- self._stepX;
            m.relY = m.relY - self._stepY;
            //swap tile?
            if( m.relX==-self._bytes.th )
            {
                Xi  = m.Xindex;
                if( m.Yindex%2==1)
                {
                    Xi --;
                }
                self._sm.switchColRow( m, m.Yindex-1, Xi );
            }
        },
        resolveLeftDown:function(self) {
            var m = self._movable;
            var Xi;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==1)
                    Xi --;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX- self._stepX;
            m.relY = m.relY+ self._stepY;
            //swap tile?
            if( m.relX==-self._bytes.th )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==1)
                {
                    Xi --;
                }
                self._sm.switchColRow( m, m.Yindex+1, Xi );
            }
        },
        resolveRightUp:function(self) {
            var Xi;
            var m = self._movable;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                    Xi ++;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX+ self._stepX;
            m.relY = m.relY- self._stepY;
            //swap tile?
            if( m.relX==self._bytes.th )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                {
                    Xi ++;
                }
                self._sm.switchColRow( m, m.Yindex-1, Xi );
            }
        },
        resolveRightDown:function(self) {
            var Xi;
            var m = self._movable;
            if( self.isSnapped() )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                    Xi ++;
                //if move is no longer requested || next tile is not walkable
                if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex+1,Xi) )
                {
                    self._currDir = 8;
                    return;
                }
            }
            //update movable
            m.relX = m.relX+ self._stepX;
            m.relY = m.relY+ self._stepY;
            //swap tile?
            if( m.relX == self._bytes.th )
            {
                Xi = m.Xindex;
                if(m.Yindex%2==0)
                {
                    Xi ++;
                }
                self._sm.switchColRow( m, m.Yindex+1, Xi );
            }
        },
        stop:function(){
            this._currDir = 888;
            this._moveInRequest = false;
        }
    } );

    return SpriteMover;
}());

// combination/switch of the two movers above
isogame.SpriteMapMover = (function(){
    function SpriteMapMover( movable, isomap, speed ){
        this._mapMover = new isogame.MapMover( movable, isomap, speed );
        this._spriteMover = new isogame.SpriteMover( movable, isomap, speed );
        this.currMover = this._spriteMover;
        //TODO rest
    }

    return SpriteMapMover;
}());
