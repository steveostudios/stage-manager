var init = true;

var editing = null;

var segments = [];

var prize_lookup = {};

var remove_this_prize = null;

var remove_last_prize_turned_on = null;

var themes = {
  "Sunny_Beach" : ["96ceb4","ffeead","ff6f69","ffcc5c","aad8b0"],
	"TxT-8" : ["cccccc","333333","00aab5","c9e000","ed4200"]
};

var size = {
	width: window.innerWidth || document.body.clientWidth,
	height: window.innerHeight || document.body.clientHeight
};

var wheel = {
	timerHandle : 0,
	timerDelay : 33,
	angleCurrent : 0,
	angleDelta : 0,
	size : size.height/2,
	canvasContext : null,
	segments : [],
	maxSpeed : Math.PI / 16,
	upTime : 1000, // How long to spin up for (in ms) - 1000
	downTime : 17000, // How long to slow down for (in ms) - 17000
	spinStart : 0,
	frames : 0,
	centerX : size.width/4,
	centerY : size.height/2,
	spin : function() {
		if(settings.spin_duration == 20) {
			wheel.upTime = 1000;
			wheel.downTime = 17000;
		} else if(settings.spin_duration == 15) {
			wheel.upTime = 750;
			wheel.downTime = 12750;
		} else if(settings.spin_duration == 10) {
			wheel.upTime = 500;
			wheel.downTime = 8500;
		} else if(settings.spin_duration == 5) {
			wheel.upTime = 250;
			wheel.downTime = 4250;
		}
		// Start the wheel only if it's not already spinning
		if (wheel.timerHandle === 0) {
			disable_editing();
			if(settings.remove_last_prize === true) {
				if(remove_last_prize_turned_on === false) {
					remove_last_prize(remove_this_prize);
				} else {
					remove_last_prize_turned_on = false;
				}
			}
			wheel.spinStart = new Date().getTime();
			wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
			wheel.frames = 0;
			wheel.sound.play();
			wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
		}
	},
	weak_spin: function() {
		wheel.upTime = 250; // How long to spin up for (in ms) - 1000
		wheel.downTime = 2000; // How long to slow down for (in ms) - 17000
		if (wheel.timerHandle === 0) {
			disable_editing();
			wheel.spinStart = new Date().getTime();
			wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
			wheel.frames = 0;
			wheel.sound.play();
			wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
		}
	},
	onTimerTick : function() {
		wheel.frames++;
		wheel.draw();
		var duration = (new Date().getTime() - wheel.spinStart);
		var progress = 0;
		var finished = false;
		if (duration < wheel.upTime) {
			progress = duration / wheel.upTime;
			wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2);
		} else {
			progress = duration / wheel.downTime;
			wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2 + Math.PI / 2);
			if (progress >= 1) {
				finished = true;
			}
		}
		wheel.angleCurrent += wheel.angleDelta;
		while (wheel.angleCurrent >= Math.PI * 2)
			// Keep the angle in a reasonable range
			wheel.angleCurrent -= Math.PI * 2;
		if (finished) {
			clearInterval(wheel.timerHandle);
			wheel.timerHandle = 0;
			wheel.angleDelta = 0;
			var i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2))	* wheel.segments.length) - 1;
			if(settings.remove_last_prize === true) {
				remove_this_prize = i;
			}
			$.get('/wheel/spin_complete/'+ gameid);
			for (var key in prize_lookup) {
				if (prize_lookup.hasOwnProperty(key)) {
					if (prize_lookup[key] == remove_this_prize) {
						remove_this_prize = key;
					}
				}
			}
			enable_editing();
		}
	},
	init : function(optionList) {
		try {
			wheel.initAudio();
			wheel.initCanvas();
			wheel.draw();
			$.extend(wheel, optionList);
		} catch (exceptionData) {
			alert('Wheel is not loaded ' + exceptionData);
		}
	},
	initAudio : function() {
		var sound = document.createElement('audio');
		sound.setAttribute('src', '/games/spinthatwheel/audio/wheel.mp3');
		wheel.sound = sound;
	},
	initCanvas : function() {
		var canvas = $('#wheel #canvas').get(0);
		wheel.canvasContext = canvas.getContext("2d");
	},
	update : function() {
		// Ensure we start mid way on a item
		//var r = Math.floor(Math.random() * wheel.segments.length);
		var r = 0;
		wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * Math.PI * 2;
		var segments = wheel.segments;
		var len      = segments.length;
		wheel.draw();
	},
	draw : function() {
		wheel.clear();
		wheel.drawWheel();
		wheel.drawNeedle();
	},
	clear : function() {
		var ctx = wheel.canvasContext;
		ctx.clearRect(0, 0, size.width, size.height);
	},
	drawNeedle : function() {
		var ctx = wheel.canvasContext;
		var centerX = wheel.centerX;
		var centerY = wheel.centerY;
		var size = wheel.size;
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.fileStyle = '#ffffff';
		ctx.beginPath();
		ctx.moveTo(centerX + size - 40, centerY);
		ctx.lineTo(centerX + size + 20, centerY - 10);
		ctx.lineTo(centerX + size + 20, centerY + 10);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		// Which segment is being pointed to?
		var i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2))	* wheel.segments.length) - 1;
		// Now draw the winning name
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillStyle = '#000000';
		ctx.font = "2em Arial";
		ctx.fillText(wheel.segments[i], centerX + size + 25, centerY);
	},
	drawSegment : function(key, lastAngle, angle) {
		var ctx = wheel.canvasContext;
		var centerX = wheel.centerX;
		var centerY = wheel.centerY;
		var size = wheel.size;
		var segments = wheel.segments;
		var len = wheel.segments.length;
		// var colors = wheel.seg_color;
		var value = prizes[key].name;
		ctx.save();
		ctx.beginPath();
		// Start in the centre
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw a arc around the edge
		ctx.lineTo(centerX, centerY); // Now draw a line back to the centre
		// Clip anything that follows to this area
		//ctx.clip(); // It would be best to clip, but we can double performance without it
		ctx.closePath();
		ctx.fillStyle = '#'+ themes[settings.theme][prizes[key].color];
		ctx.fill();
		ctx.stroke();
		// Now draw the text
		ctx.save(); // The save ensures this works on Android devices
		ctx.translate(centerX, centerY);
		ctx.rotate((lastAngle + angle) / 2);
		ctx.fillStyle = '#ffffff';
		ctx.fillText(value.substr(0, 20), size / 2 + 20, 0);
		ctx.restore();
	},
	drawWheel : function() {
		var ctx = wheel.canvasContext;
		var angleCurrent = wheel.angleCurrent;
		var lastAngle    = angleCurrent;
		var segments  = wheel.segments;
		var len       = wheel.segments.length;
		var centerX = wheel.centerX;
		var centerY = wheel.centerY;
		var size    = wheel.size;
		var PI2 = Math.PI * 2;
		ctx.lineWidth    = 1;
		ctx.strokeStyle  = '#000000';
		ctx.textBaseline = "middle";
		ctx.textAlign    = "center";
		ctx.font         = "1.4em Arial";
		for (var i = 1; i <= len; i++) {
			var angle = PI2 * (i / len) + angleCurrent;
			wheel.drawSegment(i - 1, lastAngle, angle);
			lastAngle = angle;
		}
		// Draw a center circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, 20, 0, PI2, false);
		ctx.closePath();

		ctx.fillStyle   = '#ffffff';
		ctx.strokeStyle = '#000000';
		ctx.fill();
		ctx.stroke();

		// Draw outer circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, size, 0, PI2, false);
		ctx.closePath();

		ctx.lineWidth   = 10;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
	}
};

