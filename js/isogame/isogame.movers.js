Class = js.lang.Class;
Interface = js.lang.Interface;

if (! ('isogame' in this)) {
    this.isogame = {};
}

isogame.AMover = new Class( isogame.AMover )({
	__init__:function( movable, isomap, speed ) {
		this._map = isomap;
		this._bytes = isomap._bytes;
		this._sm = isomap._spriteManager;
		this._movable = movable;
		this._stepX = 0;
		this._stepY = 0;
		//check if movespeed is acceptable
		var n = map.tw / speed;
		var ch = n.toString().split('.');
		if ( ch.length > 1 )
		{
			throw isogame.errors.SPITE_MOVE_SPEED_ODD;
		}
		this._speed = speed;
		this._moveInRequest=false;
		this._currDir = 8;
		this._dirFuncs = [ this.down, this.leftdown, this.left, this.leftup, 
								 this.up, this.rightup, this.right, this.rightdown  ];
		this._mouseTarget; // geom.Point
	},
	update:function()
	{
		//to be overridden by decorators
	},
	goInDir:function( d )
	{
		this._currDir = d;
		this._dirFuncs[d](this);
	},
	up:function(self)
	{
		self._stepY = 2*self._speed;
		self._stepX = 0;
	},
	down:function(self)
	{
		self._stepY = 2*self._speed;
		self._stepX = 0;
	},
	left:function(self)
	{
		self._stepY = 0;
		self._stepX = 2*self._speed;
	},
	right:function(self)
	{
		self._stepY = 0;
		self._stepX = 2*self._speed;
	},
	leftup:function(self)
	{
		self._stepY   = 1*self._speed;
		self._stepX   = 2*self._speed;
	},
	rightup:function(self)
	{
		self._stepY   = 1*self._speed;
		self._stepX   = 2*self._speed;
	},
	leftdown:function(self)
	{
		self._stepY   = 1*self._speed;
		self._stepX   = 2*self._speed;
	},
	rightdown:function(self)
	{
		self._stepY   = 1*self._speed;
		self._stepX   = 2*self._speed;
	},
	stop:function()
	{
		this._currDir = 8;
		this._stepY   = 0;
		this._stepX   = 0;
		this._moveInRequest = false;
	},
	isRequested:function() {
		return this._moveInRequest;
	},
	setRequested:function( b ) {
		this._moveInRequest = b;
	},
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
	},
});


isogame.SpriteMover = new Class( isogame.AMover ) ({
	__init__:function( movable, isomap, speed )
	{
		isogame.AMover.__init__.call( this, movable, isomap, speed );
		
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
	},
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
			var wb = self._bytes.isWalkable(m.Yindex-2,m.Xindex);
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
			if( !self._moveInRequest || !self._bytes.isWalkable(m.Yindex-1,m.Xindex) )
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
		this._moveInRequest = false;
	}
});


