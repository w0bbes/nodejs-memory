function Room(name){
	this.players = [];
	this.tables = [];
	this.name = name;
}

// push een player in array player
Room.prototype.addPlayer = function(player){
	this.players.push(player);
}

Room.prototype.addTable = function(table){
	this.tables.push(table);
}

module.exports = Room;