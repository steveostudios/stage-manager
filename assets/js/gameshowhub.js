$(function() {
  
  // !- Toggle Settings pane.
  $('#btn_settings').on('click', function(e) {
    e.preventDefault();
    $('#pane_settings').fadeToggle();
  });

  // !- URL display.
  $('#btn_display_url').on('click', function(e) {
    e.preventDefault();
    var overlay_url_fade_dur = 250;
    var content = $(this).attr('data-content');
    if ($('.overlay_url').length === 0) {
			$('body').append('<div class="overlay_url">'+ content +'</div>');

			$('.overlay_url').fadeIn(overlay_url_fade_dur);
      $('.overlay_url').squishy();
    } else {
			$('.overlay_url').fadeOut(overlay_url_fade_dur, function() {
				$('.overlay_url').remove();
			});
		}
  });
});

// !- Save game settings.
function save_settings() {
  game_settings_json = JSON.stringify(game_settings);
  socket.put('/set_settings/'+ game_id, {settings: game_settings_json}, function (response) {
    game_settings = JSON.parse(response.new_settings);
  });
}

// !- Save game data.
function save_data() {
  game_data_json = JSON.stringify(game_data);
  socket.put('/set_data/'+ game_id, {data: game_data_json}, function (response) {
    game_data = JSON.parse(response.new_data);
  });
}

// !- Save game results.
function save_results() {
  game_results_json = JSON.stringify(game_results);
  console.log(game_results_json);
  socket.put('/set_results/'+ game_id, {results: game_results_json}, function (response) {
    console.log(response);
    game_results = JSON.parse(response.new_results);
  });
}

// !- Sorting
function sortByOrder(x,y) {
  return x.order - y.order;
}