var maps = {}
maps.getTiles= function() {
   _tiles=[];
   for(x=0;x<100;x+=1) {
      for(y=0;y<100;y+=1) {
        
        var random = parseInt(Math.random()*20);
		var randomFloorId = parseInt(Math.random()*5);
		if( randomFloorId>1 ){
			randomFloorId = 1;
		}
        if( random>16) {
			
            _tiles.push({
              "_yindex": y,
              "_xindex": x,
              "_floorid": 1,
              "_itemid":2,
              "_obstruct":true
             });
        } else {
          _tiles.push({
            "_yindex": y,
            "_xindex": x,
            "_floorid": randomFloorId
           });
        }
      }   
  }
  return _tiles;
}
maps.forest = {
	"image":"assets/maps/graphics/simpleGarden.png",
	"tileWidth":32,
	"rows":100,
	"cols":100,
    "enterTiles": [],
    "slices": [{
        "_h": 16,
        "_w": 32,
        "_y": 0,
        "_bmp": null,
        "_oy": 0,
        "_id": 0,
        "_x": 0,
        "_ox": 0,
        "_type": 0
    },
    {
        "_h": 16,
        "_w": 32,
        "_y": 17,
        "_bmp": null,
        "_oy": 0,
        "_id": 1,
        "_x": 0,
        "_ox": 0,
        "_type": 0
    },
    {
        "_h": 16,
        "_w": 32,
        "_y": 34,
        "_bmp": null,
        "_oy": 0,
        "_id": 2,
        "_x": 0,
        "_ox": 0,
        "_type": 0
    },
    {
        "_h": 16,
        "_w": 32,
        "_y": 0,
        "_bmp": null,
        "_oy": 0,
        "_id": 3,
        "_x": 34,
        "_ox": 0,
        "_type": 0
    }],
    "actions": [],
    "tiles": maps.getTiles()
}