// !- Sorting
function sortByOrder(x,y) {
  return x.order - y.order;
}

function buildWheel() {
	$('ul#prizes').html('');
	prizes.sort(sortByOrder);
	prizes.forEach(function (prize, i, arr) {
    prize_lookup[prize.id] = i;
	});
	if (editing !== null) {
		saveData();
	}
	for (var key in prizes) {
		if (prizes.hasOwnProperty(key)) {
			var val = prizes[key];
			$('ul#prizes').append('<li class="list-prize" data-id="'+ val.id +'">'+ val.name +' <button class="btn btn-default btn-xs btn_edit_prize"><i class="fa fa-pencil"></i></button><button class="btn btn-danger btn-xs btn_destroy_prize"><i class="fa fa-trash-o"></i></button></li>');
		}
  }
  $('ul#prizes').sortable({
		axis: 'y',
		disabled: false
  });
	if(prizes.length >= 15) {
		$('#btn_add_prize').attr('disabled', 'disabled');
	} else {
		$('#btn_add_prize').removeAttr('disabled');
	}
	if(prizes.length <= 1) {
		$('#btn_spin').attr('disabled', 'disabled');
	} else {
		$('#btn_spin').removeAttr('disabled');
	}
	segments = [];
	for (i = 0; i < prizes.length; ++i) {
    segments.push(prizes[i].name);
	}
	wheel.segments = segments;
	if (init === true) {
		wheel.init();
		init = false;
	}
	wheel.update();
}

