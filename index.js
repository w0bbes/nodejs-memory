var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var Game = require('./game.js');
var Room = require('./room.js');
var Player = require('./player.js');
var Table = require('./table.js');


app.use('/', express.static(__dirname + "/"));

app.get('/', function(req,res){
	res.sendFile('./index.html');
});

var room = new Room('test');
console.log(room);

io.on('connection', function(socket){

	console.log('new user with id: ' + socket.id);

	socket.on('chat message', function(msg){

		io.emit('chat message', msg);

	});

	socket.on('addPlayer', function(player){

		players[socket.id] = player;

		console.log('player ' + player + ' with id ' + socket.id + ' has joined');

		console.log(Object.size(players));

		for(var key in players) {

			console.log('players: ' + key + ': ' + players[key]);

		}

		if(Object.size(players) >= 2){

			io.emit('showCards');
		}

	});

	socket.on('disconnect',function(client){

		console.log('player ' + socket.id + ' left');

		delete players[client.id];

		for(var key in players) {

			console.log('remaining players: ' + key + ': ' + players[key]);

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