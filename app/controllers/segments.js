var mongoose = require('mongoose')
  , Segment = mongoose.model('Segment')

exports.create = function (req, res) {
  var segment = new Segment(req.body)
    , article = req.article


  segment.save(function (err) {
    if (err) throw new Error('Error while saving comment')
    article.segments.push(segment._id)
    article.save(function (err) {
      if (err) throw new Error('Error while saving article')
      res.redirect('/articles/'+article.id+'#segments')
    })
  })
}
