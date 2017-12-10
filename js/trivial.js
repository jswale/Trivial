var Colors = {
	VERT : "#33ae31",
	VIOLET : "#e46fc5",
	JAUNE : "#fae750",
	ORANGE : "#f87709",
	MARRON : "#b26d2c",
	BLEU : "#6d69e8",
	BLANC : "#FFFFFF",
	ROUGE : "#B22222"
};

function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

var Trivial = {

	I18n : {
		locale : 'en',
		locales : {
			'fr' : {
				gameChoice : "Choix du plateau de jeu",
				cardPick : "Piocher une nouvelle carte",
				question : "Question",
				showAnswer : "Montrer la réponse"			
			},
			'en' : {
				gameChoice : "Game mode",
				cardPick : "Pick a new card",
				question : "Question",
				showAnswer : "Show the answer"			
			}
		},
		get : function(key) {
			return this.locales[this.locale][key];
		},
		init : function() {
			var detected = navigator.language.substring(0,2);
			if(typeof this.locales[detected] != "undefined") {
				this.locale = detected;
			}
		}
	},

	Game : {
		data : {},
		add : function(id, entry) {
			this.data[id] = entry;
		},
		get : function(id) {
			return this.data[id];
		},
		list : function() {
			return this.data;
		},
		getKeys : function() {
			return Object.keys(this.data);
		}
	},

	Theme : {
		data : {},
		state : {},
		add : function(id, entry) {
			this.data[id] = entry;
		},
		get : function(id) {
			return this.data[id];
		},
		init : function() {
			$.each(this.data, $.proxy(function(code, theme) {				
				var state = {
					current : -1
				};
				
				var random = [];
				for(i = 0; i < theme.cards.length; i++) {
					random.push(i);
				}
				state.random = shuffle(random);
				this.state[code] = state;
			}, this));
		},
		getNextCard : function(id) {
			var cards = this.get(id).cards;
			var state = this.state[id];
			var rndId = ++state.current;
			if(rndId >= cards.length) {
				rndId = 0;
				state.current = -1;
			}
			var cardId = state.random[rndId];
			var card = cards[cardId];
			return {
				id : cardId,
				card : card
			};
		}
	},	

	// Main
	init : function() {
		this.I18n.init();

		var gameKeys = Trivial.Game.getKeys();
		if(1 == gameKeys.length) {
			this.launch(Trivial.Game.get(gameKeys[0]));
		} else {
			$(".board")
			.append(
				$("<div/>")
				.addClass("choice")
				.append(Trivial.I18n.get('gameChoice') + " ")
				.append(
					$("<select/>")
					.append(
						$("<option/>").attr("value", "-1"),
						$.map(Trivial.Game.list(), function(game, id) {
							return $("<option>").attr("value", id).text(game.name);
						})
					)
					.change($.proxy(function(event) {
						var ctn = $(event.target);
						var id = ctn.val();
						if(-1 == id) {
							$(".game").remove();
						} else {
							this.launch(Trivial.Game.get(id));
						}
					}, this))					
				)
			)
		}
		$(".waiting").hide();
	},

	launch : function(game) {
		Trivial.Theme.init();
		$(".game").remove();
		$(".board")
		.append(
			$("<div/>")
			.addClass("game")
			.append(
				$("<div/>")
				.addClass("title")
				.append(
					$("<span/>")
					.addClass("game-name")
					.text(game.name)
				)
			)
			.append(
				$("<div/>")
				.addClass("categories")
				.append(
					$.map(game.categories, function(category, id) {
						var theme = Trivial.Theme.get(category.theme);
						return $("<div/>")
						.addClass("category")
						.attr("title", Trivial.I18n.get('cardPick'))
						.append(
							$("<div/>")
							.addClass("buzzer")
							.css("background-color", category.color)
						)				
						.append(
							$("<div/>")
							.addClass("name")
							.text(theme.name)
						)
						.click(function(event) {
							var ctn = $(event.target);
							$(".category.selected").removeClass("selected");
							ctn.parents(".category").addClass("selected");
							var cardInfo = Trivial.Theme.getNextCard(category.theme);
							var card = cardInfo.card;
							$(".card")
							.empty()
							.show()
							.css("border-color", category.color)
							.append(								
								$("<div/>")
								.addClass("question")
								.append(
									$("<div/>")
									.addClass("cardNo")
									.text(Trivial.I18n.get('question') + " " + (cardInfo.id+1) + " :")
								)
								.append($("<div/>").append( $.map($.isArray(card.q) ? card.q : [card.q], function(q){return $("<div/>").html(q); })))
							)
							.append(
								$("<div/>")
								.addClass("answer")
								.click(function(){
									$(".card .spoiler").hide();
									$(".card .good-answer").show();
								})
								.append(
									$("<div/>")
									.addClass("spoiler")
									.text(Trivial.I18n.get('showAnswer'))
								)
								.append(
									$("<div/>")
									.addClass("good-answer")
									.hide()
									.append($("<div/>").append( $.map($.isArray(card.r) ? card.r : [card.r], function(r){return $("<div/>").html(r); })))
								)
							)
						})				
					})
				)
			)
			.append(
				$("<div/>")
				.addClass("card")
			)
		);
	}
};