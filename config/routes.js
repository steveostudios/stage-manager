
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
  app.post('/users/access', passport.authenticate('accesskey', {failureRedirect: '/login'}), users.access)
  app.get('/users/:userId', users.show)

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
  app.get('/events', auth.requiresLogin, events.index)
  app.get('/events/new', auth.requiresLogin, events.new)
  app.post('/events', auth.requiresLogin, events.create)
  app.get('/events/:id', auth.requiresLogin, events.show)
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
  app.get('/', users.login)
  
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
