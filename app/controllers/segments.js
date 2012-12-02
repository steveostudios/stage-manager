var mongoose = require('mongoose')
  , Segment = mongoose.model('Segment')
  , Event = mongoose.model('Event')
  
//var events = require('events')

/*
exports.create = function (req, res) {
  var segment = new Segment(req.body)
    , event = req.event


  segment.save(function (err) {
    if (err) throw new Error('Error while saving comment')
    event.segments.push(segment._id)
    event.save(function (err) {
      if (err) throw new Error('Error while saving event')
      res.redirect('/events/'+event.id+'#segments')
    })
  })
}
*/

exports.saveRow = function (data, res) {
  Segment.findOne({_id: data.rowId }, function(err, segment) {
    if (err) {return next(err); }
    segment.title = data.rowTitle;
    segment.trt = data.rowTrt;
    segment.save(function(err) {
      if (err) {return next(err); }
    })
  })
  console.log('saved')
}

exports.createRow = function (data, res) {
  var segment = new Segment();
    
  segment.title = data.rowTitle;
  segment.trt = data.rowTrt;
  
  segment.save(function (err) {
    if (err) throw new Error('Error while saving comment')
    Event.findOne({_id: data.eventId}, function(err, event) {
      if (err) {return next(err); }
      event.segments.push(segment._id)
      event.save(function (err) {
        if (err) throw new Error('Error while saving event')
      })
    })
  })
}

