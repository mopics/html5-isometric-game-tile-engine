/**
 * Created with JetBrains WebStorm.
 * User: peter
 * Date: 4/18/13
 * Time: 4:37 PM
 * To change this template use File | Settings | File Templates.
 */

// 5 :

isogame.Mouse2Tile = (function(){

    /*
    io:
        tileWidth, 
        rows, 
        cols,
        canvas,
        offset,
    */
    function Mouse2Tile( io ) { 
        if( !io.tw ) { throw new Error( 'Mouse2Tile: specify io.tw ( tilewidth )')}
        var tw = io.tw;
        if( !io.rows ) { throw new Error( 'Mouse2Tile: specify io.rows ( rows in mapdata )')}
        var rows = io.rows;
        if( !io.cols ) { throw new Error( 'Mouse2Tile: specify io.cols ( cols in mapdata )')}
        var cols = io.cols;
        if( !io.canvas ) { throw new Error( 'Mouse2Tile: specify io.canvas ( tw * th )')}
        var canvas = io.canvas;
        this.offset = {x:0, y:0};
        if( io.offset )
            this.offset = io.offset;

        this.TOPLEFT = "#ff0000";
        this.TOPRIGHT = "#00ff00";
        this.cols = cols;
        this.rows = rows;
        this.tw = tw;
        this.th = this.tw/2;
        this.thh = this.th/2;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // this.context.globalAlpha = 0;

        //TODO: draw topleft triangle
        this.context.fillStyle = "#000000";
        this.context.fillRect(0,0,this.tw, this.th );

        this.context.fillStyle = this.TOPLEFT;
        this.context.beginPath();
        this.context.moveTo(this.th,0);
        this.context.lineTo( 0,this.thh );
        this.context.lineTo( 0, 0 );
        this.context.closePath();
        //context.stroke();
        this.context.fill();
        this.context.fillStyle = this.TOPRIGHT;
        this.context.beginPath();
        this.context.moveTo(this.th,0);
        this.context.lineTo( this.tw,this.thh );
        this.context.lineTo( this.tw, 0 );
        this.context.closePath();
        this.context.fill();
        this.context.fillStyle = this.BOTLEFT;
        this.context.beginPath();
        this.context.moveTo(this.th,this.th);
        this.context.lineTo( 0,this.thh );
        this.context.lineTo( 0, this.th );
        this.context.closePath();
        this.context.fill();
        this.context.fillStyle = this.BOTRIGHT;
        this.context.beginPath();
        this.context.moveTo(this.th,this.th);
        this.context.lineTo( this.tw,this.thh );
        this.context.lineTo( this.tw, this.th );
        this.context.closePath();
        this.context.fill();
    }
    Mouse2Tile.prototype = {
        getIndexes:function( xm, ym, map ) { // returns isogame.Point containing tile map-indexes
            xm -= this.offset.x;
            ym -= this.offset.y;

            var fyIsOdd = false;

            var yr  = (ym)%this.thh;
            var fmy = (ym)-yr;
            var fy  = Math.round((fmy)/this.thh);

            var xr  = (xm)%this.tw;
            var fmx = (xm)-xr;
            var fx  = Math.round(fmx/this.tw);

            if( fy%2==1 ){
                fyIsOdd = true;
            }
            else {
                if( xr>this.th )
                    fmx += this.th;
                else {
                    fmx -= this.th;
                    fx -= 1;
                }
            }

            // console.log( 'Mouse2Tile.getIndexes first try:='+fy+"."+fx );
            // $('#m2t').attr( "style", "position:absolute; top:"+fmy+"px; left:"+fmx+"px");

            //to do check trhu bmp
            var py = ym - fmy;
            var px = xm - fmx;

            // TOT hier klopt alles!!!!


            // TODO: use Mathmatics in stead of pixel color to determin Topleft || Top Right


            var imgd = this.context.getImageData( px, py, 1, 1 );
            var c = imgd.data;
            // console.log( 'Mouse2Tile.color.length='+ c[0]+","+c[1]+","+c[2] );


            if( c[0]>130 ) {
                // console.log( "pixelClr is topleft");
                if(fyIsOdd){
                    fx -= 1;
                }
                fy -= 1;
            }
            else if( c[1]>130 ){
                // console.log( "pixelClr is topright");
                if( !fyIsOdd )
                    fx += 1;
                fy -= 1;
            }
            //to do check wether index exists
            //			if(fy%2==1 && fx==0)
            //				return null;
            //			if( fy==0 || fx > cols-1 || fy>rows-1)
            //				return null;
            // reverse : from indexes to pix coords

            return new isogame.Point(fx,fy);
        },
        converRGB2String:function RGB2HTML(red, green, blue)
        {
            var decColor = red + 256 * green + 65536 * blue;
            return "#"+decColor.toString(16);
        }
    };
    return Mouse2Tile;
}());
