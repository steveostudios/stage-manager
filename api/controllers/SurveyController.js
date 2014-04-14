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
			var new_results = {a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0};
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
		Games.publishUpdate( id, {
			status: 'change_question',
			question_id: param
    });
    Games.findOne(id).done(function(err, game) {
			game.settings.current_question_id = param;
			game.save(function(error) {
				// console.log(error);
			});
    });
    res.json({
      success: true,
      message: param
    });
	},

	reveal_answer: function (req, res) {
		var id = req.param('id');
		var results;
		var question = req.param('question');
		var answer = req.param('answer');
		Games.findOne(id).done(function(err, game) {
			game.results[question][answer] = 1;
			game.save(function(error) {
        //console.log(error);
      });
      Games.publishUpdate( id, {
				status: 'reveal_answer',
				new_results: game.results
			});
			var param = req.param('message');
		});
	},

	display_xes: function (req, res) {
		id = req.param('id');
		var xes = req.param('xes');
		Games.publishUpdate( id, {
			status: 'display_xes',
			xes: xes
    });
    res.json({
      success: true,
      message: param
    });
	},

	clear_answers: function (req, res) {
		var id = req.param('id');
		var question = req.param('question');
		Games.findOne(id).done(function(err, game) {
			game.results[question]['a'] = 0;
			game.results[question]['b'] = 0;
			game.results[question]['c'] = 0;
			game.results[question]['d'] = 0;
			game.results[question]['e'] = 0;
			game.results[question]['f'] = 0;
			game.results[question]['g'] = 0;
			game.results[question]['h'] = 0;
			game.save(function(error) {
				//console.log(error);
				//game_results = game.results;
			});
			Games.publishUpdate( id, {
				status: 'clear_answers',
				new_results: game.results
			});
			// res.json({
			// 	success: true,
			// 	question_id: question,
			// 	results: game.results
			// });
		});
		
	}

};