var socket = require('socket.io');

var Game = require('./game.js');
var Room = require('./room.js');
var Player = require('./player.js');
var Table = require('./table.js');
var Messaging = require('./messaging.js');

//var players = [];

//setup an Express server to serve the content
var http = require("http");
var express = require("express");
var app = express();

app.use("/", express.static(__dirname + "/"));
app.use("/resources", express.static(__dirname + "/resources"));

var server = http.createServer(app);
server.listen(3000);
var io = socket.listen(server);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.set("log level", 1);

var messaging = new Messaging();
var room = new Room('test');
room.tables = messaging.createSampleTables(1);

/*
memory is 52 kaartjes... maar dit is wat te groot voor ons speelveld.
*/

io.sockets.on('connection', function(socket) {

    /*
Speler voert naam in en klikt op Ready
*/

    socket.on('connectToServer', function(data) {

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
        io.sockets.emit('logging', {
            message: name + ' has connected'
        });

        console.log(room);

    });


    socket.on('connectToTable', function(data) {

        // dit returned juiste object
        var player = room.getPlayer(socket.id);

        // zou een object moeten returnen
        var table = room.getTable(data.tableID);

        console.log('table' + table.id + '');

        if (table.addPlayer(player) && table.isTableAvailable()) {

            player.tableID = table.id;
            player.status = 'intable';

            table.playersID.push(socket.id);

            io.sockets.emit('logging', {
                message: player.name + 'has connected to table ' + table.name + '.'
            });

            if (table.players.length < 2) {
                io.sockets.emit('logging', {
                    message: 'There is ' + table.players.length + ' player at this table. There are ' + table.playerLimit + ' needed to start'
                });
                io.sockets.emit('logging', {
                    message: 'Waiting for other players'
                });
            } else {
                io.sockets.emit('logging', {
                    message: 'Enough players, starting'
                });

                var countdown = 1; //3 seconds in reality...
                setInterval(function() {
                    countdown--;
                    io.sockets.emit('timer', {
                        countdown: countdown
                    });
                }, 1000);

            }

        } else {
            console.log('niks');
        }

    });

    socket.on('readyToPlay', function(data) {

        console.log('Ready to play!');

        var player = room.getPlayer(socket.id);


        var table = room.getTable(data.table);
        player.status = 'playing';

        table.readyToPlayCounter++;

        var randomNumber = Math.floor(Math.random() * table.playerLimit);

        if (table.readyToPlayCounter === table.playerLimit) {

            table.status = 'unavailable';

            io.sockets.emit('game', {
                deck: table.pack
            });

            for (var i = 0; i < table.players.length; i++) {

                var startingPlayerId = table.playersID[randomNumber];

                if (table.players[i].id === startingPlayerId) {

                    table.players[i].turnFinished = false;

                    io.sockets.emit('logging', {
                        message: table.players[i].name + ' will start.'
                    });

                    io.to(table.players[i].id).emit('turn', {
                        myturn: true
                    });

                } else {

                    io.sockets.emit('logging', {
                        message: table.players[i].name + ' will not start.'
                    });

                    table.players[i].turnFinished = true;

                    io.to(table.players[i].id).emit('turn', {
                        myturn: false
                    });

                }

            }

        }

    });


    socket.on('chat message', function(msg) {

        io.emit('chat message', msg);

    });

    socket.on('flipCard', function(data) {

        // heb geen socket.id ?!
        // var player = room.getPlayer(socket.id);

        
        var player = room.getPlayer(socket.id);


        var table = room.getTable(data.tableID);
        var cardPos = data.pos;
        var flippedColor = data.color;


        player.flippedColor.push(data.color);
        player.flipCounter++;

        var otherPlayer = room.otherPlayerID(socket.id);

        io.to(otherPlayer.id).emit('flip', {
            pos: cardPos
        });

        if(player.flipCounter === 2){

            // alle flip event eruit halen
            io.sockets.emit('clicksOff');

            if(player.flippedColor.AllValuesSame()){
                // goed
                table.pairCorrect++;

                if(table.pairCorrect === 16){
                    // we have a winner

                }

                table.pairsCorrect.push(player.flippedColor);

                for(var b = 0; b < player.flippedColor.length; b++){
                    table.pairsCorrect.push(player.flippedColor[b]);
                }

                io.sockets.emit('logging', {message: player.name + ' paired cards!'});

                setTimeout(function(){

                    player.flipCounter = 0;
                    player.flippedColor = [];

                    // TODO turnStart, clicks activeren

                    io.sockets.emit('flipCardsBack', {flipped: table.pairsCorrect});
                    io.to(player.id).emit('clicksOn');
                    
                },3000);

            }else{
                // fout
                // Huidige speler van beurt wissen
                io.sockets.emit('logging', {message: 'Wrong, flipping cards back after 3 sec.'});

                setTimeout(function(){

                    player.turnFinished = true;
                    player.flipCounter = 0;
                    player.flippedColor = [];

                    io.to(player.id).emit('newTurn', {
                        myturn: false
                    });

                    // beurt naar de andere speler
                    otherPlayer.turnFinished = true;
                    io.to(otherPlayer.id).emit('newTurn', {
                        myturn: true
                    });

                    io.sockets.emit('flipCardsBack', {flipped: table.pairsCorrect});
                    console.log('flipped');

                    io.to(player.id).emit('progressUpdate', {
                        myturn: false
                    });

                    io.to(otherPlayer.id).emit('progressUpdate',{
                        myturn: true
                    });

                },3000);
                // kaarten terug
                

            }

            console.log(room);

        }
        

    });

    socket.on('disconnect', function() {

        // huidige player opzoeken op socket id
        var player = room.getPlayer(socket.id);

        // speler bestaat en zit aan tafel
        if (player && player.status === 'intable') {

            var table = room.getTable(player.tableID);

            table.removePlayer(player);
            table.status = 'available';
            player.status = 'available';

            io.sockets.emit('logging', player.name + 'has left the building');

        }

    });

});


Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.filter = function(fun)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };

Array.prototype.AllValuesSame = function() {

    if (this.length > 0) {
        for (var i = 1; i < this.length; i++) {
            if (this[i] !== this[0])
                return false;
        }
    }
    return true;
}
