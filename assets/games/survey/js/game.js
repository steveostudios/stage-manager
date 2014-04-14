var init = true;
var question_lookup = [];
var editing = null;
var add_editor_buttons = '<button type="button" class="btn btn-success btn_add_question"><i class="fa fa-plus"> Add Question</i></button>';
var lastKeypressTime = 0;
var keyCount = 0;
var delta = 1000;

// !- Keyboard Shortcuts.
Mousetrap.bind({
    'x 1': function() { display_xes(1); },
    'x 2': function() { display_xes(2); },
    'x 3': function() { display_xes(3); },
    'left': function() { question_prev(); },
    'right': function() { question_next(); },
    '1': function() { reveal_answer('a'); },
    '2': function() { reveal_answer('b'); },
    '3': function() { reveal_answer('c'); },
    '4': function() { reveal_answer('d'); },
    '5': function() { reveal_answer('e'); },
    '6': function() { reveal_answer('f'); },
    '7': function() { reveal_answer('g'); },
    '8': function() { reveal_answer('h'); }
});



// !- Build Questions.
function build_questions() {
	$('ul#list_questions').html('');
	$('#question_selector').html('');
	questions.sort(sortByOrder);
	questions.forEach(function (question, i, arr) {
    question_lookup[question.id] = i;
	});
	if (editing !== null) {
		save_data();
		editing = null;
	}
	for (var key in questions) {
		if (questions.hasOwnProperty(key)) {
			var val = questions[key];
			$('ul#list_questions').append('<li class="list-prize" data-id="'+ val.id +'">'+ val.question +' <div class="list_buttons"><button class="btn btn-default btn-xs btn_edit_question"><i class="fa fa-pencil"></i></button><button class="btn btn-danger btn-xs btn_destroy_question"><i class="fa fa-trash-o"></i></button></div></li>');
			$('#question_selector').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="li_question" data-id="'+ val.id +'">'+ val.question +'</a></li>');
		}
  }
  $('ul#list_questions').sortable({
		axis: 'y',
		disabled: false
  });
  editing = null;
}

// !- Add Question.
$(document).on('click', '.btn_add_question', function(e) {
	e.preventDefault();
	var id = game_settings.next_id;
	editing = id;
	var new_question = {};
	new_question.id = id;
	new_question.question = $('#inp_question').val();
	new_question.answer_a = $('#inp_answer_a').val();
	new_question.answer_b = $('#inp_answer_b').val();
	new_question.answer_c = $('#inp_answer_c').val();
	new_question.answer_d = $('#inp_answer_d').val();
	new_question.answer_e = $('#inp_answer_e').val();
	new_question.answer_f = $('#inp_answer_f').val();
	new_question.answer_g = $('#inp_answer_g').val();
	new_question.answer_h = $('#inp_answer_h').val();
	new_question.poll_a = $('#inp_poll_a').val();
	new_question.poll_b = $('#inp_poll_b').val();
	new_question.poll_c = $('#inp_poll_c').val();
	new_question.poll_d = $('#inp_poll_d').val();
	new_question.poll_e = $('#inp_poll_e').val();
	new_question.poll_f = $('#inp_poll_f').val();
	new_question.poll_g = $('#inp_poll_g').val();
	new_question.poll_h = $('#inp_poll_h').val();
	new_question.order = questions.length;
	//questions.push(new_question);

	socket.put('/survey/add_question/'+ game_id, {new_question: new_question}, function (response) {
    // console.log(response);
  });
	$('#inp_question').val('');
	$('.inp_answer').val('');
	$('.inp_poll').val('');
});

// !- Edit Question.
$(document).on('click', '.btn_edit_question', function(e) {
	e.preventDefault();
	var id = $(this).parent().parent().attr('data-id');
	editing = id;
	$('#inp_question').val(questions[question_lookup[id]].question);
	$('#inp_answer_a').val(questions[question_lookup[id]].answer_a);
	$('#inp_answer_b').val(questions[question_lookup[id]].answer_b);
	$('#inp_answer_c').val(questions[question_lookup[id]].answer_c);
	$('#inp_answer_d').val(questions[question_lookup[id]].answer_d);
	$('#inp_answer_e').val(questions[question_lookup[id]].answer_e);
	$('#inp_answer_f').val(questions[question_lookup[id]].answer_f);
	$('#inp_answer_g').val(questions[question_lookup[id]].answer_g);
	$('#inp_answer_h').val(questions[question_lookup[id]].answer_h);
	$('#inp_poll_a').val(questions[question_lookup[id]].poll_a);
	$('#inp_poll_b').val(questions[question_lookup[id]].poll_b);
	$('#inp_poll_c').val(questions[question_lookup[id]].poll_c);
	$('#inp_poll_d').val(questions[question_lookup[id]].poll_d);
	$('#inp_poll_e').val(questions[question_lookup[id]].poll_e);
	$('#inp_poll_f').val(questions[question_lookup[id]].poll_f);
	$('#inp_poll_g').val(questions[question_lookup[id]].poll_g);
	$('#inp_poll_h').val(questions[question_lookup[id]].poll_h);
	$('#editor_buttons').html('<button type="button" class="btn btn-success btn_edit_question_confirm"><i class="fa fa-check-circle"> Edit Question</i></button><button type="button" id="btn_edit_question" class="btn btn-default btn_edit_question_deny"><i class="fa fa-ban"> Cancel</i></button>');
	$('.btn_edit_question').attr('disabled', 'disabled');
	$('.btn_destroy_question').attr('disabled', 'disabled');
	$('ul#list_questions').sortable({disabled: true});
});

