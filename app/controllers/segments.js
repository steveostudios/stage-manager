var mongoose = require('mongoose')
  , Segment = mongoose.model('Segment')
  , Event = mongoose.model('Event')

exports.saveRow = function (data, res) {
  Segment.findOne({ _id: data.rowId }, function(err, segment) {
    if (err) {return next(err); }
    segment.title = data.rowTitle;
    segment.trt = data.rowTrt;
    segment.save(function(err) {
      if (err) {return next(err); }
    })
  })
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

exports.removeRow = function (data, res) {
  Segment.findOne({ _id: data.rowId }, function(err, segment){
    if (err) {return next(err); }
    segment.remove();
  })
  Event.findOne({ _id: data.eventId }, function(err, event) {
    if (err) { return next(err); }
    var index = event.segments.indexOf("50bcab0828fc27f3f8000001");
    console.log(index);
    event.segments.splice(index, 1);
    console.log('the deed is done');
    event.save(function(err) {
      if (err) { return next(err); }
    })
  })
}

