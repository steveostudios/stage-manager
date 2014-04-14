/**
 * Poll
 *
 * @module		:: Controller
 * @description	:: Logic for Poll game.
 */

module.exports = {

	add_question: function (req, res) {
		id = req.param('id');
		new_question = req.param('new_question');
		Games.findOne(id).done(function(err, game) {
			var new_id = new_question.id;
			var new_results = {a:0,b:0,c:0,d:0};
			game.data.questions.push(new_question);
			game.results[new_id] = new_results;
			new_id++;
			game.settings.next_id = new_id;
			game.save(function(error) {
				// console.log(error);
			});

			Games.publishUpdate( id, {
				status: 'add_question',
				game: game
			});
		});
	},

	change_question: function (req, res) {
		id = req.param('id');
		var param = req.param('message');
		//question_id = req.param('question_id');
		Games.publishUpdate( id, {
			status: 'change_question',
			question_id: param
    });
    res.json({
      success: true,
      message: param
    });
	},

	vote: function (req, res) {
		var id = req.param('id');
		var results;
		var question = req.param('question');
		var answer = req.param('answer');
		Games.findOne(id).done(function(err, game) {
			game.results[question][answer] = game.results[question][answer] + 1;
			game.save(function(error) {
        //console.log(error);
      });
      Games.publishUpdate( id, {
				status: 'vote',
				new_results: game.results
			});
			var param = req.param('message');
		});
	},

	clear_results: function (req, res) {
		var id = req.param('id');
		var question = req.param('question');
		Games.findOne(id).done(function(err, game) {
			game.results[question]['a'] = 0;
			game.results[question]['b'] = 0;
			game.results[question]['c'] = 0;
			game.results[question]['d'] = 0;
			game.save(function(error) {
				console.log(error);
				game_results = game.results;
			});
			res.json({
				success: true,
				question_id: question,
				results: game.results
			});
		});
		
	}

};