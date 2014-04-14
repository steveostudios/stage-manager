var editing = null;
var segment_lookup = [];

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
			console.log(segment['type']);
			$('#list_segments').append('<li data-id="'+ key +'"><div class="segment_type"><i class="fa fa-'+ segment['type'] +'"></i></div><div class="segment_name">'+ segment['name'] +'</div><div class="segment_time" data-time="'+ segment['time'] +'">'+ to_readable_time(segment['time']) +'</div><div class="li_options"><i class="fa fa-pencil"></i><i class="fa fa-trash-o"></i><i class="fa fa-bars"></i></div></li>');
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

// !- Adding Segments.
$(document).on('click', '#btn_addSegment', function(e) {
	e.preventDefault();
	editing = event_settings.next_new_segment_id;
	$('#list_segments').append('<li class="segment_add" data-id="'+ editing +'"><div class="segment_type"><i class="fa fa-film"></i></div><div class="segment_name"><input class="segment_name_edit" type="text" placeholder="Name" /></div><div class="segment_time" data-time=""><input class="segment_time_edit" type="text" placeholder="5:00" /></div><div class="li_options"><i id="btn_segment_add_confirm" class="fa fa-check-circle-o"></i><i id="btn_segment_add_cancel" class="fa fa-times-circle-o"></i></div></li>');
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
	new_segment.type = 'microphone';
	new_segment.name = $(this).parent().parent().find('.segment_name input.segment_name_edit').val();
	new_segment.time = $(this).parent().parent().find('.segment_time input.segment_time_edit').val();
	new_segment.order = event_segments.length + 1;

	socket.get('/event/add_segment/'+ event_id, {
		new_segment: new_segment
	}, function (response) {
    // console.log(response);
  });

	editing = null; // move to build
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

// !- Remote control
socket.on('message', function (data) {
	var res = data['data'];
	if(res.status == 'current_segment') {
		event_settings = res.settings;
		update_current_segment();
	} else if(res.status == 'add_segment') {
		console.log(res);
		event_segments = res.segments.segments;
		// console.log(event_segments);
		event_settings = res.settings;
		// console.log(event_settings);
		build_segments();
	}
});