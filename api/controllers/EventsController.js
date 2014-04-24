/**
 * Poll
 *
 * @module		:: Controller
 * @description	:: Logic for Poll game.
 */

module.exports = {

	add_segment: function (req, res) {
		id = req.param('id');
		new_segment = req.param('new_segment');
		Events.findOne(id).done(function(err, event) {
			var segments = event.segments.segments;
			segments.push(new_segment);
			event.segments.segments = segments;
			var next_new_segment_id = event.settings.next_new_segment_id;
			next_new_segment_id = next_new_segment_id + 1;
			event.settings.next_new_segment_id = next_new_segment_id;
			event.save(function(error) {
				// console.log(error);
				Events.publishUpdate( id, {
					status: 'add_segment',
					event: event
				});
			});
		});
	},

	reorder_segments: function (req, res) {
		id = req.param('id');
		reordered_segment_id_array = req.param('reordered_segment_id_array');
		Events.findOne(id).done(function(err, event) {
			var segments = event.segments.segments;
			for(var i=0; i<segments.length; i++) {
				segments[i].order = reordered_segment_id_array.indexOf(String(segments[i].id));
			}
			event.segments.segments = segments;
			event.save(function(error) {
				// console.log(error);
				Events.publishUpdate( id, {
					status: 'reorder_segments',
					event: event
				});
			});
		});
	},

	edit_segment: function (req, res) {
		id = req.param('id');
		edit_segment = req.param('edit_segment');
		var edit_segment_id = edit_segment.id;
		Events.findOne(id).done(function(err, event) {
			var segments = event.segments.segments;
			console.log(edit_segment_id);
			for(var i=0; i<segments.length; i++) {
				if(parseInt(segments[i].id, 10) === parseInt(edit_segment_id, 10)) {
					segments[i] = edit_segment;
				}
			}
			event.segments.segments = segments;
			event.save(function(error) {
				// console.log(error);
				Events.publishUpdate( id, {
					status: 'edit_segment',
					event: event
				});
			});
		});
	},

	remove_segment: function (req, res) {
		id = req.param('id');
		remove_segment_id = req.param('remove_segment_id');
		Events.findOne(id).done(function(err, event) {
			var segments = event.segments.segments;
			for(var i=0; i<segments.length; i++) {
				if(parseInt(segments[i].id, 10) === parseInt(remove_segment_id, 10)) {
					segments.splice(i);
				}
			}
			event.segments.segments = segments;
			event.save(function(error) {
				// console.log(error);
				Events.publishUpdate( id, {
					status: 'remove_segment',
					event: event
				});
			});
		});
	}

};