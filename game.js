function Game(){
	this.pack = this.makeDeck();

}

Game.prototype.makeDeck = function(){
	var aantal = 16;
	var colors = ['AliceBlue','AntiqueWhite','Aqua','Aquamarine','Blue','CornflowerBlue','Cyan','DarkBlue','DarkOrange','DarkViolet','FireBrick','ForestGreen','Gold','Green','GreenYellow','HotPink'];


	var deck = this.shuffleColors(colors);

	var deck1 = deck;
	var deck2 = deck;

	finalDeck = this.shuffleColors( deck1.concat(deck2) );

	return finalDeck;

	//console.log( Object.keys(finalDeck) );
	//console.log(finalDeck);

	//for(var i = 0; i <= aantal/2; i++){

		//this.makeCard( colors[Math.floor(Math.random()*colors.length)] );

		// 2 arrays met dezelfde kleuren, kleuren mogen niet twee keer voorkomen.
		// de 2 arrays samen voegen met concat.
	//}
}

Game.prototype.shuffleColors = function(color){

	var i = color.length;

	if ( i == 0 ) return false;

	while ( --i ) {
		var j = Math.floor( Math.random() * ( i + 1 ) );
		var tempi = color[i];
		var tempj = color[j];
		color[i] = tempj;
		color[j] = tempi;
	}

	return color;
}

module.exports = Game;