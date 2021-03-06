Game = require("./game.js");
Table = require('./table.js');

//var uuid = require('node-uuid');

function Messaging(){};

Messaging.prototype.createSampleTables = function(amount) {
	
	var tableList = [];
	for(var i = 0; i < amount; i++){
		var game = new Game();
		//var table = new Table(uuid.v4());
		var table = new Table(1);
		table.setName("Test Table" + (i + 1));
		table.gameObj = game;
		table.pack = game.pack; //adds the shuffled pack from the constructor
		table.status = "available";
		tableList.push(table);
	}
	return tableList;

};

module.exports = Messaging;