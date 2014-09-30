function Player(playerID){
	this.id = playerID;
	this.name = "";
}

Player.prototype.setName = function(name){
	this.name = name;
}

Player.prototype.getName = function(){
	return this.name;
}

exports.Player = Player;