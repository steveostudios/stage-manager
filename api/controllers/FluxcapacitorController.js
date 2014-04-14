/**
 * FluxcapacitorController
 *
 * @module		:: Controller
 * @description	:: Logic for Fluxcapacitor game.
 */

module.exports = {

	play: function (req, res) {
		var id = req.param('id');
		Fluxcapacitor.findOne(id).exec(function(err, game) {
			if (req.session.user) {
				res.view({
					_layoutFile: '../layouts/game.ejs',
					appname: 'Flux Capacitor',
					appslug: 'Fluxcapacitor',
					username: req.session.user.username,
					gameid: id,
					prizes: game.data
				});
			} else {
				res.redirect('/');
			}
		});
	},

	new: function (req, res) {
		if (req.session.user) {
			Fluxcapacitor.create({ owner: req.session.user.id, name: 'My New Flux Capacitor Game' })
			.done(function(err,model) {
					// Error handling
				if (err) {
					res.send('Error: Sorry! Something went Wrong');
				} else {
					res.redirect('fluxcapacitor/play/'+model.id);
				}
			});
		} else {
			res.redirect('/');
		}
	}

};