function Room(name){
	this.players = [];
	this.tables = [];
	this.name = name;
	this.tableLimit = 2;
}

// push een player in array player
Room.prototype.addPlayer = function(player){

	this.players.push(player);

}

Room.prototype.addTable = function(table){

	this.tables.push(table);

}

// return is een object, object Tables
// hier zit een fout in, length op de tables object?
Room.prototype.getTable = function(tableId){

	var table = null;

	console.log('this.tables' + this.tables.length + ' /this');

	for(var i = 0; i < this.tables.length; i++){

		if(this.tables[i].id == tableId){

			table = this.tables[i];
			break;

		}
	}
	return table;
}

Room.prototype.getPlayer = function(playerId){

	var player = null;

	for(var i = 0; i < this.players.length; i++) {

		if(this.players[i].id == playerId) {

			player = this.players[i];
			break;
		}
	}
	return player;

}



module.exports = Room;