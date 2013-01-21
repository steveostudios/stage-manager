var mongoose = require('mongoose')
  , Segment = mongoose.model('Segment')
  , Event = mongoose.model('Event')

// !--- Save Segment
exports.saveRow = function (data, res) {
  Segment.findOne({ _id: data.rowId }, function(err, segment) {
    if (err) {return next(err); }
    segment.type = data.rowType;
    segment.title = data.rowTitle;
    segment.trt = data.rowTrt;
    segment.order = data.rowOrder;
    segment.save(function(err) {
      if (err) {return next(err); }
    })
  })
}

// !--- Create Segment
exports.createRow = function (data, res) {
  var segment = new Segment(); 
  segment.type = data.rowType;
  segment.title = data.rowTitle;
  segment.trt = data.rowTrt;
  segment.order = data.rowOrder;  
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
  return segment._id;
}

// !--- Remove Segment
exports.removeRow = function (data, res) {
  Event.findOne({ _id: data.eventId }, function(err, event) {
    if (err) { return next(err); }
    var index = event.segments.indexOf(data.rowId);
    if(index >= 0) {
      event.segments.splice(index, 1);
      event.save(function(err) {
        if (err) { return next(err); }
      })
    }
  })
  Segment.findOne({ _id: data.rowId }, function(err, segment) {
    if (err) {return next(err); }
    segment.remove();
  })
}

// !--- Reorder Segments
exports.reorderRows = function (data, res) {
  var i = 0;
  data.sortedIds.forEach(function(id) {
    Segment.update({_id: id},{order: i},null,null);
    i++;
  })
}

// !--- Save Current Segment
exports.saveCurrent = function (data, res) {
  Segment.findOne({ _id: data.rowId }, function(err, segment) {
    if (err) {return next(err); }
    segment.start = data.start;
    segment.save(function(err) {
      if (err) {return next(err); }
    })
  })
}