$(document).on('click', '.btn_edit_question_deny', function(e) {
	e.preventDefault();
	build_questions();
	$('#inp_question').val('');
	$('.inp_answer').val('');
	$('.inp_poll').val('');
	$('#editor_buttons').html(add_editor_buttons);
	$('.btn_edit_question').removeAttr('disabled');
	$('.btn_destroy_question').removeAttr('disabled');
});

$(document).on('click', '.btn_edit_question_confirm', function(e) {
	e.preventDefault();
	var id = editing;
	questions[question_lookup[id]].question = $('#inp_question').val();
	questions[question_lookup[id]].answer_a = $('#inp_answer_a').val();
	questions[question_lookup[id]].answer_b = $('#inp_answer_b').val();
	questions[question_lookup[id]].answer_c = $('#inp_answer_c').val();
	questions[question_lookup[id]].answer_d = $('#inp_answer_d').val();
	questions[question_lookup[id]].answer_e = $('#inp_answer_e').val();
	questions[question_lookup[id]].answer_f = $('#inp_answer_f').val();
	questions[question_lookup[id]].answer_g = $('#inp_answer_g').val();
	questions[question_lookup[id]].answer_h = $('#inp_answer_h').val();
	questions[question_lookup[id]].poll_a = $('#inp_poll_a').val();
	questions[question_lookup[id]].poll_b = $('#inp_poll_b').val();
	questions[question_lookup[id]].poll_c = $('#inp_poll_c').val();
	questions[question_lookup[id]].poll_d = $('#inp_poll_d').val();
	questions[question_lookup[id]].poll_e = $('#inp_poll_e').val();
	questions[question_lookup[id]].poll_f = $('#inp_poll_f').val();
	questions[question_lookup[id]].poll_g = $('#inp_poll_g').val();
	questions[question_lookup[id]].poll_h = $('#inp_poll_h').val();
	$('#inp_question').val('');
	$('.inp_answer').val('');
	$('.inp_poll').val('');
	$('#editor_buttons').html(add_editor_buttons);
	build_questions();
});

// !- Destroy Question
$(document).on('click', '.btn_destroy_question', function(e) {
	if (editing === null) {
		e.preventDefault();
		var id = $(this).parent().parent().attr('data-id');
		$(this).parent().parent().html(questions[question_lookup[id]].question +'<div class="list_buttons"><button class="btn btn-success btn-xs btn_destroy_question_confirm"><i class="fa fa-check-circle"></i></button><button class="btn btn-default btn-xs btn_destroy_question_deny"><i class="fa fa-ban"></i></button></i></button><div>');
		editing = id;
		$('ul#list_questions').sortable({disabled: true});
	}
});

$(document).on('click', '.btn_destroy_question_confirm', function(e) {
	if (editing !== null) {
		e.preventDefault();
		var id = question_lookup[editing];
		questions.splice(id, 1);
		questions.forEach(function (question, i) {
			question.order = i+1;
		});
		build_questions();
	}
});

$(document).on('click', '.btn_destroy_question_deny', function(e) {
	if (editing !== null) {
		e.preventDefault();
		$('ul#list_questions').sortable({disabled: false});
		build_questions();
	}
});

// !- Sort Questions
$(document).on('sortstop', 'ul#list_questions', function(event, ui) {
	editing = 'sort';
	var sorted_questions = $('ul#list_questions').sortable('toArray', {attribute: 'data-id'});
	for (i = 0; i < sorted_questions.length; ++i) {
		questions[question_lookup[sorted_questions[i]]].order = i;
	}
	build_questions();
});

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
		//display_current_question();
		set_current_question(next_id);
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
		//display_current_question();
		set_current_question(next_id);
	}
}

// !- Select a Question.
$(document).on('click', '.li_question', function(e) {
	e.preventDefault();
	var id = $(this).attr('data-id');
	game_settings.current_question_id = id;
	//display_current_question();
	set_current_question(id);
});

