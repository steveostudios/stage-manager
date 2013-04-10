var mongoose = require('mongoose')
  , User = mongoose.model('User')

exports.signin = function (req, res) {}

// auth callback
exports.authCallback = function (req, res, next) {
  res.redirect('/')
}

// login
exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  })
}

// sign up
exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up'
  })
}

// logout
exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

// session
exports.session = function (req, res) {
  req.session.isAdmin = true
  res.redirect('/events')
}

// signup
exports.create = function (req, res) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err) {
    if (err) return res.render('users/signup', { errors: err.errors })
    req.logIn(user, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}

// show profile
exports.show = function (req, res) {
  var user = req.profile
  res.render('users/show', {
      title: user.name
    , user: user
  })
}

// edit
exports.edit = function (req, res) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err) {
    if (err) return res.render('users/signup', { errors: err.errors })
    req.logIn(user, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}
// add alertFav
exports.alertFavAdd = function (req, res) {
  User.findOne({ _id: req.userId }, function(err, user) {
    user.alertFavs.push(req.alertText)
    user.save(function (err) {})
  })
}
// update alertFav
exports.alertFavUpdate = function (req, res) {
  User.findOne({ _id: req.userId }, function(err, user) {
    user.alertFavs = []
    for (var i = 0; i < req.alertFavs.length; i++) {
      user.alertFavs.push(req.alertFavs[i]);
    }
    user.save(function (err) {})
  })
}