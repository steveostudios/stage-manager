
var mongoose = require('mongoose')
  , Event = mongoose.model('Event')
  , _ = require('underscore')

// New event
exports.new = function(req, res){
  res.render('events/new', {
      title: 'New Event'
    , event: new Event({})
  })
}


// Create an event
exports.create = function (req, res) {
  
  var event = new Event(req.body)
  event.user = req.user

  event.save(function(err){
    if (err) {
      res.render('events/new', {
          title: 'New Events'
        , event: event
        , errors: err.errors
      })
    }
    else {
      res.redirect('/events/'+event._id)
    }
  })
}


// Edit an event
exports.edit = function (req, res) {
  res.render('events/edit', {
    title: 'Edit '+req.event.title,
    event: req.event
  })
}


// Update event
exports.update = function(req, res){
  var event = req.event

  event = _.extend(event, req.body)

  event.save(function(err, doc) {
    if (err) {
      res.render('events/edit', {
          title: 'Edit Event'
        , event: event
        , errors: err.errors
      })
    }
    else {
      res.redirect('/events/'+event._id)
    }
  })
}


// View an event
exports.show = function(req, res){
  res.render('events/show', {
    title: req.event.title,
    event: req.event,
    segments: req.segments,
    comments: req.comments
  })
}


// Delete an event
exports.destroy = function(req, res){
  var event = req.event
  event.remove(function(err){
    // req.flash('notice', 'Deleted successfully')
    res.redirect('/events')
  })
}


// Listing of Events
exports.index = function(req, res){
  var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0

  Event
    .find({})
    .populate('user', 'name')
    .sort({'createdAt': -1}) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, events) {
      if (err) return res.render('500')
      Event.count().exec(function (err, count) {
        res.render('events/index', {
            title: 'List of Events'
          , events: events
          , page: page
          , pages: count / perPage
        })
      })
    })
}
