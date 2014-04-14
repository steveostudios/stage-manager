var init = true;
var question_lookup = [];
var editing = null;
var add_editor_buttons = '<button type="button" class="btn btn-success btn_add_question"><i class="fa fa-plus"> Add Question</i></button>';

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
			$('ul#list_questions').append('<li class="list-prize" data-id="'+ val.id +'">'+ val.id +': '+ val.question +' <button class="btn btn-default btn-xs btn_edit_question"><i class="fa fa-pencil"></i></button><button class="btn btn-danger btn-xs btn_destroy_question"><i class="fa fa-trash-o"></i></button></li>');
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
	new_question.order = questions.length;
	//questions.push(new_question);

	socket.put('/poll/add_question/'+ game_id, {new_question: new_question}, function (response) {
    // console.log(response);
  });
	$('#inp_question').val('');
	$('#inp_answer_a').val('');
	$('#inp_answer_b').val('');
	$('#inp_answer_c').val('');
	$('#inp_answer_d').val('');
});

// !- Edit Question.
$(document).on('click', '.btn_edit_question', function(e) {
	e.preventDefault();
	var id = $(this).parent().attr('data-id');
	editing = id;
	$('#inp_question').val(questions[question_lookup[id]].question);
	$('#inp_answer_a').val(questions[question_lookup[id]].answer_a);
	$('#inp_answer_b').val(questions[question_lookup[id]].answer_b);
	$('#inp_answer_c').val(questions[question_lookup[id]].answer_c);
	$('#inp_answer_d').val(questions[question_lookup[id]].answer_d);
	$('#editor_buttons').html('<button type="button" class="btn btn-success btn_edit_question_confirm"><i class="fa fa-check-circle"> Edit Question</i></button><button type="button" id="btn_edit_question" class="btn btn-default btn_edit_question_deny"><i class="fa fa-ban"> Cancel</i></button>');
	$('.btn_edit_question').attr('disabled', 'disabled');
	$('.btn_destroy_question').attr('disabled', 'disabled');
	$('ul#list_questions').sortable({disabled: true});
});

$(document).on('click', '.btn_edit_question_deny', function(e) {
	e.preventDefault();
	$('#inp_question').val('');
	$('#inp_answer_a').val('');
	$('#inp_answer_b').val('');
	$('#inp_answer_c').val('');
	$('#inp_answer_d').val('');
	$('#editor_buttons').html(add_editor_buttons);
	$('.btn_edit_question').removeAttr('disabled');
	$('.btn_destroy_question').removeAttr('disabled');
	$('ul#list_questions').sortable({disabled: false});
});

$(document).on('click', '.btn_edit_question_confirm', function(e) {
	e.preventDefault();
	var id = editing;
	questions[question_lookup[id]].question = $('#inp_question').val();
	questions[question_lookup[id]].answer_a = $('#inp_answer_a').val();
	questions[question_lookup[id]].answer_b = $('#inp_answer_b').val();
	questions[question_lookup[id]].answer_c = $('#inp_answer_c').val();
	questions[question_lookup[id]].answer_d = $('#inp_answer_d').val();
	$('#inp_question').val('');
	$('#inp_answer_a').val('');
	$('#inp_answer_b').val('');
	$('#inp_answer_c').val('');
	$('#inp_answer_d').val('');
	$('#editor_buttons').html(add_editor_buttons);
	build_questions();
});

