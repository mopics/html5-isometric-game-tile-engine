/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:36 PM
 * To change this template use File | Settings | File Templates.
 */

// 4 :


isogame.MapBytes = (function () {
	function MapBytes(data) {
		//constructor
		this.data = data;
		var numTiles = data.rows * data.cols;
		this.actions = new Int8Array(numTiles);// new Array(numTiles);
		this.passActions = new Int8Array(numTiles);
		this.obstructs = new Int8Array(numTiles);
		this.dirLocks = new Array(numTiles);
		this.coords = new Array(numTiles);
		this.floorIds = new Int32Array(numTiles);
		this.floor2Ids = new Int32Array(numTiles);
		this.itemIds = new Int32Array(numTiles);
		this.mapIndexes = new Array(numTiles);


		this.position = 0;
		this.tw = this.data.tileWidth;
		this.th = this.tw / 2;
		this.thh = this.th / 2;
		this._createBytes();
	}

	MapBytes.prototype = {

		_createBytes: function () {
			var idxCnt = 0;
			// create empty tile bytes
			for (var yi = 0; yi < this.data.rows; yi++) {
				if (yi != 0)//dont create top tiles
				{
					for (var xi = 0; xi < this.data.cols; xi++) {
						var addX = 0;
						if (yi % 2 == 0)
							addX = this.tw / 2;
						if (xi == 0 && addX == 0) {
							//dont create left-side tiles
						}
						else {
							//TODO create tile
							var rX = xi * this.tw + addX;
							var rY = yi * (this.tw / 4);
							//this.writeBoolean(false); // default is set to not active
							this.actions[idxCnt] 		= -1; // actionId
							this.passActions[idxCnt] 	= -1; // passActionId

							this.obstructs[idxCnt]		= true; // obstruct
							//this.writeBoolean(false);// char busy
							//this.writeBoolean(false);// switchfast
							//dirs - locks
							this.dirLocks[idxCnt] =  // same indexes as Constants.dirs
								[
									false, //down
									false, // left-down
									false, // left
									false, // left_up
									false, // up
									false, // right-up
									false, // right
									false // right-down
								];

							//coords
							this.coords[idxCnt] = {x: rX, y: rY, z: -1}; // x, y, z
							//graphics
							this.floorIds[idxCnt] 	= -1; // floor  layer
							this.floor2Ids[idxCnt] 	= -1; // floor2 layer
							this.itemIds[idxCnt]	= -1; // item   layer
							//draw style , placing
							//this.writeInt(-1);
							//this.writeInt(-1);
							//indexes
							this.mapIndexes[idxCnt]	= {y: yi, x: xi};

							idxCnt ++;
						}
					}
				}
			}
			// fill created empty tiles with tile-data
			for (var i = 0; i < this.data.tiles.length; i++) {
				var tile = this.data.tiles[i];
				this.movePosTo(tile._yindex, tile._xindex);
				if (typeof tile._floorid != 'undefined')
					this.floorIds[this.position] = tile._floorid;
				if (typeof tile._floor2id != 'undefined')
					this.floor2Ids[this.position] = tile._floor2id;
				if (typeof tile._itemid != 'undefined')
					this.itemIds[this.position] = tile._itemid;
				if (typeof tile._action != 'undefined')
					this.actions[this.position] = tile._action;
				if (typeof tile._passaction != 'undefined')
					this.passActions[this.position] = tile._passaction;

				this.obstructs[this.position] = false;
				if (typeof tile._obstruct != 'undefined') {
					//console.log( 'MapBytes.fillbytes obsctruct is '+tile._obstruct+' for:'+tile._yindex+'>'+tile._xindex );
					this.obstructs[this.position] = tile._obstruct;
				}
			}
		},
		tileExcists: function (Y, X) {
			if (Y > this.data.rows - 1 || Y < 1 || (Y % 2 == 1 && X > this.data.cols - 1) || X > this.data.cols - 1 || (Y % 2 == 1 && X == 0) || X < 1)
				return false;
			else
				return true;
		},
		movePosTo: function (Y, X) {
			if (Y % 2 == 1) {
				X--;
			}
			Y--;
			//calc how many missing X'ses to substract from X
			var missingXses = Math.round(Y / 2);
			X -= missingXses;
			var pos = this.data.cols * Y + X;
			this.position = this.data.cols * Y + X;
		},
		getTileVo: function () {
			var vo = {};
			vo.dirs = this.dirLocks[this.position];
			vo.floorId = this.floorIds[this.position];
			vo.itemId = this.itemIds[this.position];
			vo.action = this.actions[this.position];
			vo.passAction = this.passActions[this.position];
			vo.obstruct = this.obstructs[this.position];
			vo.x = this.coords[this.position].x;
			vo.y = this.coords[this.position].y;
			vo.z = this.coords[this.position].z;
			vo.xi = this.mapIndexes[this.position].x;
			vo.yi = this.mapIndexes[this.position].y;
			return vo;
		},
		getDirLocks: function () {
			return this.dirLocks[this.position];
		},
		/**
		 * @param: locks ( Array [ down, leftdown, etc..  same indexes as Constants.dirs )
		 */
		setDirLocks: function (locks) {
			this.dirLocks[this.position] = locks;
		},
		getFloorId: function () {
			return this.floorIds[this.position];
		},
		setFloorId: function (id) {
			this.floorIds[this.position] = id;
		},
		getFloor2Id: function () {
			return this.floor2Ids[this.position];
		},
		setFloor2Id: function (id) {
			this.floor2Ids[this.position] = id;
		},
		getItemId: function () {
			return this.itemIds[this.position];
		},
		setItemId: function (id) {
			this.itemIds[this.position] = id;
		},
		getAction: function () {
			return this.actions[this.position];
		},
		setAction: function (a) {
			this.actions[this.position] = a;
		},
		getPassAction: function () {
			return this.passActions[this.position];
		},
		setPassAction: function (pa) {
			this.passActions[this.position] = pa;
		},
		getObstruct: function () {
			return this.obstructs[this.position];
		},
		setObstruct: function (b) {
			this.obstructs[this.position] = b;
		},
		getCoords: function () {
			return this.coords[this.position];
		},
		getIndexes: function () {
			return this.mapIndexes[this.position];
		},
		isWalkable: function (Y, X) {
			var te = this.tileExcists(Y, X);
			this.movePosTo(Y, X);
			var ob = this.obstructs[this.position];

			if (!this.tileExcists(Y, X)) return false;
			this.movePosTo(Y, X);
			return !this.obstructs[this.position];
		}
	}

	return MapBytes;
}());
