var mongoose = require('mongoose')
  , Segment = mongoose.model('Segment')

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

exports.saveRow = function (req, res) {
  console.log('saved')
}