function saveData() {
	data.prizes = prizes;
	data.settings = settings;
	socket.put('/spinthatwheel/'+ gameid, {data: data}, function (response) {
		editing = null;
		socket.get('/spinthatwheel/'+ gameid, function (response) {
			prizes = response.data.prizes;
			settings = response.data.settings;
		});
	});
}

// !- Disable Editing
function disable_editing() {
	if(isNaN(editing) === false ) {
		buildWheel();
	}
	$('#btn_add_prize').attr('disabled', 'disabled');
	$('#btn_settings').attr('disabled', 'disabled');
	$('#btn_spin').attr('disabled', 'disabled');
	$('#btn_weakspin').attr('disabled', 'disabled');
	$('.btn_edit_prize').attr('disabled', 'disabled');
	$('.btn_destroy_prize').attr('disabled', 'disabled');
	$('ul#prizes').sortable({disabled: true});
	$('#ckbx_remove_last_prize').attr('disabled', 'disabled');
	$('#dpdn_themes').attr('disabled', true);
	$('#dpdn_spin_duration').attr('disabled', true);
}

// !- Enable Editing
function enable_editing() {
	$('#btn_add_prize').removeAttr('disabled');
	$('#btn_settings').removeAttr('disabled');
	$('#btn_spin').removeAttr('disabled');
	$('#btn_weakspin').removeAttr('disabled');
	$('.btn_edit_prize').removeAttr('disabled');
	$('.btn_destroy_prize').removeAttr('disabled');
	$('ul#prizes').sortable({disabled: false});
	$('#ckbx_remove_last_prize').removeAttr('disabled');
	$('#dpdn_themes').removeAttr('disabled');
	$('#dpdn_spin_duration').removeAttr('disabled');

}

// !- Add Prize
$(document).on('click', '#btn_add_prize', function(e) {
	e.preventDefault();
	if ($('#inp_add_prize').val() !== '') {
		editing = settings.next_prize_id;
		var order = prizes.length + 1;
		var name = $('#inp_add_prize').val();
		var color = $(this).parent().find('.color_picker .selected').attr('data-id');
		var new_prize = {"id":editing,"name":name,"color":color,"size":1,"order":order};
		prizes.push(new_prize);
		$('#inp_add_prize').val('');
		settings.next_prize_id++;
		var new_select = prizes.length % themes[settings.theme].length;
		$('.new_prize_color').removeClass('selected');
		$('.new_prize_color[data-id="'+ new_select +'"]').addClass('selected');
		buildWheel();
	}
});

$(document).on('click', '.new_prize_color', function(e) {
	e.preventDefault();
	$('.new_prize_color').removeClass('selected');
	$(this).addClass('selected');
});

// !- Edit Prize
$(document).on('click', '.btn_edit_prize', function(e) {
	if (editing === null) {
		e.preventDefault();
		var id = $(this).parent().attr('data-id');
		var color_picker = '';
		themes[settings.theme].forEach(function (color, i) {
			var selected = '';
			if (prizes[prize_lookup[id]].color == i) {
				selected = ' selected';
			}
			color_picker += '<li class="edit_prize_color'+ selected +'" data-id="'+ i +'" data-color="'+ color +'" style="background: #'+ color +';"></li>';
		});
		$(this).parent().html('<input type="text" class="inp_name" value="'+ prizes[prize_lookup[id]].name +'" /><button class="btn btn-success btn-xs btn_edit_prize_confirm"><i class="fa fa-check-circle"></i></button><button class="btn btn-default btn-xs btn_edit_prize_deny"><i class="fa fa-ban"></i></button><ul class="color_picker">'+ color_picker +'</ul>');
		editing = id;
		$('ul#prizes').sortable({disabled: true});
	}
});

$(document).on('click', '.edit_prize_color', function(e) {
	e.preventDefault();
	$('.edit_prize_color').removeClass('selected');
	$(this).addClass('selected');
});

