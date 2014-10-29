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

                var countdown = 3; //3 seconds in reality...
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
        //var player = room.getPlayer(socket.id);

        console.log(socket.id);

        var table = room.getTable(data.tableID);
        var cardPos = data.pos;
        var flippedColor = data.color;


        /*

            De bugs !! Ontstaan omdat je twee keer de players langs gaat!!!1

        */

        for (var i = 0; i < table.players.length; i++) {

            if(table.players[i].id === socket.id && !table.players[i].turnFinished){

                table.players[i].flippedColor.push(data.color);
                table.players[i].flipCounter++;

                if (table.players[i].flipCounter === 2) {

                    if (table.players[i].flippedColor.AllValuesSame()) {
                        // correct
                        console.log('CORRECTERINO!');

                    }else{
                        // incorrect

                        for (var k = 0; k < table.players.length; k++) {

                            if (table.players[k].id === table.players[i].id) {

                                // huidige speler
                                console.log('not my turn anymore ' + table.players[i].id);

                                table.players[i].turnFinished = true;
                                table.players[i].flipCounter = 0;
                                table.players[i].flippedColor = [];

                                
                                io.to(table.players[i].id).emit('newTurn', {
                                    myturn: false
                                });


                            } else {

                                console.log('its my turn ' + table.players[k].id);

                                table.players[k].turnFinished = false;
                                table.players[k].flipCounter = 0;

                                
                                io.to(table.players[k].id).emit('newTurn', {
                                    myturn: true
                                });


                            }

                        }

                        

                    }

                    io.sockets.emit('flipCardsBack');

                }

            }else{

                if(table.players[i].turnFinished === true){

                    console.log('event flip send on card ' + cardPos + ' to ' + table.players[i].id);

                    io.to(table.players[i].id).emit('flip', {
                        pos: cardPos
                    });

                }
                

            }

            /*
            if (table.players[i].turnFinished) {

                // hier is geen flip op de tegenstander als ht de tweede flip is.

                io.to(table.players[i].id).emit('flip', {
                    pos: cardPos
                });


                console.log('event flip send on card ' + cardPos + ' to ' + table.players[i].id);


            } else {

                table.players[i].flippedColor.push(data.color);

                if (table.players[i].flipCounter === 1) {

                    // check als ze correct, zo ja, dan flipcounter op nul
                    // als ze niet matches, emit new turn, turnfinished op true, andere turn finished op false



                    if (table.players[i].flippedColor.AllValuesSame()) {

                        //table.correctPairs omhoog. Zodat je ook weet hoeveel er correct zijn per tafel

                        table.players[i].correct++;

                        console.log('cards correct, not emitting next turn');

                        table.players[i].flipCounter = 0;
                        table.players[i].flippedColor = [];

                        table.pairCorrect++;

                        console.log(room);

                        io.sockets.emit('flipCardsBack');



                    } else {

                        console.log('cards wrong, emitting next turn');


                        //var remaining = table.players;

                        //console.log(remaining[0].id);


                        //console.log('remaining' + JSON.stringify(table.players));
                        //console.log('this player '+ JSON.stringify(table.players[i]));

                        //setTimeout(function(){

                        //},3000);



                        for (var k = 0; k < table.players.length; k++) {

                            if (table.players[k].id === table.players[i].id) {

                                // huidige speler
                                console.log('not my turn anymore ' + table.players[i].id);

                                table.players[i].turnFinished = true;
                                table.players[i].flipCounter = 0;
                                table.players[i].flippedColor = [];

                                io.to(table.players[i].id).emit('newTurn', {
                                    myturn: false
                                });

                            } else {

                                console.log('its my turn ' + table.players[k].id);

                                table.players[k].turnFinished = false;
                                table.players[k].flipCounter = 0;

                                io.to(table.players[k].id).emit('newTurn', {
                                    myturn: true
                                });

                            }

                        }

                        io.sockets.emit('flipCardsBack');

                        //io.to(table.players[i].id).emit('newTurn',{myturn: false});




                        //io.sockets.emit('flipCardsBack');


                        //console.log(room);
                        // flip all cards back


                    }

                } else {

                    table.players[i].flipCounter++;
                    

                }


            }

        */
        }

        console.log(room);

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


Array.prototype.AllValuesSame = function() {

    if (this.length > 0) {
        for (var i = 1; i < this.length; i++) {
            if (this[i] !== this[0])
                return false;
        }
    }
    return true;
}

Array.prototype.spliced = function() {

    // Returns the array of values deleted from array.
    Array.prototype.splice.apply(this, arguments);

    // Return current (mutated) array array reference.
    return (this);

};