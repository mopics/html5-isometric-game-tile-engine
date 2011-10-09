if (! ('pixfonts' in this)) {
    this.pixfonts = {};
}

pixfonts.drawNumber = function( bd, nr, x, y ){
	var i;
	switch( nr )
	{
		case 0:
			for( i=0; i<5; i++ )
			{
				bd.fillRect( x+1, y+i,1,1 );
				bd.fillRect( x+3, y+i,1,1 );
			}
			bd.fillRect( x+2, y , 1, 1 );
			bd.fillRect( x+2, y+4, 1,1 );
			break;
		case 1:
			for( i=0; i<5; i++ )
			{
				bd.fillRect( x+2, y+i,1,1 );
			}
			bd.fillRect( x+1, y , 1, 1 );
			bd.fillRect( x+3, y+4, 1,1 );
			bd.fillRect( x+1, y+4, 1,1 );
			break;
		case 2:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			bd.fillRect( x+3, y+1 , 1, 1 );
			bd.fillRect( x+1, y+3, 1,1 );
			break;
		case 3:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			break;
		case 4:
			bd.fillRect( x+1, y,1,1 );
			bd.fillRect( x+1, y+1,1,1 );
			bd.fillRect( x+1, y+2,1,1 );
			bd.fillRect( x+2, y+2,1,1 );
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			break;
		case 5:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			bd.fillRect( x+1,y+1,1,1);
			bd.fillRect( x+3,y+3,1,1);
			break;
		case 6:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1  );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1);
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+1, y+i,1,1 );
			}
			bd.fillRect( x+3,y+3,1,1 );
			break;
		case 7:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			break;
		case 8:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
				bd.fillRect( x+1, y+i,1,1 );
			}
			break;
		case 9:
			for( i=1; i<4; i++ )
			{
				bd.fillRect( x+i, y,1,1 );
				bd.fillRect( x+i, y+2,1,1 );
				bd.fillRect( x+i, y+4,1,1 );
			}
			for( i=0;i<5; i++ )
			{
				bd.fillRect( x+3, y+i,1,1 );
			}
			bd.fillRect( x+1,y+1,1,1 );
			break;
	}
}