$(document).on('click', '.btn_edit_prize_confirm', function(e) {
	if (editing !== null) {
		e.preventDefault();
		var new_prize_name = $(this).parent().find('.inp_name').val();
		var new_prize_color = $(this).parent().find('.color_picker .selected').attr('data-id');
		prizes[prize_lookup[editing]].name = new_prize_name;
		prizes[prize_lookup[editing]].color = new_prize_color;
		buildWheel();
	}
});

$(document).on('click', '.btn_edit_prize_deny', function(e) {
	if (editing !== null) {
		e.preventDefault();
		buildWheel();
	}
});

// !- Destroy Prize
$(document).on('click', '.btn_destroy_prize', function(e) {
	if (editing === null) {
		e.preventDefault();
		var id = $(this).parent().attr('data-id');
		$(this).parent().html(prizes[prize_lookup[id]].name +'<button class="btn btn-success btn-xs btn_destroy_prize_confirm"><i class="fa fa-check-circle"></i></button><button class="btn btn-default btn-xs btn_destroy_prize_deny"><i class="fa fa-ban"></i></button></i></button>');
		editing = id;
		$('ul#prizes').sortable({disabled: true});
	}
});

$(document).on('click', '.btn_destroy_prize_confirm', function(e) {
	if (editing !== null) {
		e.preventDefault();
		var id = prize_lookup[editing];
		prizes.splice(id, 1);
		prizes.forEach(function (prize, i) {
			prize.order = i+1;
		});
		buildWheel();
	}
});

$(document).on('click', '.btn_destroy_prize_deny', function(e) {
	if (editing !== null) {
		e.preventDefault();
		buildWheel();
	}
});

// !- Destory Last Prize
$(document).on('change', '#ckbx_remove_last_prize', function(e) {
	if ($('#ckbx_remove_last_prize').is(':checked')) {
		settings.remove_last_prize = true;
		remove_last_prize_turned_on = true;
	} else {
		settings.remove_last_prize = false;
		remove_last_prize_turned_on = null;
	}
	saveData();
});

function remove_last_prize(id) {
	editing = id;
	for (var key in prize_lookup) {
		if (prize_lookup.hasOwnProperty(key)) {
			if (key == id) {
				var val = prize_lookup[key];
				prizes.splice(val, 1);
			}
		}
	}
	prizes.forEach(function (prize, i) {
		prize.order = i+1;
	});
	remove_this_prize = null;
	buildWheel();
}

// !- Sort Prizes
$(document).on('sortstop', 'ul#prizes', function(event, ui) {
	editing = 'sort';
	var sorted_prizes = $('ul#prizes').sortable('toArray', {attribute: 'data-id'});
	for (i = 0; i < sorted_prizes.length; ++i) {
		prizes[prize_lookup[sorted_prizes[i]]].order = i;
	}
	buildWheel();
});

// !- Spin That Wheel
$('#btn_spin').on('click', function(e) {
  e.preventDefault();
  wheel.spin();
});

// !- Weak Spin
$('#btn_weakspin').on('click', function(e) {
  e.preventDefault();
  wheel.weak_spin();
});

// !- Themes
$(document).on('change', '#dpdn_themes', function(e) {
	editing = 'theme';
	var new_theme = $(this).val();
	settings.theme = new_theme;
	change_theme();
	buildWheel();
});

function change_theme() {
	var color_picker = '';
	var new_select = prizes.length % themes[settings.theme].length;
	themes[settings.theme].forEach(function (color, i) {
		var selected = '';
		if(new_select ==i) {
			selected = ' selected';
		}
		color_picker += '<li class="new_prize_color'+ selected +'" data-id="'+ i +'" data-color="'+ color +'" style="background: #'+ color +';"></li>';
	});
	$('#new_color_picker').html(color_picker);
}

// !- Spin Duration
$(document).on('change', '#dpdn_spin_duration', function(e) {
	editing = 'spin_duration';
	var new_spin_duration = $(this).val();
	settings.spin_duration = new_spin_duration;
	saveData();
	editing = null;
});

// !- Document Ready
$( document ).ready(function() {
	buildWheel();
	if (settings.remove_last_prize === true) {
		$('#ckbx_remove_last_prize').prop('checked', true);
	}
	$('#dpdn_themes option[value='+ settings.theme +']').prop('selected', true);
	change_theme();
	$('#dpdn_spin_duration option[value='+ settings.spin_duration +']').prop('selected', true);
});

// !- Remote control
socket.on('message', function (data) {
	if(data['data'].status == 'spin') {
		wheel.spin();
	} else if(data['data'].status == 'spin_complete') {
		enable_editing();
	}
});
