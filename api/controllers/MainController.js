/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: Logic for handling site-wide requests.
 */

module.exports = {

  index: function (req, res) {
    if (req.session.user) {
      async.auto({
        events: function (cb) {
          Events.find()
            .where({'owner':req.session.user.id})
            .limit(15)
            .sort('createdAt DESC')
            .exec(cb);
        }
      },
      function allDone (err, async_data) {
        if (err) return res.serverError(err);
        var events = async_data.events;
        res.view({
          username: req.session.user.username,
          events: events
        });
      });
    } else {
      res.redirect('login');
    }
  },

  login: function (req, res) {
    res.view({
      _layoutFile: '../layouts/login.ejs',
    });
  },

  signup: function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    // Users.findByUsername(username)...
    // In v0.9.0 the find method returns an empty array when no results are found
    // when only one result is needed use findOne.
    Users.findOneByUsername(username)
    .done(function signupfindUser(err, usr){
      if (err) {
        // We set an error header here,
        // which we access in the views an display in the alert call.
        res.set('error', 'DB Error');
        // The error object sent below is converted to JSON
        res.send(500, { error: "DB Error" });
      } else if (usr) {
        // Set the error header
        res.set('error', 'Username already Taken');
        res.send(400, { error: "Username already Taken"});
      } else {
        var hasher = require("password-hash");
        password = hasher.generate(password);

        Users.create({ username: username, password: password })
        .done(function signupCreateUser(error, user) {
          if (error) {
            // Set the error header
            res.set('error', 'DB Error');
            res.send(500, { error: "DB Error" });
          } else {
            req.session.user = user;
            res.send(user);
          }
        });
      }
    });
  },

  doLogin: function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    Users.findOneByUsername(username)
    .done(function loginfindUser(err, usr){
      if (err) {
        // We set an error header here,
        // which we access in the views an display in the alert call.
        res.set('error', 'DB Error');
        // The error object sent below is converted to JSON
        res.send(500, { error: "DB Error" });
      } else {
        if (usr) {
          var hasher = require("password-hash");
          if (hasher.verify(password, usr.password)) {
            req.session.user = usr;
            res.send(usr);
          } else {
            // Set the error header
            res.set('error', 'Wrong Password');
            res.send(400, { error: "Wrong Password" });
          }
        } else {
          res.set('error', 'User not Found');
          res.send(404, { error: "User not Found"});
        }
      }
    });
  },

  logout: function (req, res) {
    req.session.destroy();
    res.redirect('/');
  },

  account: function (req, res) {
    if (req.session.user) {
      res.view({
        username: req.session.user.username,
        fname: req.session.user.fname,
        lname: req.session.user.lname
      });
    } else {
      res.redirect('login');
    }
  },

  event: function (req, res) {
    var id = req.param('id');
    if (id === undefined) {
      res.redirect('/code');
    } else {
      Events.findOne(id).exec(function(err, event) {
        //if (req.session.user) { // !- TODO: Needed for sessionig - KEEP.
          res.view({
            _layoutFile: '../layouts/event.ejs',
            //username: req.session.user.username, // !- TODO: Needed for sessionig - KEEP.
            event_id: id,
            event_segments: event.segments,
            event_settings: event.settings
          });
        //} else { // !- TODO: Needed for sessionig - KEEP.
          //res.redirect('/'); // !- TODO: Needed for sessionig - KEEP.
        //} // !- TODO: Needed for sessionig - KEEP.
      });
    }
  },

  set_settings: function (req, res) {
    var id = req.param('id');
    var settings = req.param('settings');
    Games.findOne(id).done(function(err, game) {
      game.settings = settings;
      game.save(function(error) {
        // console.log(error);
      });
      res.json({
        success: true,
        new_settings: settings
      });
    });
  },

// !- TODO: NOT COMPLETE - Haven't used yet, so haven't needed it yet.
  get_settings: function (req, res) {
   id = req.param('id');
   Games.findOne(id).exec(function(err, game) {
     res.json({
        get_success: true
      });
    });
  },

  set_data: function (req, res) {
    var id = req.param('id');
    var data = req.param('data');
    Games.findOne(id).done(function(err, game) {
      game.data = data;
      game.save(function(error) {
        // console.log(error);
      });
      res.json({
        success: true,
        new_data: data
      });
    });
  },

  remote: function (req, res) {
    var id = req.param('id');
    if (id === undefined) {
      res.redirect('/code');
    } else {
      Games.findOne(id).exec(function(err, game) {
        res.view(game.type +'/remote', {
          _layoutFile: '../layouts/remote.ejs',
          appname: 'Spin That Wheel',
          appslug: game.type,
          game_id: id,
          game_data: game.data,
          game_settings: game.settings,
          game_results: game.results
        });
      });
    }
  },

  code: function (req, res) {
    res.view({
      _layoutFile: '../layouts/remote.ejs',
      appname: '---',
      appslug: '---'
    });
  },

  subscribe: function (req, res) {
    var id = req.param('id');
    Events.findOne(id).exec(function(err, event) {
      Events.subscribe(req.socket , event);
      // console.log('subscribed');
    });
  },


};
