/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:41 PM
 * To change this template use File | Settings | File Templates.
 */

// TODO: make an pathmover that's interferible
/** ASTAR PATHFINDER **/
isogame.AStar = function () {
    function AStar( bytes /* isogame.MapBytes*/, oldY /*Number*/, oldX /*Number*/, newY /*Number*/, newX /*Number*/, maxScans/*Number*/, infocanvas/*Canvas2D*/, dir4 /*boolean*/) {
        if ( !bytes.tileExcists(newY, newX ) ) throw new Error("isogame.AStar ERROR: " + newY + ">" + newX + " does not excist! ");
        if ( !bytes.tileExcists(oldY, oldX ) ) throw new Error("isogame.AStar ERROR: " + oldY + ">" + oldX + " does not excist! ");
        this.dir4 = dir4;
        this.infocanvas = infocanvas;
        this._maxScans = maxScans || 255;
        this._bytes = bytes;
        this.tw = this._bytes.tw; this.th = this._bytes.th; this.thh = this._bytes.thh;
        this._oldX = oldX;
        this._oldY = oldY;
        this._newX = newX;
        this._newYOdd = newY%2;
        this._newY = newY;
        this._targetTile = newY+">"+newX;
        this._bytes.movePosTo( newY, newX );
        this._actionMsg = this._bytes.getAction();
        this._startTile = oldY+">"+oldX;
        this._pathArray = [];
        this._dirArray = [];
        this._reRun = false;
        this._closedList = {};
        this._openList = {};
        this._Fscores = [];
        this._Fscores[0] = 0;
        this._totalScans = 0;

        this._straightDis = 8;
        this._vertDis = 16;
        this._horiDis = 16;
        this._HstraightDis = 8;
        this._HvertDis = 10;
        this._HhoriDis = 10;
        this._retry = 0;
    };

    AStar.prototype = {
        start:function()
        {
            var StartTile = [];
            StartTile.parent = null;
            StartTile.H = this.calcH( this._oldX, this._oldY );
            // console.log( 'AStart.start StartTile.H='+StartTile.H );
            StartTile.G = 0;
            StartTile.F = parseInt(StartTile.H + StartTile.G);

            this._openList[ this._startTile ] = StartTile;
            if(this._reRun==false)
            {
                this._Fscores [1] = [];
                this._Fscores [1].F = StartTile.F;
                this._Fscores [1].N = this._startTile;
            }

            //if target has action asigned to it
            if((this._actionMsg=="walkto")||(this._actionMsg=="undefined"))
            {
                this._action = false;
            }
            else
            {
                this._action = true;
            }
            // getTimer(); TODO : use javascript equavalant of as2 getTimer

            this.scanAdjacent ( this._oldX, this._oldY );
        },
        scanAdjacent:function (X /*int*/, Y /*int*/) //scan neighbouring tiles from currTile
        {
            this._totalScans += 1 ;
            var currTile = Y + ">" + X;
            var targetFound = false;
            //add current tile parent to closedList and remove from openlist + _Fscores array
            this._closedList [currTile] = new Array;
            //if( this._openList[currTile] ){
            this._closedList [currTile].parent = this._openList [currTile].parent;
            this._closedList [currTile].dir = this._openList [currTile].dir;
            this._closedList [currTile].G = this._openList [currTile].G;
            this._closedList [currTile].H = this._openList [currTile].H;
            this._closedList [currTile].F = this._openList [currTile].F;
            //}

            delete this._openList[currTile];
            //remove from Fscores
            this.removeFromHeap(this._Fscores);

            var si = 0;
            if( this.dir4 ) {
                si = 4;
            }
            for (var i = si; i < 8; i ++)
            {
                if (currTile == this._targetTile)
                {
                    targetFound = true;
                    break;
                }
                var distance = 0;
                var dir = 9;
                switch (i) // 8 adjacent tiles
                {
                    // TODO: rectify directions
                    case 0 :
                        dir = isogame.Constants.dirs.UP;
                        var checkY = Y - 2;
                        var checkX = X;
                        distance = this._vertDis;
                        break;
                    case 1 :
                        dir = isogame.Constants.dirs.DOWN;
                        var checkY = Y + 2;
                        var checkX = X;
                        distance = this._vertDis;
                        break;
                    case 2 :
                        dir = isogame.Constants.dirs.LEFT;
                        var checkY = Y;
                        var checkX = X - 1;
                        distance = this._horiDis;
                        break;
                    case 3 :
                        dir = isogame.Constants.dirs.RIGHT;
                        var checkY = Y;
                        var checkX = X + 1;
                        distance = this._horiDis;
                        break;
                    case 4 :
                        dir = isogame.Constants.dirs.RIGHT_UP;
                        var checkY = Y - 1;
                        var checkX = X;
                        if( Y%2==0 )// if even
                            checkX = X + 1;
                        distance = this._straightDis;
                        break;
                    case 5 :
                        dir = isogame.Constants.dirs.LEFT_UP;
                        var checkY = Y - 1;
                        var checkX = X;
                        if( Y%2 ) // if odd
                            checkX = X - 1;
                        distance =this._straightDis;
                        break;
                    case 6 :
                        dir = isogame.Constants.dirs.RIGHT_DOWN;
                        var checkY = Y + 1;
                        var checkX = X;
                        if( Y%2==0 )// if even
                            checkX = X + 1;
                        distance = this._straightDis;
                        break;
                    case 7 :
                        dir = isogame.Constants.dirs.LEFT_DOWN;
                        var checkY = Y + 1;
                        var checkX = X;
                        if( Y%2 ) // if odd
                            checkX = X - 1;
                        distance = this._straightDis;
                        break;
                }
                //console.log( 'AStar.scanAdjacent isogame.Constants.UP=  '+isogame.Constants.UP );
                var checkTile = checkY+">"+checkX;

                //if walkable or grapich attached to it or not on the closedList
                var walkable = this._bytes.isWalkable( checkY, checkX );

                if ( ( walkable || checkTile == this._targetTile ) && this._closedList[checkTile] == undefined ) {
                    //if not on the openList add to openList record parent-tile H,G + F and add new F to _Fscores
                    if ( this._openList[checkTile] == undefined ) {

                        var tile = this._openList[checkTile] = [];
                        tile.parent = currTile;
                        tile.dir = dir;
                        tile.H = this.calcH( checkX, checkY );
                        tile.G = this._closedList [currTile].G + distance;
                        //vertical movement cost
                        tile.F = tile.G + tile.H;
                        //store F cost in seperate Array
                        var l = this._Fscores.length;
                        this.add2heap( l, checkTile, tile.F, this._Fscores );

                        // TODO: set visuals on infoCanvas
                        this.drawCheckTile( checkY, checkX, false );
                    }
                    //if it is already on the openList
                    else
                    {
                        // if G cost is higher then currTiles
                        var currG = this._closedList[currTile].G + distance;
                        //vertical movement cost
                        if(currG <= this._openList [checkTile].G) // this total G is smaller then the older one
                        {
                            //change parent 2 current tile + G, F costs
                            var tile = this._openList [checkTile];
                            tile.parent = currTile;
                            tile.dir = dir;
                            tile.G = currG;
                            tile.F = currG + tile.H;
                            //replace F cost in seperate _Fscores
                            this.replaceInHeap( checkTile, this._Fscores, tile.F );

                            // TODO: set visuals on infoCanvas
                            this.drawCheckTile( checkY, checkX, true );
                        }
                    }

                }

            }

            if( targetFound == true || this._Fscores.length < 2 )
            {
                if (targetFound == true)
                {
                    //trace ("-------------------------------------")
                    //trace(_totalScans+":"+_Fscores[0].N+":"+_Fscores[0].F);
                    //trace (_targetTile + " found in: " + _totalScans + " scans, in " + getTimer () + " miliseconds ");

                    this.tracePathBack( this._targetTile );
                }
                else
                {
                    this.onPathNotFound();
                }
            }
            else if( this._totalScans < this._maxScans )
            {
                var Next = this._Fscores [1].N.split (">", 2);
                this.scanAdjacent( parseInt(Next [1]) , parseInt(Next [0]) );
            }
            else {
                this.onPathNotFound();
            }
        },
        drawCheckTile:function( checkY, checkX, onOpenList /*boolean*/ ){
            if( !this.infocanvas ) return;
            this._bytes.movePosTo( checkY, checkX );
            var c/*Point*/ = this._bytes.getCoords();
            var coords = new isogame.Point ( c.x, c.y );
            coords.x += this.th;
            coords.y += this.thh;
            if(  checkY + ">" + checkX == this._targetTile )
                console.log('AStar.drawCheckTile: TARGET FOUND!!!' );
            this.infocanvas.beginPath();
            this.infocanvas.fillStyle = "#f00";

            this.infocanvas.rect( coords.x, coords.y, 2, 2 );

            //this.infocanvas.fillStyle = "#f00";
            this.infocanvas.fill();
            this.infocanvas.closePath();

            /*_mapMc[checkTile].open._visible = onOpenList
             _mapMc[checkTile].close._visible = !onOpenList
             _mapMc[checkTile].F.text = tile.F
             _mapMc[checkTile].G.text = tile.G
             _mapMc[checkTile].H.text = tile.H*/

            /* var p =_mapMc.path.attachMovie("H",i*11,i*11);
             p._x = _mapMc[checkTile]._x;
             p._y = _mapMc[checkTile]._y;*/
        },
        /* test method for checking pathfind process step by step */
        nextStep:function()
        {
            var Next = this._Fscores [1].N.split (">", 2);
            this.scanAdjacent( parseInt (Next [1]) , parseInt (Next [0] ) );
        },
        calcH:function( X, Y ) //heuristic calculation
        {
            var oldX = this._oldX; var oldY = this._oldY;
            var newX = this._newX; var newY = this._newY;

            var shiftX = new Number;
            var currX = X;
            var currY = Y;
            var currYOdd = Y%2;
            var shiftY = new Number;
            var shiftH = new Number;
            var currH = new Number;
            var dir = new String;
            var t = 0;
            this._pathArray [0] = Y + ">" + X;
            this._pathFound = false;
            while ( !this._pathFound )
            {
                if ((currX == this._newX) && (currY == this._newY))
                {
                    this._pathFound = true;
                    break;
                }
                if( currY == this._newY ) {
                    // if old/new yi is the same = scan horizontal

                    if (currX < this._newX) { //right rigid scan
                        shiftX = 1;
                        shiftY = 0;
                        shiftH = this._HhoriDis;
                        dir = "right";
                    }
                    else { //left rigid scan
                        shiftX = - 1;
                        shiftY = 0;
                        shiftH = this._HhoriDis;
                        dir = "left";
                    }
                }
                else if( currX == this._newX && currYOdd == this._newYOdd ) {
                    // if old/new xi is the same and old/new yi has same oddness or non-oddness = vertical

                    if (currY > this._newY) { //up rigid scan
                        shiftX = 0;
                        shiftY = - 2;
                        shiftH = this._HvertDis;
                        dir = "up";

                    }
                    else { //down rigid scan
                        shiftX = 0;
                        shiftY = 2;
                        shiftH = this._HvertDis;
                        dir = "down";
                    }
                }
                else //wide scans
                {

                    if ( currY > this._newY) //boven
                    {
                        if ( (currX < this._newX) || ( currX==this._newX && currYOdd )) {//rechtsboven wide scan
                            shiftX = 0;
                            if( !currYOdd )
                                shiftX = 1;
                            shiftY = - 1;
                            shiftH = this._HstraightDis;
                            dir = "leftup";
                        }
                        else {// if ( (currX > this._newY) || ( currX==this._newX && !currYOdd ) ) {//linksboven wide scan
                            shiftX = 0;
                            if( currYOdd )
                                shiftX = -1;
                            shiftY = - 1;
                            shiftH = this._HstraightDis;
                            dir = "rightup";
                        }
                    }

                    else if (currY < this._newY) //onder
                    {
                        if ( ( currX > this._newX ) || ( currX==this._newX && !currYOdd) ) //linksonder wide scan
                        {
                            shiftX = 0;
                            if( currYOdd )
                                shiftX = -1;
                            shiftY = 1;
                            shiftH = this._HstraightDis;
                            dir = "leftdown";
                        }
                        else {//if ( ( currX < this._newX ) || ( currX==this._newX && currYOdd )) //rechtsonder wide scan
                            shiftX = 0;
                            if( !currYOdd )
                                shiftX = 1;
                            shiftY = 1;
                            shiftH = this._HstraightDis;
                            dir = "rightdown";

                        }
                    }
                }
                currX += shiftX;
                currY += shiftY;
                currH += shiftH;
                currYOdd = currY%2;
            }
            return currH*3;
        },
        tracePathBack:function( tile /*string*/ )
        {
            if ( this._closedList [tile].parent != undefined)
            {
                var parentTile = this._closedList[tile].parent;
                this._pathArray.push( parentTile );
                this._dirArray.push( this._closedList[tile].dir );
                // console.log('AStar.tracePathBack : dir='+this._closedList[tile].dir );
                /*var p = _root.pathMc.attachMovie ("pathTile", l, l);
                 p._x = _mapVO.tiles [parentTile].X;
                 p._y = _mapVO.tiles [parentTile].Y;*/
                this.tracePathBack (parentTile);
            }
            else
            {
                this._pathArray.reverse ();
                this._dirArray.reverse ();
                var l/*int*/ = this._pathArray.length - 1
                this._pathArray [l] = this._targetTile;

                var evt = {};
                evt.pathArray = this._pathArray;
                evt.dirArray = this._dirArray;
                evt.targetTile = this._targetTile;
                evt.mapVO = this._mapVO;
                evt.action = this._action;
                evt.actionMsg = this._actionMsg;

                this.onPathFound( evt );
            }
        },

        /** Binary Heap methods */
        swapItem:function( index1 /*int*/,index2/*int*/,array/*Array*/ )
        {
            var i1 = array[index1];
            var i2 = array[index2];
            array[index1] = i2;
            array[index2] = i1;
        },
        add2heap:function(index/*int*/,Name/*string*/,Fscore/*int*/,array/*array*/)
        {
            array[index] = {};
            array[index].N = Name;
            array[index].F = Fscore;
            this.sortHeapAfterAdd(index,array);
        },
        replaceInHeap:function( Name/*string*/,array/*array*/,Fscore/*int*/)
        {
            for(var i=1;i<array.length;i++)
            {
                if(array[i].N==Name)
                {
                    array[i].N = Name;
                    array[i].F = Fscore;
                    this.sortHeapAfterAdd(i,array);
                    return;

                }
            }
        },
        sortHeapAfterAdd:function(index/*int*/,array/*array*/)
        {
            var parentIndex = Math.floor(index/2);
            if(array[parentIndex].F>array[index].F)
            {
                this.swapItem(parentIndex,index,array);
                this.sortHeapAfterAdd(parentIndex,array);
            }
        },
        removeFromHeap:function( array/*array*/ )
        {
            if(array.length>0)
            {
                //replacing slot#1 item with last slot item
                var lastIndex = array.length-1;
                array[1].F = array[lastIndex].F;
                array[1].N = array[lastIndex].N;
                array.pop();
                //resort rest of array after remove
                this.sortHeapAfterRemove(1,array);
            }
        },
        sortHeapAfterRemove:function( Index/*int*/,array/*array*/ )
        {
            var child1 = Index*2;
            var child2 = Index*2+1;
            if( array.length>3 )
            {
                if( array[child1]==undefined || array[child2]==undefined )// children not undefined--end of array
                {
                    return; // break;
                }
                else
                {
                    if((array[Index].F<array[child1].F)&&(array[Index].F<array[child2].F))//if parent is smaller then its 2 children
                    {
                        return; // break;
                    }
                    else // bigger then 1 or 2 of its children
                    {
                        //swap parent with lowst F cost child
                        if(array[child1].F<array[child2].F)//1 < 2
                        {
                            this.swapItem(child1,Index,array);
                            this.sortHeapAfterRemove(child1,array);
                        }else // 2 < 1
                        {
                            this.swapItem(child2,Index,array);
                            this.sortHeapAfterRemove(child2,array);
                        }

                    }
                }
            }
            else if( array.length==3 ){
                if( array[1].F > array[2].F ){
                    this.swapItem(1,2,array);
                    console.log( "swapped the last 2.");
                }
            }
        },
        /** end Binary Heap methods */

        /* events */
        onPathNotFound:function(){},
        onPathFound:function(evt){}
    }

    return AStar;
}();

