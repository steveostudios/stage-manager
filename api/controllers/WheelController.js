/**
 * SpinthatwheelController
 *
 * @module		:: Controller
 * @description	:: Logic for Spinthatwheel game.
 */

module.exports = {

	spin: function (req, res) {
		var id = req.param('id');
		Games.publishUpdate( id, {
			status: 'spin'
		});
	},

	spin_complete: function (req, res) {
		var id = req.param('id');
		Games.publishUpdate( id, {
			status: 'spin_complete'
		});
	}

};