// !- Destroy Question
$(document).on('click', '.btn_destroy_question', function(e) {
	if (editing === null) {
		e.preventDefault();
		var id = $(this).parent().attr('data-id');
		$(this).parent().html(questions[question_lookup[id]].question +'<button class="btn btn-success btn-xs btn_destroy_question_confirm"><i class="fa fa-check-circle"></i></button><button class="btn btn-default btn-xs btn_destroy_question_deny"><i class="fa fa-ban"></i></button></i></button>');
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
	var order = question_lookup[game_settings.current_question_id];
	if (order > 0) {
		var current_id = question_lookup[game_settings.current_question_id];
		var next_id = question_lookup.indexOf(current_id - 1);
		game_settings.current_question_id = next_id;
		display_current_poll();
	}
});

// !- Next Question.
$(document).on('click', '#btn_question_next', function(e) {
	e.preventDefault();
	var order = question_lookup[game_settings.current_question_id];
	if (order < (questions.length - 1)) {
		var current_id = question_lookup[game_settings.current_question_id];
		var next_id = question_lookup.indexOf(current_id + 1);
		game_settings.current_question_id = next_id;
		display_current_poll();
	}
});

// !- Select a Question.
$(document).on('click', '.li_question', function(e) {
	e.preventDefault();
	var id = $(this).attr('data-id');
	game_settings.current_question_id = id;
	display_current_poll();
});

// !- Display Current Poll
function display_current_poll () {
	if (init === true) {
		init = false;
	} else {
		save_settings();
	}
	
	var send_id = game_settings.current_question_id;
	socket.get('/poll/change_question/'+ game_id, {
		message: send_id
	}, function (response) {
		var id = response.message;
		var order = question_lookup[game_settings.current_question_id];
		
		$('#question').text(questions[question_lookup[id]].question);
		$('#question').squishy({maxSize:120});
		$('#answer_a .answer').text(questions[question_lookup[id]].answer_a);
		$('#answer_b .answer').text(questions[question_lookup[id]].answer_b);
		$('#answer_c .answer').text(questions[question_lookup[id]].answer_c);
		$('#answer_d .answer').text(questions[question_lookup[id]].answer_d);
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
		if (typeof game_results[id] != "undefined") {
			results_draw();
			$('#result_a').text(game_results[id].a);
			$('#result_b').text(game_results[id].b);
			$('#result_c').text(game_results[id].c);
			$('#result_d').text(game_results[id].d);
		} else {
			$('#result_a').text(0);
			$('#result_b').text(0);
			$('#result_c').text(0);
			$('#result_d').text(0);
		}
	});
}

function results_draw() {
	var data = game_results[0];
	var maxProp = null;
	var maxValue = -1;
	for (var prop in data) {
		if (data.hasOwnProperty(prop)) {
			var value = data[prop];
			if (value > maxValue) {
				maxProp = prop;
				maxValue = value;
			}
		}
	}

	var anim_dur = 500;
	
	$('#answer_a .quantity').text(game_results[game_settings.current_question_id].a);
	var new_a = (game_results[game_settings.current_question_id].a / maxValue) * 100;
	$('ul#answers li#answer_a .percent').animate({
		'width': new_a +'%'
	}, anim_dur);
	
	$('#answer_b .quantity').text(game_results[game_settings.current_question_id].b);
	var new_b = (game_results[game_settings.current_question_id].b / maxValue) * 100;
	$('ul#answers li#answer_b .percent').animate({
		'width': new_b +'%'
	}, anim_dur);
	
	$('#answer_c .quantity').text(game_results[game_settings.current_question_id].c);
	var new_c = (game_results[game_settings.current_question_id].c / maxValue) * 100;
	$('ul#answers li#answer_c .percent').animate({
		'width': new_c +'%'
	}, anim_dur);
	
	$('#answer_d .quantity').text(game_results[game_settings.current_question_id].d);
	var new_d = (game_results[game_settings.current_question_id].d / maxValue) * 100;
	$('ul#answers li#answer_d .percent').animate({
		'width': new_d +'%'
	}, anim_dur);
}

// !- Clear results.
$(document).on('click', '#btn_question_clear', function(e) {
	console.log('clear');
	socket.put('/poll/clear_results/'+ game_id, {question: game_settings.current_question_id}, function (response) {
    console.log(response);
    game_results = response.results;
    results_draw();
  });
});

// !- Document Ready
$(document).ready(function() {
	build_questions();
	$('#editor_buttons').html(add_editor_buttons);
	display_current_poll();
});

// !- Remote control
socket.on('message', function (data) {
	if(data['data'].status == 'vote') {
		// !- Vote.
		var id = game_settings.current_question_id;
		console.log(data['data']['new_results'][id]['a']);
		game_results[id].a = data['data']['new_results'][id]['a'];
		game_results[id].b = data['data']['new_results'][id]['b'];
		game_results[id].c = data['data']['new_results'][id]['c'];
		game_results[id].d = data['data']['new_results'][id]['d'];

		$('#result_a').text(game_results[id].a);
		$('#result_b').text(game_results[id].b);
		$('#result_c').text(game_results[id].c);
		$('#result_d').text(game_results[id].d);
		results_draw();
	} else if(data['data'].status == 'add_question') {
		// !- Add Question.
		game_data = data['data'].game.data;
		game_results = data['data'].game.results;
		game_settings = data['data'].game.settings;
		questions = data['data'].game.data.questions;
		build_questions();
	}
});
