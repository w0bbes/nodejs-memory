function Game(){

}

Game.prototype.makeDeck = function(){
	var aantal = 16;
	var colors = ['green','yellow','red','blue','purple'];

	for(var i = 0; i <= aantal/2; i++){

		this.makeCard( colors[Math.floor(Math.random()*colors.length)] );

		// 2 arrays met dezelfde kleuren, kleuren mogen niet twee keer voorkomen.
		// de 2 arrays samen voegen met concat.
	}
}

Game.prototype.makeCard = function(color){
	console.log('card created ' + color);

}

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

var room = new Room('test');

exports.Game = Game;
exports.Room = Room;