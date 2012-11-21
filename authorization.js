
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  next()
};


/*
 *  User authorizations routing middleware
 */

exports.user = {
    hasAuthorization : function (req, res, next) {
      if (req.profile.id != req.user.id) {
        return res.redirect('/users/'+req.profile.id)
      }
      next()
    }
}


/*
 *  Event authorizations routing middleware
 */

exports.event = {
    hasAuthorization : function (req, res, next) {
      if (req.event.user.id != req.user.id) {
        return res.redirect('/events/'+req.event.id)
      }
      next()
    }
}
