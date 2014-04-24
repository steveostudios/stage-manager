var question_lookup = [];
socket.get('/subscribe/'+ game_id, function gotResponse () {
  // we don’t really care about the response
});

// !- Reveal answer.
$('.btn_reveal_answer').on('click', function(e) {
	e.preventDefault();
	var question = 0;
	var answer = $(this).attr('data-answer');
	socket.put('/survey/reveal_answer/'+ game_id, {'question': game_settings.current_question_id, 'answer': answer});
});

// !- Display current question.
function display_current_question() {
	questions.sort(sortByOrder);
	questions.forEach(function (question, i, arr) {
		question_lookup[question.id] = i;
	});
	var current_question = questions[question_lookup[game_settings.current_question_id]];
	var order = question_lookup[game_settings.current_question_id];
	$('#question').text(current_question.question);
	$('#btn_answer_a').html('<span class="btn_left">1</span><span class="btn_center">'+ current_question.answer_a +'</span><span class="btn_right">'+ current_question.poll_a +'</span>');
	$('#btn_answer_b').html('<span class="btn_left">2</span><span class="btn_center">'+ current_question.answer_b +'</span><span class="btn_right">'+ current_question.poll_b +'</span>');
	$('#btn_answer_c').html('<span class="btn_left">3</span><span class="btn_center">'+ current_question.answer_c +'</span><span class="btn_right">'+ current_question.poll_c +'</span>');
	$('#btn_answer_d').html('<span class="btn_left">4</span><span class="btn_center">'+ current_question.answer_d +'</span><span class="btn_right">'+ current_question.poll_d +'</span>');
	$('#btn_answer_e').html('<span class="btn_left">5</span><span class="btn_center">'+ current_question.answer_e +'</span><span class="btn_right">'+ current_question.poll_e +'</span>');
	$('#btn_answer_f').html('<span class="btn_left">6</span><span class="btn_center">'+ current_question.answer_f +'</span><span class="btn_right">'+ current_question.poll_f +'</span>');
	$('#btn_answer_g').html('<span class="btn_left">7</span><span class="btn_center">'+ current_question.answer_g +'</span><span class="btn_right">'+ current_question.poll_g +'</span>');
	$('#btn_answer_h').html('<span class="btn_left">8</span><span class="btn_center">'+ current_question.answer_h +'</span><span class="btn_right">'+ current_question.poll_h +'</span>');
	if(game_results[game_settings.current_question_id].a === 1) {
		$('#btn_answer_a').addClass('btn-success');
	} else {
		$('#btn_answer_a').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].b === 1) {
		$('#btn_answer_b').addClass('btn-success');
	} else {
		$('#btn_answer_b').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].c === 1) {
		$('#btn_answer_c').addClass('btn-success');
	} else {
		$('#btn_answer_c').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].d === 1) {
		$('#btn_answer_d').addClass('btn-success');
	} else {
		$('#btn_answer_d').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].e === 1) {
		$('#btn_answer_e').addClass('btn-success');
	} else {
		$('#btn_answer_e').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].f === 1) {
		$('#btn_answer_f').addClass('btn-success');
	} else {
		$('#btn_answer_f').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].g === 1) {
		$('#btn_answer_g').addClass('btn-success');
	} else {
		$('#btn_answer_g').removeClass('btn-success');
	}
	if(game_results[game_settings.current_question_id].h === 1) {
		$('#btn_answer_h').addClass('btn-success');
	} else {
		$('#btn_answer_h').removeClass('btn-success');
	}
	$('#lbl_pagination').text((order + 1) +' of '+ questions.length);
	// !- disable previous if at the start.
	if (order <= 0) {
		$('#btn_question_prev').attr('disabled', 'disabled');
	} else {
		$('#btn_question_prev').removeAttr('disabled');
	}
	// !- disable next if at the end.
	if ((order + 1) >= questions.length) {
		$('#btn_question_next').attr('disabled', 'disabled');
	} else {
		$('#btn_question_next').removeAttr('disabled');
	}
}

// !- Previous Question.
$(document).on('click', '#btn_question_prev', function(e) {
	e.preventDefault();
	question_prev();
});

function question_prev() {
	var order = question_lookup[game_settings.current_question_id];
	if (order > 0) {
		var current_id = question_lookup[game_settings.current_question_id];
		var next_id = question_lookup.indexOf(current_id - 1);
		game_settings.current_question_id = next_id;
		var send_id = game_settings.current_question_id;
		socket.get('/survey/change_question/'+ game_id, {
			message: send_id
		}, function (response) {

		});
	}
}

// !- Next Question.
$(document).on('click', '#btn_question_next', function(e) {
	e.preventDefault();
	question_next();
});

function question_next() {
	var order = question_lookup[game_settings.current_question_id];
	if (order < (questions.length - 1)) {
		var current_id = question_lookup[game_settings.current_question_id];
		var next_id = question_lookup.indexOf(current_id + 1);
		game_settings.current_question_id = next_id;
		var send_id = game_settings.current_question_id;
		socket.get('/survey/change_question/'+ game_id, {
			message: send_id
		}, function (response) {

		});
	}
}

$(document).on('click', '#btn_question_clear', function(e) {
	e.preventDefault();
	socket.put('/survey/clear_answers/'+ game_id, {'question': game_settings.current_question_id});
});

// !- Display Xes.
$(document).on('click', '.btn_xes', function(e) {
	e.preventDefault();
	var count = $(this).attr('data-count');
	socket.put('/survey/display_xes/'+ game_id, {'xes': count});
});

// !- Remote Control.
socket.on('message', function (data) {
	if(data['data'].status == 'reveal_answer') {
		game_results = data['data'].new_results;
		display_current_question();
	} else if(data['data'].status == 'change_question') {
		game_settings.current_question_id = data['data'].question_id;
		display_current_question();
	} else if(data['data'].status == 'clear_answers') {
		game_results = data['data'].new_results;
		display_current_question();
	}
});

// !- Document Ready
$(document).ready(function() {
	display_current_question();
});