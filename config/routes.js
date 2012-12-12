
var mongoose = require('mongoose')
  , Event = mongoose.model('Event')
  , User = mongoose.model('User')
  , async = require('async')
  

module.exports = function (app, passport, auth) {

  // user routes
  var users = require('../app/controllers/users')
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login'}), users.session)
  app.get('/users/:userId', users.show)
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email', 'user_about_me'], failureRedirect: '/login' }), users.signin)
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.signin)
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.authCallback)

  app.param('userId', function (req, res, next, id) {
    User
      .findOne({ _id : id })
      .exec(function (err, user) {
        if (err) return next(err)
        if (!user) return next(new Error('Failed to load User ' + id))
        req.profile = user
        next()
      })
  })
  
  // event routes
  var events = require('../app/controllers/events')
  app.get('/events', events.index)
  app.get('/events/new', auth.requiresLogin, events.new)
  app.post('/events', auth.requiresLogin, events.create)
  app.get('/events/:id', events.show)
  app.get('/stage/:id', events.stage)
  app.get('/events/:id/edit', auth.requiresLogin, auth.event.hasAuthorization, events.edit)
  app.put('/events/:id', auth.requiresLogin, auth.event.hasAuthorization, events.update)
  app.del('/events/:id', auth.requiresLogin, auth.event.hasAuthorization, events.destroy)

  app.param('id', function(req, res, next, id){
    Event
      .findOne({ _id : id })
      .populate('user', 'name')
      .populate('segments', null, null, { sort: 'order' }) //! need to sort by 'order'
      .populate('comments')
      
      .exec(function (err, event) {
        if (err) return next(err)
        if (!event) return next(new Error('Failed to load event ' + id))
        req.event = event
        
        var populateComments = function (comment, cb) {
          User
            .findOne({ _id: comment._user })
            .select('name')
            .exec(function (err, user) {
              if (err) return next(err)
              comment.user = user
              cb(null, comment)
            })
        }
        if (event.comments.length) {
          async.map(req.event.comments, populateComments, function (err, results) {
            next(err)
          })
        }
        else
          next()
      })
  })

  // home route
  app.get('/', events.index)
  
  // comment routes
  var comments = require('../app/controllers/comments')
  app.post('/events/:id/comments', auth.requiresLogin, comments.create)

  // segment routes
  var segments = require('../app/controllers/segments')
  app.post('/events/:id/segments', segments.create)
  app.post('/events/:id/segments/:id', segments.saveRow)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)

}
