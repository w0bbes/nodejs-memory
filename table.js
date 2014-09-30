function Table(tableID){
	this.id = tableID;
	this.status = 'available';
	this.player = [];
	this.pack = [];
	this.playerLimit = 2;
	this.gameObj = null;
	this.name; 
}

Table.prototype.setName = function(name){
	this.name = name;
}

exports.Table = Table;