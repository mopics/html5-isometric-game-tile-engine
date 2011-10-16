dojo.require( 'isogame.Constants' );

dojo.provide( 'isogame.KeyControl' );

dojo.declare( 'isogame.KeyControl', null, {
	constructor:function()
	{
		$(document).keydown( this._keypress );
		$(document).keyup( this._keyup );
	},
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
});

isogame.KeyControl._keydirs =[];
isogame.KeyControl._keydirs[37] = [ false, isogame.Constants.dirs.LEFT ];
isogame.KeyControl._keydirs[38] = [ false, isogame.Constants.dirs.UP ];
isogame.KeyControl._keydirs[39] = [ false, isogame.Constants.dirs.RIGHT ];
isogame.KeyControl._keydirs[40] = [ false, isogame.Constants.dirs.DOWN ];