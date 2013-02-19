var mongoose = require('mongoose')
  , Event = mongoose.model('Event')
  , Segment = mongoose.model('Segment')
  , _ = require('underscore')

// !--- New Event
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

// !--- Save Event
exports.saveEvent = function (data, res) {
  Event.findOne({ _id: data.eventId }, function(err, event) {
    if (err) { return next(err); }
    event.date = data.eventDate;
    event.series = data.eventSeries;
    event.title = data.eventTitle;
    event.save(function(err) {
      if (err) { return next(err); }
    })
  })
}

// !--- Edit Segment
exports.edit = function (req, res) {
  res.render('events/edit', {
    title: 'Edit '+req.event.title,
    event: req.event
  })
}

// Update an event
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

// Show an event
exports.show = function(req, res){
  res.render('events/show', {
    title: req.event.title,
    event: req.event,
    segments: req.segments,
    comments: req.comments
  })
}

//
exports.stage = function(req, res){
  res.render('events/stage', {
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
    res.redirect('/events')
  })
}

// Listing of Events
exports.index = function(req, res){
  var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0
  Event
    .find({ user: req.user.id })
    .populate('user', 'name')
    .sort({'createdAt': -1}) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, events) {
      if (err) return res.render('500')
      Event.find({user: req.user.id}).count().exec(function (err, count) {
        res.render('events/index', {
            title: 'List of Events'
          , events: events
          , page: page
          , pages: count / perPage
        })
      })
    })
}

//
exports.saveCurrent = function (data, res) {
  Event.findOne({ _id: data.eventId }, function(err, event) {
    if (err) { return next(err); }
    event.current = data.rowId;
    event.currentStart = data.start;
    event.save(function(err) {
      if (err) { return next(err); }
    })
  }) 
}

// Alert
exports.alert = function (data, res) {
  Event.findOne({ _id: data.eventId }, function(err, event) {
    if (err) { return next(err); }
    event.currentAlert = data.alertText;
    event.save(function(err) {
      if (err) { return next(err); }
    })
  }) 
}