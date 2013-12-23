/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:40 PM
 * To change this template use File | Settings | File Templates.
 */

/** PLAYER CONTROL **/
isogame.KeyControl = (function(){
    function KeyControl()
    {
        // TODO use jquery to detect keypresses
        $(document).keydown( this._keypress );
        //dojo.connect( dojo.doc, "keydown", this._keypress );
        $(document).keyup( this._keyup );
        //dojo.connect( dojo.doc, 'keyup', this._keyup );
    }
    KeyControl.prototype = {
        _keyup:function(e)
        {
            // console.log( "_keyup: e.which="+e.which );
            if( isogame.KeyControl._keydirs[e.keyCode] )
            {
                isogame.KeyControl._keydirs[e.keyCode][0] = false;
            }
        },
        _keypress:function(e)
        {
            // console.log( "_keypress: e.which="+e.which );
            if( isogame.KeyControl._keydirs[e.keyCode] )
            {
                isogame.KeyControl._keydirs[e.keyCode][0] = true;
            }
        },
        getDirection:function() {
            //left
            if( isogame.KeyControl._keydirs[37][0] ) {
                //up
                if(isogame.KeyControl._keydirs[38][0]) return isogame.Constants.dirs.LEFT_UP;
                //down
                if(isogame.KeyControl._keydirs[40][0]) return isogame.Constants.dirs.LEFT_DOWN;
                //left
                return isogame.KeyControl._keydirs[37][1];
            }


            //up
            if( isogame.KeyControl._keydirs[38][0] ) {
                //left
                if(isogame.KeyControl._keydirs[37][0]) return isogame.Constants.dirs.LEFT_UP;
                //right
                if(isogame.KeyControl._keydirs[39][0]) return isogame.Constants.dirs.RIGHT_UP;
                //up
                return isogame.KeyControl._keydirs[38][1];
            }



            //right
            if( isogame.KeyControl._keydirs[39][0] ) {
                //up
                if(isogame.KeyControl._keydirs[38][0]) return isogame.Constants.dirs.RIGHT_UP;
                //down
                if(isogame.KeyControl._keydirs[40][0]) return isogame.Constants.dirs.RIGHT_DOWN;
                //right
                return isogame.KeyControl._keydirs[39][1];

            }



            //down
            if( isogame.KeyControl._keydirs[40][0] ) {
                //left
                if(isogame.KeyControl._keydirs[37][0]) return isogame.Constants.dirs.LEFT_DOWN;
                //right
                if(isogame.KeyControl._keydirs[39][0]) return isogame.Constants.dirs.RIGHT_DOWN;
                //down
                return isogame.KeyControl._keydirs[40][1];
            }
            return 8;
        }
    };
    KeyControl._keydirs =[];
    KeyControl._keydirs[37] = [ false, isogame.Constants.dirs.LEFT ];
    KeyControl._keydirs[38] = [ false, isogame.Constants.dirs.UP ];
    KeyControl._keydirs[39] = [ false, isogame.Constants.dirs.RIGHT ];
    KeyControl._keydirs[40] = [ false, isogame.Constants.dirs.DOWN ];

    return KeyControl;
}());
isogame.MouseControl = (function(){
    function MouseControl( movable /* Movable */ , map /*IsoMap*/, listenSelf /* boolean */ ){
        this.tileClicked = null; /* Point */
        this.map = map;
        this.movable = movable;
        this.pathEvt = null; /* AStar pathfound event ( structure below )*/
        this.pathEvtBuff = null;
        /*
         evt.pathArray;
         evt.dirArray;
         evt.targetTile;
         evt.mapVO;
         evt.action;
         evt.actionMsg;
         */
        this.curr = -1;
        this.pathBuffering = false;

        var self = this;
		if( listenSelf ){
        	this.map._mouseLyr.onclick = function( evt ){
	            self.handleClick( evt.layerX, evt.layerY );
			};
		}
    };
    MouseControl.prototype = {
        getDirection:function(){
            if( this.pathEvt ){
                if( this.movable.mover.isSnapped() ){
                    if( this.pathEvtBuff ){
                        this.pathEvt = this.pathEvtBuff;
                        this.pathEvtBuff = null;
                        this.pathBuffering = false;
                        this.curr = -1;
                    }
                    this.curr  ++;
                    if( this.pathEvt.dirArray.length==this.curr ){ // path is walked
                        console.log('path is walked');
                        this.pathEvt = null;
                        this.curr = -1;
                        return 8;
                    }
                    else
                        return this.pathEvt.dirArray[this.curr];
                }
            }
            else if( this.pathEvtBuff ){
                this.pathEvt = this.pathEvtBuff;
                this.pathEvtBuff = null;
                this.pathBuffering = false;
                this.curr = -1;
            }
            return 8; // no path to walk;
        },
		handleClick:function( mx, my ){
			// calculate relative mouseX, mouseY on croptranslated map
            var x = mx /* self.map._tilePainter.xCanvasTranslateAmount */+ this.map._tilePainter.xCropTranslate +
                this.map._tilePainter.md;
            var y = my /* self.map._tilePainter.yCanvasTranslateAmount */+ this.map._tilePainter.yCropTranslate;
			
			var i = this.map._m2t.getIndexes( x, y, this.map );
			var self = this;
            // console.log(i.y+"."+ i.x );
            if( this.pathEvt ) { // do a buffer pathfind
                this.pathBuffering = true;
                //TODO: calculate next tile movable is gonna be snapped on
                var futureIndexes = this.movable.mover.getFutureIndexes();
                var astar = new isogame.AStar( this.map._tilePainter.bytes, futureIndexes.y, futureIndexes.x, i.y, i.x, 1000 );//, this.map._mouseLyr.getContext('2d') );
                astar.onPathFound = function( evt ){
                    // console.log( 'MouseControl.astar.onPathFound:'+evt.dirArray );
                    self.pathEvtBuff = evt;
                }
                astar.onPathNotFound = function( evt ){
                    console.log( 'MouseControl.astar.onPathNotFound' );
                    self.pathEvtBuff = null;
                }
                astar.start();
            } else {
                var oldY = this.movable.Yindex;
                var oldX = this.movable.Xindex;
                var astar = new isogame.AStar( this.map._tilePainter.bytes, oldY, oldX, i.y, i.x, 1000 );//, this.map._mouseLyr.getContext('2d') );
                astar.onPathFound = function( evt ){
                    // console.log( 'MouseControl.astar.onPathFound:'+evt.dirArray );
                    self.pathEvt = evt;
                    self.curr = -1;
                }
                astar.onPathNotFound = function( evt ){
                    console.log( 'MouseControl.astar.onPathNotFound' );
                    self.pathEvt = null;
                }
                astar.start();
            }
		}
    }
    return MouseControl;
}());