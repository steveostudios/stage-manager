
var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , AccessKeyStrategy = require('passport-accesskey').Strategy
  , User = mongoose.model('User')

exports.boot = function (passport, config) {

  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
  ))
  
  // use accesskey strategy
  passport.use(new AccessKeyStrategy({
      usernameField: 'accesskey'
    },
    function(accesskey, done) {
      User.findOne({ accesskey: accesskey }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown Access Key' })
        }
        return done(null, user)
      })
    }
  ))
}