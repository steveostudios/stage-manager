var mongoose = require('mongoose')
  , Event = mongoose.model('Event')

exports.index = function (req, res) {
  var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0

  Event
    .find({ tags: req.param('tag') })
    .populate('user', 'name')
    .sort({'createdAt': -1}) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, events) {
      if (err) return res.render('500')
      Event.count({ tags: req.param('tag') }).exec(function (err, count) {
        res.render('events/index', {
            title: 'List of Events'
          , events: events
          , page: page
          , pages: count / perPage
        })
      })
    })
}
