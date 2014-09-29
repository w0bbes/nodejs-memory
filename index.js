var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var game = require(__dirname +'/memory.js');
game.makeDeck();

console.log('Deck created');

var players = {};
var start = false;

app.get('/', function(req,res){
	res.sendFile(__dirname +'/index.html');
});

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

	});

	socket.on('disconnect',function(){

		console.log('player ' + socket.id + ' left');

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