function Player(playerID){
	this.id = playerID;
	this.name = '';
	this.tableID = '';
	this.correct = '';
	this.status = 'available';
	this.turnFinished = '';
	this.flipCounter = 0;
}

Player.prototype.setName = function(name){

	this.name = name;

	console.log('name set' + this.name);

}

Player.prototype.getName = function(){

	return this.name;

}

Player.prototype.removePlayer = function(playerID){

}

Player.prototype.setStatus = function(status){

	this.status = status;

}

Player.prototype.flipCounter = function(){

	if(this.flipCounter <= 2){

		this.turnFinished = false;

	}else{
		this.turnFinished = true;
	}

}

Player.prototype.addToFlipCounter = function(){

	return this.flipCounter++;

}

module.exports = Player;