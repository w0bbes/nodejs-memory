Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function Table(tableID){
	this.id = tableID;
	this.status = 'available';
	this.players = [];
	this.pack = [];
	this.playerLimit = 2;
	this.gameObj = null;
	this.name; 
}

Table.prototype.setName = function(name){
	this.name = name;
}

Table.prototype.removePlayer = function(player){
	
	var index = -1;
	for(var i = 0; i < this.players.length; i++){
		if(this.players[i].id === player.id){
			index = i;
			break;
		}
	}
	if(index != -1){
		this.players.remove(index);
	}
}

module.exports = Table;