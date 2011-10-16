dojo.provide('isogame.Constants');

isogame.Constants.errors = {
	INVALID_SPRITE_XML:'not a valid XML-sprite file',
	SPITE_MOVE_SPEED_ODD:"Movespeed is unacceptable",
	SCROPPED_SPRITE_NO_MAP_CROP:'Use of the CroppedSpriteMover will cause problems whenn cropRect of IsoMap is not defined'
};

isogame.Constants.dirs = {
	DOWN:0,
	LEFT_DOWN:1,
	LEFT:2,
	LEFT_UP:3,
	UP:4,
	RIGHT_UP:5,
	RIGHT:6,
	RIGHT_DOWN:7
}
