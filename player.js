function Player(playerID){
	this.id = playerID;
	this.name = "";
	this.tableID = "";
	this.correct = "";
	this.status = "available";
}

Player.prototype.setName = function(name){

	this.name = name;

	console.log('name set' + this.name);

}

Player.prototype.getName = function(){

	return this.name;

}

Player.prototype.removePlayer = function(playerID){

}

Player.prototype.setStatus = function(status){

	this.status = status;

}

module.exports = Player;