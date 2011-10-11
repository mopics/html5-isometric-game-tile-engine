var maps = {}
maps.getTiles= function() {
   _tiles=[];
   for(x=0;x<100;x+=1) {
      for(y=0;y<100;y+=1) {
        
        floorId=parseInt(Math.random()*3);
        if(floorId>1) {
            itemid=2;
            _tiles.push({
              "_yindex": y,
              "_xindex": x,
              "_floorid": floorId,
              "_itemid":itemid
              });
        } else {
          _tiles.push({
            "_yindex": y,
            "_xindex": x,
            "_floorid": floorId
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