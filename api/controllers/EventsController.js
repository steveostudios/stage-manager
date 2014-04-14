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
	}

};