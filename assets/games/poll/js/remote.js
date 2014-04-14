  var question_lookup = [];
	socket.get('/subscribe/'+ game_id, function gotResponse () {
    // we don’t really care about the response
  });

  // !- Vote button.
  $('.btn_vote').on('click', function(e) {
		e.preventDefault();
		var question = 0;
		var answer = $(this).attr('data-answer');
		socket.put('/poll/vote/'+ game_id, {'question': game_settings.current_question_id, 'answer': answer});
	});

	function sortByOrder(x,y) {
		return x.order - y.order;
	}

	function display_current_poll() {
		questions.sort(sortByOrder);
		questions.forEach(function (question, i, arr) {
			question_lookup[question.id] = i;
		});
		var current_question = questions[question_lookup[game_settings.current_question_id]];
		$('#question').text(current_question.question);
		$('#btn_answer_a').text(current_question.answer_a);
		$('#btn_answer_b').text(current_question.answer_b);
		$('#btn_answer_c').text(current_question.answer_c);
		$('#btn_answer_d').text(current_question.answer_d);
	}

  socket.on('message', function (data) {
		if(data['data'].status == 'vote') {

		} else if(data['data'].status == 'change_question') {
			game_settings.current_question_id = data['data'].question_id;
			display_current_poll();
		}
	});

  // !- Document Ready
	$(document).ready(function() {
		display_current_poll();
	});