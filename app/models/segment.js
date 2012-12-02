// event segment schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var SegmentSchema = new Schema({
  title: {type : String, default : ''}
  , trt: {type : String, default : ''}
  , type: {type : String, default : ''}
  , order: {type : Number, default : 0}
})

mongoose.model('Segment', SegmentSchema)
