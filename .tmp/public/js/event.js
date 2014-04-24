var editing = null;
var segment_lookup = [];
var default_li_options = '<i class="fa fa-pencil btn_segment_edit"></i><i class="fa fa-trash-o btn_segment_remove"></i><i class="fa fa-bars"></i>';

function build_segments() {
	//var event_segments
	event_segments.sort(sortByOrder);
	event_segments.forEach(function (segment, i, arr) {
   segment_lookup[segment.id] = i;
	});
	$('#list_segments').html('');
	for (var key in event_segments) {
		if(event_segments.hasOwnProperty(key)){
			var segment = event_segments[key];
			$('#list_segments').append('<li data-id="'+ segment['id'] +'"><div class="segment_type"><i class="fa fa-'+ segment['type'] +'"></i></div><div class="segment_name">'+ segment['name'] +'</div><div class="segment_time" data-time="'+ segment['time'] +'">'+ to_readable_time(segment['time']) +'</div><div class="li_options">'+ default_li_options +'</div></li>');
		}
	}
	$('#list_segments li[data-id="'+ event_settings.current_segment_id +'"]').addClass('highlight');
	$('#list_segments').sortable({
		axis: 'y',
		handle: '.li_options i.fa-bars',
		disabled: false
  });
  editing = null;
}


// !- Changing Segments.
$(document).on('click', '#list_segments li', function(e) {
	e.preventDefault();
	if(editing === null) {
		var new_segment_id = $(this).data('id');
		set_current_segment(new_segment_id);
	}
});

function set_current_segment(new_segment_id) {
	socket.get('/event/current_segment/'+ event_id, {
		new_segment_id: new_segment_id
	}, function (response) {
		// console.log(response);
	});
}

function update_current_segment() {
	$('#list_segments li').removeClass('highlight');
	$('#list_segments li[data-id="'+ event_settings.current_segment_id +'"]').addClass('highlight');
}

// !- Adding Segment.
$(document).on('click', '#btn_addSegment', function(e) {
	e.preventDefault();
	if(editing === null) {
		editing = event_settings.next_new_segment_id;
		$('#list_segments').append('<li class="segment_add" data-id="'+ editing +'"><div class="segment_type"><i class="fa fa-film"></i></div><div class="segment_name"><input class="segment_name_edit" type="text" placeholder="Name" /></div><div class="segment_time" data-time=""><input class="segment_time_edit" type="text" placeholder="5:00" /></div><div class="li_options"><i id="btn_segment_add_confirm" class="fa fa-check-circle-o"></i><i id="btn_segment_add_cancel" class="fa fa-times-circle-o"></i></div></li>');
	}
});

$(document).on('click', '#btn_segment_add_cancel', function(e) {
	e.preventDefault();
	$(this).parent().parent().remove();
	editing = null;
});

$(document).on('click', '#btn_segment_add_confirm', function(e) {
	e.preventDefault();
	var new_segment = {};
	new_segment.id = event_settings.next_new_segment_id;
	new_segment.name = $(this).parent().parent().find('.segment_name input.segment_name_edit').val();
	new_segment.time = parseInt($(this).parent().parent().find('.segment_time input.segment_time_edit').val(), 10);
	new_segment.type = 'microphone';
	new_segment.order = event_segments.length + 1;

	socket.get('/event/add_segment/'+ event_id, {
		new_segment: new_segment
	}, function (response) {
    // console.log(response);
  });

	editing = null; // move to build
});

// !- Reorder Segments.
$(document).on('sortstop', '#list_segments', function(event, ui) {
	editing = 'sort';
	var sorted_segments = $('#list_segments').sortable('toArray', {attribute: 'data-id'});
	for (i = 0; i < sorted_segments.length; ++i) {
		event_segments[segment_lookup[sorted_segments[i]]].order = i;
	}

	socket.get('/event/reorder_segments/'+ event_id, {
		reordered_segment_id_array: sorted_segments
	}, function (response) {
    // console.log(response);
  });
});

// !- Document Ready
$(document).ready(function() {
	build_segments();
	$('#preview #time').html(currentTime());

	// Happens every second.
	setInterval(function() {
		$('#preview #time').html(currentTime());
	}, 1000 );
});

// !- Edit Segment.
$(document).on('click', '.btn_segment_edit', function(e) {
	e.preventDefault();
	if(editing === null) {
		editing = $(this).parent().parent().attr('data-id');
		$(this).parent().parent().find('.segment_name').html('<input class="segment_name_edit" type="text" placeholder="Name" value="'+ event_segments[segment_lookup[editing]].name +'" />');
		$(this).parent().parent().find('.segment_time').html('<input class="segment_name_edit" type="text" placeholder="Name" value="'+ to_readable_time(event_segments[segment_lookup[editing]].time) +'" />');
		$(this).parent().html('<i id="btn_segment_edit_confirm" class="fa fa-check-circle-o"></i><i id="btn_segment_edit_cancel" class="fa fa-times-circle-o"></i>');
	}
});

$(document).on('click', '#btn_segment_edit_cancel', function(e) {
	e.preventDefault();
	$(this).parent().parent().find('.segment_name').html(event_segments[segment_lookup[editing]].name);
	$(this).parent().parent().find('.segment_time').html(to_readable_time(event_segments[segment_lookup[editing]].time));
	$(this).parent().html(default_li_options);
	editing = null;
});

$(document).on('click', '#btn_segment_edit_confirm', function(e) {
	e.preventDefault();
	var edit_segment = {};
	edit_segment.id = editing;
	edit_segment.name = $(this).parent().parent().find('.segment_name input.segment_name_edit').val();
	edit_segment.time = parseInt($(this).parent().parent().find('.segment_time input.segment_time_edit').val(), 10);
	edit_segment.type = 'microphone';
	edit_segment.order = event_segments[segment_lookup[editing]].order;
	
	socket.get('/event/edit_segment/'+ event_id, {
		edit_segment: edit_segment
	}, function (response) {
    // console.log(response);
  });

	editing = null; // move to build
});


// !- Remove Segment.
$(document).on('click', '.btn_segment_remove', function(e) {
	e.preventDefault();
	if(editing === null) {
		editing = $(this).parent().parent().attr('data-id');
		$(this).parent().html('<i id="btn_segment_remove_confirm" class="fa fa-check-circle-o"></i><i id="btn_segment_remove_cancel" class="fa fa-times-circle-o"></i>');
	}
});

$(document).on('click', '#btn_segment_remove_cancel', function(e) {
	e.preventDefault();
	$(this).parent().html(default_li_options);
	editing = null;
});

$(document).on('click', '#btn_segment_remove_confirm', function(e) {
	e.preventDefault();
	var remove_segment_id = editing;
	
	socket.get('/event/remove_segment/'+ event_id, {
		remove_segment_id: remove_segment_id
	}, function (response) {
    // console.log(response);
  });

	editing = null; // move to build
});

// !- Remote control
socket.on('message', function (data) {
	var res = data['data'];
	if(res.status == 'current_segment') {
		event_settings = res.settings;
		update_current_segment();
	} else if(res.status == 'add_segment') {
		event_segments = res.event.segments.segments;
		event_settings = res.event.settings;
		build_segments();
	} else if(res.status == 'reorder_segments') {
		event_segments = res.event.segments.segments;
		event_settings = res.event.settings;
		build_segments();
	} else if(res.status == 'edit_segment') {
		event_segments = res.event.segments.segments;
		event_settings = res.event.settings;
		build_segments();
	} else if(res.status == 'remove_segment') {
		event_segments = res.event.segments.segments;
		event_settings = res.event.settings;
		build_segments();
	}
});