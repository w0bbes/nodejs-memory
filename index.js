var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var Game = require('./game.js');
var Room = require('./room.js');
var Player = require('./player.js');
var Table = require('./table.js');

var players = [];

app.use('/', express.static(__dirname + "/"));

app.get('/', function(req,res){
	res.sendFile('./index.html');
});

var room = new Room('test');
var table = new Table(1);
var game = new Game();
var player = new Player('test-new-id');

table.setName('test room');
room.tables = table;
table.gameObj = game;
table.pack = game.pack;


io.on('connection', function(socket){

	/*
		Speler voert naam in en klikt op Ready
	*/

	socket.on('connectToServer', function(data){

		// welke user komt er binnen en met welk id
		console.log('new user with id: ' + socket.id);

		// nieuw Player object maken met het id van de socket
		var player = new Player(socket.id);

		// zet de naam afhankelijk van het veld 'name'
		var name = data;

		player.setName(name);

		// zet de status naar 'intable'
		player.setStatus('intable');

		// voeg de speler toe aan een 'room'
		room.addPlayer(player);

		// stuur een bericht dat er een nieuwe user bij is gekomen.
		io.sockets.emit('logging',{message: name + ' has connected'});

		console.log(room);

	});


	socket.on('connectToTable', function(data){

		// dit returned juiste object
		var player = room.getPlayer(socket.id);		

		// zou een object moeten returnen
		var table = room.getTable(data.tableID);


		if( table.addPlayer(player) && table.isTableAvailable() ){
			console.log('jaaaaaa toevoegen!');
		}

	});
	

	socket.on('chat message', function(msg){

		io.emit('chat message', msg);

	});

	socket.on('disconnect', function(client){

		// huidige player opzoeken op socket id
		var player = room.getPlayer(socket.id);

		// speler bestaat en zit aan tafel
		if(player && player.status === 'intable'){

			var table = room.getTable(player.tableID);

			table.removePlayer(player);
			table.status = 'available';
			player.status = 'available';

			io.sockets.emit('logging', player.name + 'has left the building');

		}

	});

});


http.listen(3000, function(){
	console.log('De serverluisteraar op poort 3000');
});


Object.size = function(obj) {  
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


