function makeDeck() {

	var aantal = 16;

	for(var i = 0; i <= aantal; i++){
		makeCard();
	}
}

function makeCard() {

	//console.log('card created');
}

exports.makeDeck = makeDeck;
exports.makeCard = makeCard;