function set_current_question() {
	var send_id = game_settings.current_question_id;
	socket.get('/survey/change_question/'+ game_id, {
		message: send_id
	}, function (response) {
		var id = response.message;
		display_current_question(id);
	});
}

// !- Display Current Question.
function display_current_question(id) {
	var order = question_lookup[game_settings.current_question_id];
	$('.cover').show();
	$('#question').text(questions[question_lookup[id]].question);
	$('#question').squishy({maxSize:120});
	$('#answer_a').text(questions[question_lookup[id]].answer_a);
	$('#answer_b').text(questions[question_lookup[id]].answer_b);
	$('#answer_c').text(questions[question_lookup[id]].answer_c);
	$('#answer_d').text(questions[question_lookup[id]].answer_d);
	$('#answer_e').text(questions[question_lookup[id]].answer_e);
	$('#answer_f').text(questions[question_lookup[id]].answer_f);
	$('#answer_g').text(questions[question_lookup[id]].answer_g);
	$('#answer_h').text(questions[question_lookup[id]].answer_h);
	$('#poll_a').text(questions[question_lookup[id]].poll_a);
	$('#poll_b').text(questions[question_lookup[id]].poll_b);
	$('#poll_c').text(questions[question_lookup[id]].poll_c);
	$('#poll_d').text(questions[question_lookup[id]].poll_d);
	$('#poll_e').text(questions[question_lookup[id]].poll_e);
	$('#poll_f').text(questions[question_lookup[id]].poll_f);
	$('#poll_g').text(questions[question_lookup[id]].poll_g);
	$('#poll_h').text(questions[question_lookup[id]].poll_h);
	$('.answer').squishy({maxSize: 70});
	$('.poll').squishy({maxSize: 70});
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
	for (var prop in game_results[game_settings.current_question_id]) {
    if (game_results[game_settings.current_question_id].hasOwnProperty(prop)) {
			if(game_results[game_settings.current_question_id][prop] === 1) {
				reveal_answer(prop);
			}
    }
  }
}

// !- Xes.
$(document).on('click', '.btn_xes', function(e) {
	e.preventDefault();
	var count = $(this).attr('data-count');
	display_xes(count);
});

function display_xes(count) {
	if($('.x_overlay').length === 0) {
		var xes = '';
		for (var i=0; i<count; i++) {
			xes += '<img src="/games/survey/img/x.png"/>';
		}
		$('body').append('<div class="x_overlay">'+ xes +'</div>');
		setTimeout(function(){
			$('.x_overlay').fadeOut(1000, function() {
				$(this).remove();
			});
		},2000);
	}
}

// !- Reveal Answer.
$(document).on('click', '.cover', function(e) {
	e.preventDefault();
	var answer = $(this).attr('data-id');
	// reveal_answer(answer);
	set_reveal_answer(answer);
});

function set_reveal_answer(answer) {
	socket.put('/survey/reveal_answer/'+ game_id, {'question': game_settings.current_question_id, 'answer': answer});
}

function reveal_answer(answer) {
	$('.cover_'+ answer).fadeOut();
}

// !- Clear results.
$(document).on('click', '#btn_question_clear', function(e) {
	socket.put('/survey/clear_answers/'+ game_id, {'question': game_settings.current_question_id});
});

// !- Document Ready
$(document).ready(function() {
	build_questions();
	$('#editor_buttons').html(add_editor_buttons);
	display_current_question(game_settings.current_question_id);
});

// !- Remote control
socket.on('message', function (data) {
	if(data['data'].status == 'reveal_answer') {
		// !- Reveal answer.
		game_results = data['data'].new_results;
		for (var prop in game_results[game_settings.current_question_id]) {
      if (game_results[game_settings.current_question_id].hasOwnProperty(prop)) {
				if(game_results[game_settings.current_question_id][prop] === 1) {
					reveal_answer(prop);
				}
      }
    }
	} else if(data['data'].status == 'change_question') {
		// !- Change Question.
		game_settings.current_question_id = data['data'].question_id;
		display_current_question(game_settings.current_question_id);
	} else if(data['data'].status == 'clear_answers') {
		// !- Clear Answers.
		game_results = data['data'].new_results;
		$('.cover').show();
	} else if(data['data'].status == 'display_xes') {
		// !- Display Xes.
		console.log(data['data']);
		display_xes(data['data'].xes);
	} else if(data['data'].status == 'add_question') {
		// !- Add Question.
		game_data = data['data'].game.data;
		game_results = data['data'].game.results;
		game_settings = data['data'].game.settings;
		questions = data['data'].game.data.questions;
		build_questions();
	}
});